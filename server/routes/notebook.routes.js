import express from 'express';

import {
    createNotebook,
    postMessageToNotebook,
    getPublicNotebooks,
    getMyNotebooks,
    getNotebookById,
    likeNotebook,
    updateNotebook,
    associatedDocument,
    getNotebookPreviewById,
    searchPublicNotebooks
} from '../controllers/notebook.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadDocument } from '../controllers/document.controller.js';
import upload from '../middlewares/uploader.js';

const router = express.Router();


router.get('/public', getPublicNotebooks);
router.get('/search/public', searchPublicNotebooks)
router.use(protect);
router.get('/mynotebooks', getMyNotebooks);
router.get('/:notebookId/preview', getNotebookPreviewById)
router.get('/:notebookId', getNotebookById);

router.patch('/:notebookId/associate', associatedDocument)
router.post('/', createNotebook);
router.post('/:notebookId/messages', postMessageToNotebook);
router.patch('/:notebookId/like', likeNotebook);
router.patch('/:notebookId', updateNotebook);
router.post('/:notebookId/documents', upload.single('document'), uploadDocument);

export default router;