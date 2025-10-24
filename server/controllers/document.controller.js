import Document from "../models/Document.model.js"
import { processDocument } from '../services/document.processor.js'
import { getEmbeddings } from '../services/ai.service.js'
import { addVectors } from '../services/vector.service.js'
import Notebook from '../models/Notebook.model.js';
import iconv from 'iconv-lite';


export const getMyDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ owner: req.user._id })
        res.json({ success: true, data: documents })
    } catch (error) {
        next(error)
    }
}




export const uploadDocument = async (req, res, next) => {
    if (!req.file) {
        return next(new Error('Lütfen bir dosya yükleyin'));
    }

    const { notebookId } = req.params;
    let document;
    const decodedFileName = iconv.decode(Buffer.from(req.file.originalname, 'latin1'), 'utf8');

    try {
        const notebook = await Notebook.findById(notebookId);
        if (!notebook) throw new Error('Notebook bulunamadı');
        if (notebook.owner.toString() !== req.user._id.toString()) {
            throw new Error('Bu notebook için yetkiniz yok');
        }

        // Issue 1 Fix: Check for existing document
        let existingDocument = await Document.findOne({
            owner: req.user._id,
            fileName: decodedFileName,
        });

        if (existingDocument) {
            // Document already exists, just associate it with the notebook
            if (!notebook.associatedDocuments.includes(existingDocument._id)) {
                notebook.associatedDocuments.push(existingDocument._id);
                await notebook.save();
            }
            return res.status(200).json({ success: true, data: existingDocument, message: 'Document already exists and has been associated.' });
        }

        // Issue 2 Fix: Create document and handle potential failure
        document = await Document.create({
            owner: req.user._id,
            fileName: decodedFileName,
            status: 'processing',
        });

        try {
            const chunks = await processDocument(req.file.path, req.file.mimetype);
            const embeddings = await getEmbeddings(chunks);
            const tableName = `doc_${document._id.toString()}`;
            await addVectors(tableName, chunks, embeddings);

            document.status = 'ready';
            document.vectorTableName = tableName;
            await document.save();
        } catch (processingError) {
            // If processing fails, delete the created document
            await Document.findByIdAndDelete(document._id);
            throw processingError; // Re-throw the error
        }


        notebook.associatedDocuments.push(document._id);
        await notebook.save();

        res.status(201).json({ success: true, data: document });

    } catch (error) {
        next(error);
    }
};