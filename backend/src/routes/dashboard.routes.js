import express from 'express';
import { getStudentDashboardMetrics } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Fetch metrics route passing the session UUID variable handle
router.get('/metrics/:userId', getStudentDashboardMetrics);


export default router;