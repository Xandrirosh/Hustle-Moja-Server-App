import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import connectDB from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import job from './lib/cron.js'
import jobRouter from './routes/jobRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import applicationRouter from './routes/applicationRoutes.js'
import cors from 'cors'
import {Server } from 'socket.io'
import http from 'http'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

job.start() // Start the cron job

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Change to your frontend URL in production
        methods: ['GET', 'POST']
    }
});

//handle socket connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    //join personal room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    //listen for messages
    socket.on('sendMessage', (roomId, message) => {
        //broadcast message to the room
        io.to(roomId).emit('receiveMessage', message);
        console.log(`Message sent to room ${roomId}:`, message);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

//middlewares
app.use(cors({
    origin: '*',//change to your frontend url in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//routers
app.use('/api/user', userRouter)
app.use('/api/job', jobRouter)
app.use('/api/application', applicationRouter)
app.use('/api/chat', chatRouter);

//connect to db and run server
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`.green.bold.underline)
        })
    })
    .catch((err) => {
        console.error('Failed to connect to DB:', err.message.red.bold);
        process.exit(1); // Stop the server
    })

export default io;