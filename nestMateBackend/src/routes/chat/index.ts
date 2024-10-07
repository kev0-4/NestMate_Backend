import { Hono } from 'hono';
import { sendMessage } from './sendMessage';
import { getChatMessages } from './getChatMessages';
import { authMiddleware } from '../../middleware/auth';

const chatRouter = new Hono();

chatRouter.post('/:matchId', authMiddleware,sendMessage);
chatRouter.get('/:matchId', authMiddleware,getChatMessages);

export default chatRouter;
