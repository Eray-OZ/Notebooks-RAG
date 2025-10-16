import Document from "../models/Document.model.js"
import { processDocument } from '../services/document.processor.js'
import { getEmbeddings } from '../services/gemini.service.js'
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
        res.status(400)
        return next(new Error("Please upload a file"))
    }

    let document

    try {
        document = await Document.create({
            owner: req.user._id,
            fileName: req.file.originalname,
            status: 'processing'
        })

        console.log("Process starting " + document.fileName)

        const chunks = await processDocument(req.file.path, req.file.mimtype)

        const embeddings = await getEmbeddings(chunks)

        const tableName = `doc_${document._id.toString()}`

        await addVectors(tableName, chunks, embeddings)

        document.status = 'ready'
        document.vectorTableName = tableName

        await document.save()

        res.status(201).json({ success: true, data: document })

    } catch (error) {
        if (document) {
            document.status = 'error'
            await document.save()
        }
        next(error)
    }
}