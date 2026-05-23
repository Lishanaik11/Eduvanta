import express from "express";

import {
  getCourseAnalytics,
} from "../controllers/courseanalysis.controller.js";

const router = express.Router();

/* =========================================================
   COURSE ANALYTICS ROUTES
========================================================= */

router.get(
  "/analytics",
  getCourseAnalytics
);

export default router;