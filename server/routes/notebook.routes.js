import express from 'express'
import { createNotebook, postMessageToNotebook } from '../controllers/notebook.controller.js'
import { protect } from '../middlewares/auth.middleware.js'


const router = express.Router()

router.use(protect)

router.post('/', createNotebook)

router.post('/:notebookId/messages', postMessageToNotebook)

export default router