import applicantModel from "../models/jobApplicationModel.js";

export const createApplication = async (req, res) => {
    try {
        const { jobId, message } = req.body
        const applicantId = req.user.id

        const application = new applicantModel({
            job: jobId,
            applicant: applicantId,
            message: message
        })
        await application.save()

        return res.status(201).json({
            message: "Application submitted successfully",
            success: true,
            error: false,
            data: application,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}

export const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params

        const applications = await applicantModel.find({ job: jobId }).populate('applicant', 'username email mobile location address bio avatar')
        return res.status(200).json({
            message: "Applications fetched successfully",
            success: true,
            error: false,
            data: applications
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}

export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params
        const { status } = req.body // expected values: 'pending', 'accepted', 'rejected'
        const updatedApplication = await applicantModel.findByIdAndUpdate(applicationId, { status: status }, { new: true })

        return res.status(200).json({
            message: "Application status updated successfully",
            success: true,
            error: false,
            data: updatedApplication
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}


