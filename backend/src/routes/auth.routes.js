import express from 'express';
import { signup, login,   getUserProfile,updateUserProfile ,sendContactMessage,
  getAllContactMessages,
  replyToContactMessage,
  getUserContactMessages} from '../controllers/auth.controller.js';

const router = express.Router();

// Define explicit POST pathways
router.post('/signup', signup);
router.post('/login', login);

router.get("/profile/:userId", getUserProfile);

// Update Profile
router.put("/profile/update", updateUserProfile);
/**
 * CONTACT SUPPORT
 */
router.post(
  '/contact/send',
  sendContactMessage
);

/**
 * FETCH USER CONTACT MESSAGES
 */
router.get(
  '/contact/user/:userId',
  getUserContactMessages
);

/**
 * ADMIN FETCH ALL CONTACT MESSAGES
 */
router.get(
  '/contact/all',
  getAllContactMessages
);

/**
 * ADMIN REPLY TO CONTACT MESSAGE
 */
router.put(
  '/contact/reply',
  replyToContactMessage
);

export default router;