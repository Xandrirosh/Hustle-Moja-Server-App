const AdvertisementSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: String,
    link: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    paid: { type: Boolean, default: false },
    expiresAt: Date
});
AdvertisementSchema.index({ location: '2dsphere' });
