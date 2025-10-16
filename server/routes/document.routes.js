import express from 'express'
import { getMyDocuments, uploadDocument } from '../controllers/document.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/uploader.js'

const router = express.Router()

router.use(protect)

router.route('/')
    .get(getMyDocuments)
    .post(upload.single('document'), uploadDocument)

export default router