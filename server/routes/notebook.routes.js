import express from 'express'
import { createNotebook, postMessageToNotebook, getPublicNotebooks, getMyNotebooks, likeNotebook, updateNotebook } from '../controllers/notebook.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import { uploadDocument } from '../controllers/document.controller.js';
import upload from '../middleware/uploader.js';


const router = express.Router()

router.get('/public', getPublicNotebooks)

router.use(protect)

router.patch('/:notebookId/like', likeNotebook)

router.post('/', createNotebook)

router.post('/:notebookId/messages', postMessageToNotebook)

router.patch('/:notebookId', updateNotebook)

router.get('/mynotebooks', getMyNotebooks)

router.post(
    '/:notebookId/documents',
    upload.single('document'), // 1. Multer dosyayı yakalar
    uploadDocument             // 2. Controller fonksiyonu işler
);

export default router