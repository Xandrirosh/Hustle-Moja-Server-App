const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: { type: String, enum: ['basic', 'premium'] },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    startDate: Date,
    endDate: Date
});
