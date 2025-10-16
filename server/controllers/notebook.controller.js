import Notebook from '../models/Notebook.model.js'
import Document from '../models/Document.model.js'
import { getEmbeddings, generateChatCompletion } from '../services/gemini.service.js'
import { searchVectors } from '../services/vector.service.js'


export const createNotebook = async (req, res, next) => {

    try {
        const { title, documentIds } = req.body

        const notebook = await Notebook.create({
            title,
            owner: req.user._id,
            associatedDocuments: documentIds
        })

        res.status(201).json({ success: true, data: notebook })
    } catch (error) {
        next(error)
    }
}


export const postMessageToNotebook = async (req, res, next) => {
    try {
        const { notebookId } = req.params
        const { message } = req.body

        const notebook = await Notebook.findById(notebookId).populate('associatedDocuments')

        if (!notebook) {
            res.status(404)
            throw new Error('Notebook not found')
        }

        if (notebook.owner.toString() !== req.user._id.toString()) {
            res.status(403)
            throw new Error('Not authorized to access this notebook')
        }


        const queryEmbedding = (await getEmbeddings([message]))[0]

        let context = ""


        console.log("--- DEBUG: ARAMA BAŞLIYOR ---");
        console.log(`Sorgu Vektörünün ilk 5 elemanı: [${queryEmbedding.slice(0, 5).join(', ')}]`);
        console.log(`İlişkili Belge Sayısı: ${notebook.associatedDocuments.length}`);



        const searchPromises = notebook.associatedDocuments.map(
            doc => searchVectors(doc.vectorTableName, queryEmbedding)
        )

        const searchResults = await Promise.all(searchPromises)


        console.log("--- DEBUG: ARAMA BİTTİ ---");
        console.log(`Oluşturulan Context'in Uzunluğu: ${context.length}`);
        console.log("Oluşturulan Context:", context);


        context = searchResults.join('\n---\n')

        console.log("Context " + context)

        const modelReply = await generateChatCompletion(message, context)

        notebook.messages.push({ role: 'user', content: message })
        notebook.messages.push({ role: 'model', content: modelReply })

        await notebook.save()

        res.status(200).json({ success: true, reply: modelReply })

    } catch (error) {
        next(error)
    }
}