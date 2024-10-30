import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as messageController from '../controllers/messageController.js';
import { controllerWrapper as cw } from '../middlewares/controllerWrapper.js';
import { checkLoggedIn } from '../middlewares/checkLoggedIn.js';

import multer from 'multer';
import { userPhotoStorage } from '../cloudinary/index.js';
const uploadUserPhoto = multer({ storage: userPhotoStorage });

export const privateRouter = Router();

privateRouter.get('/users/me', cw(userController.getConnectedUser));
privateRouter.get('/users', checkLoggedIn, cw(userController.getAllUsers));
privateRouter.patch(
  '/users/me',
  checkLoggedIn,
  cw(userController.updateUserProfile)
);

privateRouter.post(
  '/users/:userId/uploadPhoto',
  uploadUserPhoto.single('new-image'),
  userController.uploadUserPhoto
);

privateRouter.delete('/users/me', cw(userController.deleteUser));

privateRouter.put(
  '/events/:eventId/register',
  cw(userController.addUserToEvent)
);
privateRouter.delete(
  '/events/:eventId/unregister',

  cw(userController.deleteUserToEvent)
);

privateRouter.get(
  '/users/me/suggestions',
  checkLoggedIn,
  cw(userController.getAllSameInterestUsers)
);

privateRouter.get(
  '/users/:userId',
  checkLoggedIn,
  cw(userController.getOneUser)
);

privateRouter.get(
  '/messages',
  checkLoggedIn,
  cw(messageController.getAllUserMessages)
);

privateRouter.get(
  '/contacts',
  checkLoggedIn,
  cw(messageController.getAllUserContacts)
);

privateRouter.post(
  '/messages',
  checkLoggedIn,
  cw(messageController.sendMessageToUser)
);

privateRouter.put(
  '/messages/read',
  checkLoggedIn,
  cw(messageController.putToReadMessage)
);

privateRouter.delete('/users/me/delete', cw(userController.deleteUser));
