import Router from 'express';
import { checkAuth, login, signup, updateProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const userRouter = Router();

// Routes
userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.put('/update-profile', authenticateUser, updateProfile);
userRouter.get('/check', authenticateUser, checkAuth);

export default userRouter;