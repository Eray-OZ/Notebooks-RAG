import express from 'express';
// --- DOĞRU SIRALAMA İLE IMPORTLAR ---
import {
    createNotebook,
    postMessageToNotebook,
    getPublicNotebooks, // SPESİFİK GET
    getMyNotebooks,     // SPESİFİK GET
    getNotebookById,    // DİNAMİK GET
    likeNotebook,
    updateNotebook
} from '../controllers/notebook.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadDocument } from '../controllers/document.controller.js';
import upload from '../middlewares/uploader.js';

const router = express.Router();


router.get('/public', getPublicNotebooks);

router.use(protect);

router.get('/mynotebooks', getMyNotebooks); // <-- /:notebookId'den ÖNCE olmalı

router.get('/:notebookId', getNotebookById); // <-- /mynotebooks'dan SONRA olmalı

router.post('/', createNotebook);
router.post('/:notebookId/messages', postMessageToNotebook);
router.patch('/:notebookId/like', likeNotebook);
router.patch('/:notebookId', updateNotebook);
router.post('/:notebookId/documents', upload.single('document'), uploadDocument);

export default router;