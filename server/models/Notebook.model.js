import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })



const NotebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    associatedDocuments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    messages: {
        type: [MessageSchema],
        default: []
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ["Study"]
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true })

export default mongoose.model('Notebook', NotebookSchema)