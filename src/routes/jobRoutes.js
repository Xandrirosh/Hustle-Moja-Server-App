import { Router } from "express";
import { deleteJob, getJobs, getJobsByUser, getJobsNearUser, getTrendingJobs, postJob } from "../controllers/jobController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const jobRouter = Router();

jobRouter.post("/create", protectedRoute,upload.single('image'), postJob);
jobRouter.get("/get-all", protectedRoute, getJobs);
jobRouter.get("/get-by-user", protectedRoute, getJobsByUser);
jobRouter.get("/get-nearby", protectedRoute, getJobsNearUser);
jobRouter.delete("/delete/:id", protectedRoute, deleteJob);
jobRouter.get("/trending", protectedRoute, getTrendingJobs);
jobRouter.get("/recommended", protectedRoute, getJobs);
jobRouter.get("/recent", protectedRoute, getJobs);

export default jobRouter;