import { Hono } from 'hono'
import { getUserProfile } from './getUserProfile'
import { updateUserProfile } from './updateUserProfile'
import { deleteUser } from './deleteUser';
import { uploadProfilePicture } from './uploadProfilePicture';
import { authMiddleware } from '../../middleware/auth'
import { getPreferences, updatePreferences } from './preferenceRoutes';

const usersRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    };
  }>();

// usersRouter.use(authMiddleware)

usersRouter.get('/:userId', authMiddleware,getUserProfile)
usersRouter.put('/:userId', authMiddleware,updateUserProfile)
usersRouter.delete('/:userId',authMiddleware,deleteUser);
usersRouter.post('/:userId/profile-picture',authMiddleware,uploadProfilePicture);
usersRouter.put('/:userId/preferences', updatePreferences);
usersRouter.get('/:userId/preferences', getPreferences);

export default usersRouter