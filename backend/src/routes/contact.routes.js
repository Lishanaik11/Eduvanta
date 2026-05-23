import express from 'express';

import {
  submitContactMessage,
  getAllMessages,
  deleteMessage,
  replyToMessage
} from '../controllers/contact.controller.js';

const router = express.Router();

/* =====================================================
   CONTACT FORM SUBMIT
===================================================== */
router.post(
  '/submit',
  submitContactMessage
);

/* =====================================================
   GET ALL CONTACT MESSAGES
===================================================== */
router.get(
  '/messages',
  getAllMessages
);

/* =====================================================
   DELETE CONTACT MESSAGE
===================================================== */
router.delete(
  '/messages/:id',
  deleteMessage
);

router.put(
  '/messages/reply/:id',
  replyToMessage
);



export default router;