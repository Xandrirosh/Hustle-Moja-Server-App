import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    mobile: {
        type: String,
        required: true,
        match: [/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan mobile number']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'jobseeker', 'employer'],
        default: 'jobseeker'
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
        type: String,
    },
    avatar: {
        type: String,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/, 'Please enter a valid image URL']
    },
    bio: {
        type: String,
    },
    isPremium: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    }
)

userSchema.index({ location: '2dsphere' })

const userModel = mongoose.model("User", userSchema)

export default userModel

