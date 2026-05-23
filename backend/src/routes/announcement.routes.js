import express from 'express';

import {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller.js';

import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

/* =========================================================
   ROUTES
========================================================= */

// Create Announcement
router.post(
  '/create',
  verifyToken,
  createAnnouncement
);

// Get all announcements
router.get(
  '/all',
  getAllAnnouncements
);

// Update
router.put(
  '/update/:id',
  verifyToken,
  updateAnnouncement
);

// Delete
router.delete(
  '/delete/:id',
  verifyToken,
  deleteAnnouncement
);

export default router;