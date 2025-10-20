import mongoose from 'mongoose'

const applicantSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
},
    {
        timestamps: true
    }
)

applicantSchema.index({ job: 1, applicant: 1 }, { unique: true });

const applicantModel = mongoose.model('Application', applicantSchema)

export default applicantModel