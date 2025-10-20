const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['subscription', 'advertisement'] },
    amount: Number,
    currency: { type: String, default: 'KES' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    mpesaReceipt: String,
    createdAt: { type: Date, default: Date.now }
});
