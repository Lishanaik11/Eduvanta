import express from 'express';

import {
  adminSignup,
  adminLogin,
  adminGetCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminGetCourseLessons,
  adminGetSingleCourse,
  updateAdminProfile
} from '../controllers/admin.controller.js';

const router = express.Router();

/* =====================================================
   AUTH
===================================================== */
router.post('/signup', adminSignup);
router.post('/login', adminLogin);

/* =====================================================
   COURSES
===================================================== */

// GET ALL COURSES
router.get('/courses', adminGetCourses);

// CREATE COURSE
router.post('/courses/create', adminCreateCourse);

// UPDATE COURSE
router.put('/courses/update/:courseId', adminUpdateCourse);

// DELETE COURSE
router.delete('/courses/delete/:courseId', adminDeleteCourse);

// COURSE LESSONS
router.get('/courses/:courseId/lessons', adminGetCourseLessons);

// SINGLE COURSE
router.get('/courses/:courseId', adminGetSingleCourse);

/* =====================================================
   ADMIN PROFILE
===================================================== */

router.put(
  '/profile/update',
  updateAdminProfile
);

export default router;