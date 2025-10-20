import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const protectedRoute = async (req, res, next) => {
    try {
        //get token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized, token missing",
                success: false,
                error: true
            });
        }
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized, token invalid",
                success: false,
                error: true
            });
        }

        //find  user
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: true
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}