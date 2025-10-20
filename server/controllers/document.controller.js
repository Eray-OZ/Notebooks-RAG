import Document from "../models/Document.model.js"
import { processDocument } from '../services/document.processor.js'
import { getEmbeddings } from '../services/ai.service.js'
import { addVectors } from '../services/vector.service.js'


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
        res.status(400);
        return next(new Error("Please upload a file"));
    }

    let document;

    try {
        // 1. Create the initial document record
        document = await Document.create({
            owner: req.user._id,
            fileName: req.file.originalname,
            status: 'processing' // Initial status
        });

        // 2. Immediately send a 202 Accepted response to the client
        res.status(202).json({ 
            success: true, 
            message: "File uploaded. Processing has started in the background.",
            data: document 
        });

        // 3. Start the long-running process in the background (fire-and-forget)
        (async () => {
            try {
                console.log("Background process starting for: " + document.fileName);

                const chunks = await processDocument(req.file.path, req.file.mimetype);
                const embeddings = await getEmbeddings(chunks);
                const tableName = `doc_${document._id.toString()}`;
                await addVectors(tableName, chunks, embeddings);

                document.status = 'ready';
                document.vectorTableName = tableName;
                await document.save();

                console.log("Background process finished successfully for: " + document.fileName);
            } catch (error) {
                console.error(`Error during background processing for ${document.fileName}:`, error);
                // Update document status to 'error' on failure
                const docToUpdate = await Document.findById(document._id);
                if (docToUpdate) {
                    docToUpdate.status = 'error';
                    await docToUpdate.save();
                }
            }
        })();

    } catch (error) {
        // This will now only catch errors from the initial Document.create()
        next(error);
    }
}