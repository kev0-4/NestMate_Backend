import { Hono } from 'hono';
import { createReport } from './createReport';
import { authMiddleware } from '../../middleware/auth';

const reportRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    };
  }>();
reportRouter.post('/', authMiddleware,createReport);

export default reportRouter;