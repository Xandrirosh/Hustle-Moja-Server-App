import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },    
        timestamp: { type: Date, default: Date.now }
    }]
})

const chatModel = mongoose.model('Chat', chatSchema);