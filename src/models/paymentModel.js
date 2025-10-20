import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    purpose: {
        type: String,
        enum: ['featuredPost', 'subScription', 'adPlacement'],
        required: true
    },
    transactionId: {
        type: String,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['mpesa', 'card', 'paypal'],
        default: 'mpesa'
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
)

const paymentModel = mongoose.model('Payment', paymentSchema)

export default paymentModel