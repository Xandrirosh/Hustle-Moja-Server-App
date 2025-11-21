import { Router } from "express";
import { deleteJob, getJobs, getJobsByUser, postJob } from "../controllers/jobController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const jobRouter = Router();

jobRouter.post("/create", protectedRoute, postJob);
jobRouter.get("/get-all", protectedRoute, getJobs);
jobRouter.get("/get-by-user", protectedRoute, getJobsByUser);
jobRouter.delete("/delete/:id", protectedRoute, deleteJob);

export default jobRouter;