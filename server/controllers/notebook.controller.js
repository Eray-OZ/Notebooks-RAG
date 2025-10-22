import Notebook from '../models/Notebook.model.js'
import Document from '../models/Document.model.js'
import { getEmbeddings, generateChatCompletion } from '../services/ai.service.js'
import { searchVectors } from '../services/vector.service.js'





export const createNotebook = async (req, res, next) => {
    try {
        const { title, description, isPublic } = req.body;

        const notebook = await Notebook.create({
            title: title,
            description: description || '',
            owner: req.user._id,
            associatedDocuments: [],
            isPublic: typeof isPublic === 'boolean' ? isPublic : false
        });

        res.status(201).json({ success: true, data: notebook });
    } catch (error) {
        next(error);
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



        const searchPromises = notebook.associatedDocuments
            .filter(doc => doc.status === 'ready' && doc.vectorTableName)
            .map(
                doc => searchVectors(doc.vectorTableName, queryEmbedding)
            );

        const searchResults = await Promise.all(searchPromises)

        context = searchResults.join('\n---\n')




        const modelReply = await generateChatCompletion(message, context)

        notebook.messages.push({ role: 'user', content: message })
        notebook.messages.push({ role: 'model', content: modelReply })

        await notebook.save()

        res.status(200).json({ success: true, reply: modelReply })

    } catch (error) {
        next(error)
    }
}





export const getPublicNotebooks = async (req, res, next) => {

    try {

        const notebooks = await Notebook.find({ isPublic: true }).populate('owner', 'username').sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: notebooks })

    } catch (error) {
        next(error)
    }
}




export const likeNotebook = async (req, res, next) => {

    try {
        const notebook = await Notebook.findById(req.params.notebookId)

        if (!notebook) {
            res.status(404)
            throw new Error('Notebook not found')
        }

        const isLiked = notebook.likes.includes(req.user._id)

        if (isLiked) {
            notebook.likes.pull(req.user._id)
        }
        else {
            notebook.likes.push(req.user._id)
        }

        await notebook.save()

        res.status(200).json({ success: true, data: notebook })

    } catch (error) {
        next(error)
    }
}




export const updateNotebook = async (req, res, next) => {

    try {
        const { title, isPublic, category } = req.body

        const notebook = await Notebook.findById(req.params.notebookId)


        if (!notebook) {
            res.status(404)
            throw new Error('Notebook Not Found')
        }


        if (notebook.owner.toString() !== req.user._id.toString()) {
            res.status(403)
            throw new Error('Not authorized to update this notebook')
        }


        if (title) {
            notebook.title = title
        }

        if (typeof isPublic === 'boolean') {
            notebook.isPublic = isPublic
        }

        if (category) {
            notebook.category = category
        }

        const updatedNotebook = await notebook.save()

        res.status(200).json({ success: true, data: updatedNotebook })


    } catch (error) {
        next(error)
    }
}




export const getMyNotebooks = async (req, res, next) => {
    try {

        const notebooks = await Notebook.find({ owner: req.user._id })
            .populate('owner', 'username')
            .sort({ updatedAt: -1 })

        res.status(200).json({ success: true, data: notebooks })
    } catch (error) {
        next(error)
    }
}



export const getNotebookById = async (req, res, next) => {
    try {
        const notebookId = req.params.notebookId;

        const notebook = await Notebook.findById(notebookId)
            .populate('owner', 'username')
            .populate('associatedDocuments');

        if (!notebook) {
            res.status(404);
            throw new Error('Notebook bulunamadı');
        }


        if (notebook.owner._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Bu notebook\'u görüntüleme yetkiniz yok');
        }

        res.status(200).json({ success: true, data: notebook });
    } catch (error) {
        next(error);
    }
};