import cloudinary from "../lib/cloudinary.js";
import jobsModel from "../models/jobsModel.js";

export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            salary,
            address,
            jobType,
            locationType,
            locationCoordinates
        } = req.body;

        const postedBy = req.user;

        // Validate required fields (image not included here)
        if (!title || !description || !category || !salary || !locationType || !locationCoordinates || !address || !jobType) {
            return res.status(400).json({
                message: "Please provide all required fields",
                success: false
            });
        }

        if (!postedBy) {
            return res.status(401).json({
                message: "Unauthorized: missing user context",
                success: false
            });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'hustleMoja/jobs' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        // Reconstruct location
        const location = {
            type: locationType,
            coordinates: JSON.parse(locationCoordinates),
        };

        const newJob = new jobsModel({
            title,
            description,
            image: imageUrl, // can be null if no image uploaded
            category,
            salary,
            location,
            address,
            jobType,
            postedBy
        });

        await newJob.save();

        return res.status(201).json({
            message: "Job posted successfully",
            success: true,
            error: false,
            data: newJob
        });

    } catch (error) {
        console.error("Post Job Error:", error);
        return res.status(500).json({
            message: error.message || "Something went wrong",
            success: false,
            error: true
        });
    }
};

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

export const getJobsNearUser = async (req, res) => {
    try {
        const userLocation = req.user.location // user location from auth middleware
        const [longitude, latitude] = userLocation.coordinates;

        if (!longitude || !latitude) {
            return res.status(400).json({
                message: "User location is required",
                success: false,
                error: true
            });
        }

        const jobs = await jobsModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    distanceField: "distance",   // field to store calculated distance
                    maxDistance: 5000,           // 5 km in meters
                    spherical: true
                }
            }
        ]);

        // convert distance to km for readability
        const formattedJobs = jobs.map(job => ({
            ...job,
            distanceKm: (job.distance / 1000).toFixed(2) + " km"
        }));

        return res.status(200).json({
            message: "Jobs within 5 km fetched successfully",
            success: true,
            data: formattedJobs
        });

    } catch (error) {
        console.error("Get Jobs Error:", error);
        return res.status(500).json({
            message: error.message || "Something went wrong",
            success: false,
            error: true
        });
    }
};


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


