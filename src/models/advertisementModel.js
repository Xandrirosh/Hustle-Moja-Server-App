import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    advertiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Service', 'Jobs', 'Sales', 'Others'],
        default: 'Others',
        required: true
    },
    Image: {
        type: String // URL to image stored on CDN or cloud
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: {
        type: String
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    promoted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const adModel = mongoose.model('Advertisement', adSchema);

export default adModel;
