import cloudinary from "../lib/cloudinary.js";
import jobsModel from "../models/jobsModel.js";

export const postJob = async (req, res) => {
    try {
        const { title, description,image, category, salary, location, address, jobType } = req.body

        const postedBy = req.user

        if (!title || !description || !category || !salary || !location || !address || !jobType) {
            return res.status(400).json({
                message: "Please provide all required fields",
                success: false
            })
        }

        const uploadImages = await cloudinary.uploader.upload(image, {
            folder: 'hustleMoja/jobs'
        })
        if (!uploadImages) {
            return res.status(400).json({
                message: "Image upload failed",
                success: false
            })
        }
        const imageUrl = uploadImages.secure_url;
        const newJob = new jobsModel({
            title,
            description,
            image: imageUrl,
            category,
            salary,
            location,
            address,           
            jobType,
            postedBy
        })
        await newJob.save()
        return res.status(201).json({
            message: "job posted successfully",
            success: true,
            error: false,
            data: newJob
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}

export const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const jobs = await jobsModel.find().populate('postedBy', 'username, avatar').skip(skip).limit(limit).sort({ createdAt: -1 });
        const totalJobs = await jobsModel.countDocuments();
        return res.status(200).json({
            message: "jobs fetched successfully",
            success: true,
            data: jobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit)
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}

export const getJobsByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobs = await jobsModel.find({ postedBy: userId }).populate('postedBy', 'username, avatar');
        return res.status(200).json({
            message: "Jobs fetched successfully",
            success: true,
            data: jobs
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        });
    }
}

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await jobsModel.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        // check if the user is the owner of the job
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this job",
                success: false
            });
        }

        //delete image from cloudinary
        if (job.images && job.images.includes('res.cloudinary.com')) {
            const publicIds = job.images.map(url => {
                const parts = url.split('/');
                const fileName = parts[parts.length - 1];
                const publicId = fileName.split('.')[0];
                return `hustleMoja/jobs/${publicId}`;
            });
            for (const publicId of publicIds) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        await jobsModel.findByIdAndDelete(jobId);
        return res.status(200).json({
            message: "job deleted successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        });
    }
}


