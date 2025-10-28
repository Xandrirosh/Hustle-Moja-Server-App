import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import connectDB from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import job from './lib/cron.js'
import jobRouter from './routes/jobRoutes.js'
import applicationRouter from './routes/applicationRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

job.start() // Start the cron job

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//routers
app.use('/api/user', userRouter)
app.use('/api/job', jobRouter)
app.use('/api/application', applicationRouter) 

//connect to db and run server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`.green.bold.underline)
        })
    })
    .catch((err) => {
        console.error('Failed to connect to DB:', err.message.red.bold);
        process.exit(1); // Stop the server
    })