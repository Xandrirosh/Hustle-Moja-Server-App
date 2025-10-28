import { Router } from 'express'
import { details, login, profile, register, update } from '../controllers/userController.js'
import { protectedRoute } from '../middleware/auth.middleware.js'

const userRouter = Router()

userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.post("/upload", protectedRoute, profile)
userRouter.put("/update", protectedRoute, update)
userRouter.get("/get", protectedRoute, details)
export default userRouter