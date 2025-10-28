import { Router } from "express";
import { createApplication, getApplicationsByJob, updateApplicationStatus } from "../controllers/applicationController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const applicationRouter = Router();

applicationRouter.post("/create", protectedRoute, createApplication);
applicationRouter.get("/get-applicants/job/:jobId", protectedRoute, getApplicationsByJob);
applicationRouter.put("/update/:applicationId/status", protectedRoute, updateApplicationStatus);


export default applicationRouter;