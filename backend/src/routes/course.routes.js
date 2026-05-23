import express from 'express';
import { 
  enrollInCourse, 
  getUserEnrollments, 
  getCourseLessonProgress, 
  updateLessonProgressState,
  getCourseLessons,
  getAllCourses,
   generateCertificate,
  getCompletedCoursesCertificates,
  markNotificationRead,
   getUserNotifications,
   saveVideoProgress
} from '../controllers/course.controller.js';

const router = express.Router();

// Route to enroll a user in a course
router.post('/enroll', enrollInCourse);

// Route to get all active enrollments for a specific user
router.get('/user/:userId', getUserEnrollments);

// Route to fetch progress tracking matrices
router.get('/progress/:userId/:courseId', getCourseLessonProgress);
router.post('/progress/update', updateLessonProgressState);

// 2. THE MISSING LINK: Match the frontend fetch path exactly!
// If your main index.js mounts this router at '/api/courses', this path matches perfectly.
router.get('/:courseId/lessons', getCourseLessons); 
router.get('/', getAllCourses);
/**
 * CERTIFICATE ROUTES
 */
router.post(
  '/certificate/generate',
  generateCertificate
);

router.get(
  '/completed/:userId',
  getCompletedCoursesCertificates
);

router.get(
  '/notifications/:userId',
  getUserNotifications
);

router.put(
  '/notifications/read/:notificationId',
  markNotificationRead
);

router.post(
  '/video-progress',
  saveVideoProgress
);

export default router;