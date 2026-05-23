import express from 'express';

import {
  getAdminOverviewMetrics
} from '../controllers/adminoverview.controller.js';

const router = express.Router();

/* =====================================================
   ADMIN OVERVIEW METRICS
===================================================== */
router.get(
  '/',
  getAdminOverviewMetrics
);

export default router;