import { Router } from 'express';
import { createChat, sendMessage, getChatMessages } from '../controllers/chatController.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const chatRouter = Router();

// Create a new chat (between two participants)
chatRouter.post('/', protectedRoute, createChat);

// Send a message to a chat
chatRouter.post('/:chatId/message', protectedRoute, sendMessage);

// Get all messages from a chat
chatRouter.get('/:chatId/messages', protectedRoute, getChatMessages);

export default chatRouter;``