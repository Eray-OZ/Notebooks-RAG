import mongoose from 'mongoose'


const DocumentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fileName: {
        type: String,
        required: true
    },
    vectorTableName: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'ready', 'error'],
        default: 'pending'
    },
    summary: {
        type: String,
        default: ''
    }
}, { timestamps: true })



export default mongoose.model('Document', DocumentSchema)