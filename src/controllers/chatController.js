import Chat from '../models/chatModel.js';
import io from '../server.js';

const createChat = async (req, res) => {
    try {
        const { participants } = req.body;

        if (!participants || participants.length < 2) {
            return res.status(400).json({ message: 'At least two participants are required to create a chat' });
        }

        let existingChat = await Chat.findOne({ participants: { $all: participants, $size: participants.length } });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const newChat = new Chat({ participants, messages: [] });
        const populatedChat = await newChat.populate('participants', 'name email');
        await newChat.save();
        res.status(201).json(populatedChat);
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat', error });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { sender, content } = req.body;

        const chatInstance = await Chat.findById(chatId);
        if (!chatInstance) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const newMessage = {
            sender,
            content,
            status: 'sent',
            timestamp: new Date()
        };

        chatInstance.messages.push(newMessage);

        await chatInstance.save();

        // Emit the new message to all participants in the chat via Socket.io
        io.to(chatId).emit('receiveMessage', newMessage);

        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};

const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const { page = 1, limit = 20 } = req.query;
        const chatInstance = await Chat.findById(chatId)
            .populate({
                path: 'messages.sender',
                select: 'name email',
                options: { sort: { timestamp: 1 }, skip: (page - 1) * limit, limit: parseInt(limit) }
            });

        if (!chatInstance) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const sortedMessages = chatInstance.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        res.status(200).json(sortedMessages);

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving messages', error: error.message});
    }
};

export { createChat, sendMessage, getChatMessages };