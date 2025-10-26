import Notebook from '../models/Notebook.model.js'
import Document from '../models/Document.model.js'
import { getEmbeddings, generateChatCompletion } from '../services/ai.service.js'
import { searchVectors } from '../services/vector.service.js'





export const createNotebook = async (req, res, next) => {
    try {
        const { title, description, isPublic, category } = req.body;

        const notebook = await Notebook.create({
            title: title,
            description: description || '',
            owner: req.user._id,
            associatedDocuments: [],
            isPublic: typeof isPublic === 'boolean' ? isPublic : false,
            category: category || "Others"
        });

        res.status(201).json({ success: true, data: notebook });
    } catch (error) {
        next(error);
    }
}




export const associatedDocument = async (req, res, next) => {
    try {
        const { notebookId } = req.params
        const { documentId } = req.body

        if (!documentId) {
            res.status(400)
            throw new Error("Found No Associated Documents")
        }

        const [notebook, document] = await Promise.all([
            Notebook.findById(notebookId),
            Document.findById(documentId).select("+summary +fileName")
        ])


        if (!notebook) {
            throw new Error('Found No Notebook')
        }

        if (!document) {
            throw new Error('Found No Documents')
        }



        if (notebook.owner.toString() !== req.user._id.toString() || document.owner.toString() !== req.user._id.toString()) {
            res.status(403)
            throw new Error('Not Authorized')
        }


        const isAlreadyAssociated = notebook.associatedDocuments.some(
            docId => docId.toString() === documentId // documentId zaten string olmalı ama garanti olsun
        );


        if (!isAlreadyAssociated) {
            console.log(`[Backend] Belge ilişkilendiriliyor: ${document.fileName} -> ${notebook.title}`);
            // Belge ID'sini diziye ekle
            notebook.associatedDocuments.push(documentId);

            // Belgenin özetini notebook'un genel özetine ekle (Ayırıcılarla)
            notebook.summary = (notebook.summary || '') + `\n\n--- ${document.fileName} ---\n` + (document.summary || 'Özet bulunamadı.');

            // Notebook'u güncellenmiş haliyle kaydet
            await notebook.save();
            console.log(`[Backend] Özet eklendi.`);
        } else {
            console.log(`[Backend] Belge zaten ilişkilendirilmiş: ${document.fileName} -> ${notebook.title}`);
            // Zaten ilişkiliyse bir şey yapmaya gerek yok, özet zaten eklenmiş olmalı.
        }



        const updatedNotebook = await Notebook.findById(notebookId)
            .populate('associatedDocuments');


        res.status(200).json({ success: true, data: updatedNotebook })

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

        const updatedNotebook = await Notebook.findById(notebook._id)
            .populate('owner', 'username')

        res.status(200).json({ success: true, data: updatedNotebook })

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

    console.log(`[Backend] getNotebookById started for ID: ${req.params.notebookId}`);
    try {
        const notebookId = req.params.notebookId;

        const notebook = await Notebook.findById(notebookId)
            .populate('owner', 'username')
            .populate('associatedDocuments');

        if (!notebook) {
            console.log(`[Backend] Notebook not found for ID: ${notebookId}`);
            res.status(404);
            throw new Error('Notebook bulunamadı');
        }


        if (notebook.owner._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Bu notebook\'u görüntüleme yetkiniz yok');
        }

        console.log(`[Backend] Sending notebook data for ID: ${notebookId}`);
        res.status(200).json({ success: true, data: notebook });
    } catch (error) {
        console.error(`[Backend] Error in getNotebookById for ID: ${req.params.notebookId}`, error);
        next(error);
    }
}





export const getNotebookPreviewById = async (req, res, next) => {
    try {

        const { notebookId } = req.params
        const notebook = await Notebook.findById(notebookId)
            .select('title description owner associatedDocuments isPublic createdAt updatedAt likes category summary')
            .populate('owner', 'username')
            .populate('associatedDocuments', 'fileName status')


        if (!notebook) {
            console.log("Notebook Not Found: " + notebookId)
            res.status(404)
            throw new Error('Notebook Not Foun')
        }


        if (!notebook.isPublic && notebook.owner._id.toString() !== req.user._id.toString()) {
            console.log("Not Authorized")
            res.status(403)
            throw new Error("Not Authorized")
        }


        res.status(200).json({ success: true, data: notebook })

    } catch (error) {
        next(error)
    }

}





export const searchPublicNotebooks = async (req, res, next) => {

    const query = req.query.q
    if (!query) {
        return res.status(200).json({ success: true, data: [] })
    }

    try {
        const searchQuery = new RegExp(query, "i")

        const notebooks = await Notebook.find({
            isPublic: true,
            $or: [
                { title: searchQuery },
                { description: searchQuery },
                { summary: searchQuery }
            ]
        })
            .populate('owner', 'username')
            .sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: notebooks })

    } catch (error) {
        next(error)
    }


}




export const getPublicNotebooksByCategory = async (req, res, next) => {
    const categoryName = req.params.categoryName;

    if (!categoryName) {
        res.status(400);
        return next(new Error('err::: Category Name'));
    }

    try {
        const notebooks = await Notebook.find({
            isPublic: true,
            category: categoryName
        })
            .populate('owner', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notebooks });

    } catch (error) {
        console.error(`[Backend] Error fetching notebooks by category "${categoryName}":`, error);
        next(error);
    }
};





export const cloneNotebook = async (req, res, next) => {
    const originalNotebookId = req.params.notebookId;
    const clonerUserId = req.user._id;
    console.log(`[Backend] Clone requested for Notebook ID: ${originalNotebookId} by User ID: ${clonerUserId}`);

    try {
        const originalNotebook = await Notebook.findById(originalNotebookId)
            .populate('owner', 'username')
            .select('title description category owner associatedDocuments summary isPublic');

        if (!originalNotebook) {
            res.status(404);
            throw new Error('Klonlanacak notebook bulunamadı');
        }
        if (!originalNotebook.isPublic) {
            res.status(403);
            throw new Error('Sadece herkese açık notebooklar klonlanabilir.');
        }
        const originalOwnerUsername = originalNotebook.owner?.username || 'Bilinmeyen Kullanıcı';

        const clonedNotebook = await Notebook.create({
            title: `${originalNotebook.title} (Clone)`,
            description: originalNotebook.description,
            category: originalNotebook.category,
            owner: clonerUserId,
            associatedDocuments: originalNotebook.associatedDocuments,
            messages: [],
            summary: originalNotebook.summary,
            isPublic: false,
            clonedFrom: originalOwnerUsername,
            likes: [],
        });

        console.log(`[Backend] Notebook cloned successfully from ${originalOwnerUsername}. New ID: ${clonedNotebook._id}`);
        res.status(201).json({ success: true, data: clonedNotebook });

    } catch (error) {
        console.error(`[Backend] Error cloning notebook ID ${originalNotebookId}:`, error);
        next(error);
    }
}