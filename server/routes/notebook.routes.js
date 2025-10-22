import express from 'express'
import { createNotebook, postMessageToNotebook, getPublicNotebooks, getMyNotebooks, likeNotebook, updateNotebook } from '../controllers/notebook.controller.js'
import { protect } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.get('/public', getPublicNotebooks)

router.use(protect)

router.patch('/:notebookId/like', likeNotebook)

router.post('/', createNotebook)

router.post('/:notebookId/messages', postMessageToNotebook)

router.patch('/:notebookId', updateNotebook)

router.get('/mynotebooks', getMyNotebooks)

export default router