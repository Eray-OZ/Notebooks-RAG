import Document from "../models/Document.model.js"
import { processDocument } from '../services/document.processor.js'
import { getEmbeddings } from '../services/ai.service.js'
import { addVectors } from '../services/vector.service.js'
import Notebook from '../models/Notebook.model.js';


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

    // 1. URL'den hangi notebook'a yüklendiğini al
    const { notebookId } = req.params;
    let document;

    try {
        // 2. Notebook'u bul ve sahibini doğrula (Güvenlik)
        const notebook = await Notebook.findById(notebookId);
        if (!notebook) throw new Error('Notebook bulunamadı');
        if (notebook.owner.toString() !== req.user._id.toString()) {
            throw new Error('Bu notebook için yetkiniz yok');
        }

        // 3. Belgeyi oluştur (işle, embed et, LanceDB'ye kaydet...)
        document = await Document.create({
            owner: req.user._id,
            fileName: req.file.originalname,
            status: 'processing',
        });

        const chunks = await processDocument(req.file.path, req.file.mimetype);
        const embeddings = await getEmbeddings(chunks);
        const tableName = `doc_${document._id.toString()}`;
        await addVectors(tableName, chunks, embeddings);


        document.status = 'ready';
        document.vectorTableName = tableName;
        await document.save();

        // 4. KRİTİK ADIM: Belgeyi doğrudan notebook'a bağla
        notebook.associatedDocuments.push(document._id);
        await notebook.save();

        res.status(201).json({ success: true, data: document });

    } catch (error) {
        // ... (hata yönetimi)
        next(error);
    }
};