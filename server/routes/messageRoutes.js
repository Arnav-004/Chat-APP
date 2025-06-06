import Router from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { getMessages, getUsersForSidebar, markMessagesAsSeen, sendMessage } from '../controllers/messageController.js';

const messageRouter = Router();


// Get all messages for a chat
messageRouter.get('/users', authenticateUser, getUsersForSidebar);
messageRouter.get('/:id', authenticateUser, getMessages);
messageRouter.put('/mark/:id', authenticateUser, markMessagesAsSeen);
messageRouter.post('/send/:id', authenticateUser, sendMessage);


export default messageRouter;