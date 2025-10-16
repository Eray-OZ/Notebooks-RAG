import express from 'express'
import cors from 'cors'

import connectDB from './config/db.js'
import config from './config/index.js'

import authRoutes from './routes/auth.routes.js'
import documentRoutes from './routes/document.routes.js'
import notebookRoutes from './routes/notebook.routes.js'

import errorHandler from './middlewares/errorHandler.js'


connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send("API Started...")
})


app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notebooks', notebookRoutes)

app.use(errorHandler)



const PORT = config.port || 5000
app.listen(PORT, () => {
    console.log(`Server working at ${PORT}`)
})