import express from 'express';

import {
  submitFeedback,
  getAllFeedbackAnalytics
} from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/submit', submitFeedback);

router.get('/all', getAllFeedbackAnalytics);

export default router;