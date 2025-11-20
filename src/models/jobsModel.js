import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['Cleaning', 'Construction', 'Delivery', 'Tutoring', 'Mechanic', 'Electrician', 'Beauty', 'Others'],
        default: 'Others',
    },
    salary: {
        type: Number,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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
    jobType: {
        type: String,
        enum: ['part-time', 'full-time', 'gig'],
        default: 'gig',
    },
    applicantCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['open', 'assigned', 'completed'],
        default: 'open'
    },
    featured: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

jobSchema.index({ location: '2dsphere' })

const jobsModel = mongoose.model('Jobs', jobSchema)

export default jobsModel