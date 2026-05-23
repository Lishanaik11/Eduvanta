import pool from '../config/db.js';
import { validate as isUUID } from 'uuid';

/**
 * VALIDATE USER ID
 * UUID SAFE VALIDATION
 */
const isValidUserIdentity = (id) => {
  if (!id) return false;

  return isUUID(String(id).trim());
};

export const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, category, description, created_at
      FROM courses
      ORDER BY id ASC;
    `);

    return res.status(200).json({
      success: true,
      courses: result.rows
    });

  } catch (err) {
    console.error("❌ Fetch courses error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

/**
 * CREATE COURSE ENROLLMENT
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { userId, courseId, courseTitle } = req.body;

    if (!userId || !courseId || !courseTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required enrollment fields.'
      });
    }

    if (!isValidUserIdentity(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID user ID.'
      });
    }

    const dbUserId = String(userId).trim();

    const sqlQuery = `
      INSERT INTO enrollments (
        user_id,
        course_id,
        course_title,
        status,
        total_progress
      )
      VALUES ($1, $2, $3, 'Pending', 0)

      ON CONFLICT (user_id, course_id)

      DO NOTHING

      RETURNING *;
    `;

    const result = await pool.query(sqlQuery, [
      dbUserId,
      courseId,
      courseTitle
    ]);

    return res.status(200).json({
      success: true,
      message: result.rows[0]
        ? 'Successfully enrolled in course.'
        : 'Already enrolled.',
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('❌ Course Enrollment Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during enrollment.',
      error: error.message
    });
  }
};

/**
 * FETCH USER ENROLLMENTS
 */
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidUserIdentity(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID user ID.'
      });
    }

    const dbUserId = String(userId).trim();

    const sqlQuery = `
      SELECT
        course_id,
        course_title,
        status,
        total_progress
      FROM enrollments
      WHERE user_id = $1
      ORDER BY course_id ASC;
    `;

    const result = await pool.query(sqlQuery, [dbUserId]);

    return res.status(200).json({
      success: true,
      enrollments: result.rows
    });

  } catch (error) {
    console.error('❌ Fetching Enrollments Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments.',
      error: error.message
    });
  }
};

/**
 * FETCH COURSE LESSON PROGRESS
 */
export const getCourseLessonProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or courseId.'
      });
    }

    if (!isValidUserIdentity(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID user ID.'
      });
    }

    const dbUserId = String(userId).trim();

    const sqlQuery = `
      SELECT
  lesson_id,
  COALESCE(content_read, false) AS content_read,
  COALESCE(video_watched, false) AS video_watched,
  COALESCE(quiz_completed, false) AS quiz_completed,
  COALESCE(watched_seconds, 0) AS watched_seconds
FROM user_lesson_progress
      WHERE user_id = $1
      AND course_id = $2
      ORDER BY lesson_id ASC;
    `;

    const result = await pool.query(sqlQuery, [
      dbUserId,
      courseId
    ]);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error getting lesson progress:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress.',
      error: error.message
    });
  }
};

/**
 * UPDATE LESSON PROGRESS
 */
export const updateLessonProgressState = async (req, res) => {
  try {
    const { userId, courseId, lessonId, type, isComplete } = req.body;

    if (!userId || !isValidUserIdentity(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid UUID user ID.' });
    }

    if (!courseId || !lessonId) {
      return res.status(400).json({ success: false, message: 'Missing courseId or lessonId.' });
    }

    const dbUserId = String(userId).trim();
    const dbLessonId = parseInt(lessonId, 10);

    const validTypes = ['content_read', 'video_watched', 'quiz_completed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid progress type.' });
    }

    // 1. UPSERT progress safely
    await pool.query(
      `
      INSERT INTO user_lesson_progress (
        user_id, course_id, lesson_id,
        content_read, video_watched, quiz_completed
      )
      VALUES ($1, $2, $3,
        CASE WHEN $4 = 'content_read' THEN $5 ELSE false END,
        CASE WHEN $4 = 'video_watched' THEN $5 ELSE false END,
        CASE WHEN $4 = 'quiz_completed' THEN $5 ELSE false END
      )
      ON CONFLICT (user_id, course_id, lesson_id)
      DO UPDATE SET
        content_read = CASE WHEN $4 = 'content_read' THEN $5 ELSE user_lesson_progress.content_read END,
        video_watched = CASE WHEN $4 = 'video_watched' THEN $5 ELSE user_lesson_progress.video_watched END,
        quiz_completed = CASE WHEN $4 = 'quiz_completed' THEN $5 ELSE user_lesson_progress.quiz_completed END;
      `,
      [dbUserId, courseId, dbLessonId, type, !!isComplete]
    );

    // 2. GET ALL LESSONS IN COURSE (IMPORTANT FIX)
    const lessonsRes = await pool.query(
      `SELECT id FROM lessons WHERE course_id = $1`,
      [courseId]
    );

    const totalLessons = lessonsRes.rows.length;

    // 3. GET PROGRESS (ALL ROWS)
    const progressRes = await pool.query(
      `
      SELECT lesson_id, content_read, video_watched, quiz_completed
      FROM user_lesson_progress
      WHERE user_id = $1 AND course_id = $2
      `,
      [dbUserId, courseId]
    );

    const progressMap = new Map();
    progressRes.rows.forEach(r => {
      progressMap.set(String(r.lesson_id), r);
    });

    // 4. LESSON SCORE (55%)
    let lessonScore = 0;

    const lessonWeight = totalLessons > 0 ? 55 / totalLessons : 0;

    lessonsRes.rows.forEach(l => {
      const p = progressMap.get(String(l.id)) || {};

      if (p.content_read) lessonScore += lessonWeight * (15 / 55);
      if (p.video_watched) lessonScore += lessonWeight * (25 / 55);
      if (p.quiz_completed) lessonScore += lessonWeight * (15 / 55);
    });

    // 5. ASSIGNMENTS (45%)
    const assignmentTotalRes = await pool.query(
      `SELECT COUNT(*)::int FROM assignments WHERE course_id = $1`,
      [courseId]
    );

    const assignmentTotal = assignmentTotalRes.rows[0].count || 0;

    const approvedRes = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM assignment_submissions s
      INNER JOIN assignments a ON a.id = s.assignment_id
      WHERE s.user_id = $1
        AND a.course_id = $2
        AND s.status = 'Approved'
      `,
      [dbUserId, courseId]
    );

    const approved = approvedRes.rows[0].total || 0;

    let assignmentScore = 0;

    if (assignmentTotal > 0) {
      const assignmentWeight = 45 / assignmentTotal;
      assignmentScore = approved * assignmentWeight;
    }

    // 6. FINAL SCORE
    const final = Math.min(Math.round(lessonScore + assignmentScore), 100);

    // 7. UPDATE ENROLLMENT (THIS IS WHAT CERTIFICATE USES)
    await pool.query(
      `
      UPDATE enrollments
      SET total_progress = $1,
          status = CASE WHEN $1 >= 100 THEN 'Completed' ELSE 'Pending' END
      WHERE user_id = $2 AND course_id = $3
      `,
      [final, dbUserId, courseId]
    );

    return res.status(200).json({
      success: true,
      updatedTotalProgress: final
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Progress update failed',
      error: error.message
    });
  }
};
/**
 * FETCH COURSE LESSONS
 */
/**
 * FETCH COURSE LESSONS
 */
export const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    /**
     * SAFE COLUMN DETECTION
     * Handles older DB schemas gracefully.
     */
    const columnCheckQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'lessons';
    `;

    const columnResult = await pool.query(columnCheckQuery);

    const columns = columnResult.rows.map(col => col.column_name);

    /**
     * Detect available video column
     */
    let videoColumn = null;

    if (columns.includes('video_id')) {
      videoColumn = 'video_id';
    } else if (columns.includes('video_url')) {
      videoColumn = 'video_url';
    } else if (columns.includes('youtube_url')) {
      videoColumn = 'youtube_url';
    }

    /**
     * Build dynamic query safely
     */
    const sqlQuery = `
      SELECT
        id,
        course_id,
        title,
        content,
        ${
          videoColumn
            ? `${videoColumn} AS video_source,`
            : `'dQw4w9WgXcQ' AS video_source,`
        }
        quiz,
        sequence_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY sequence_order ASC;
    `;

    const result = await pool.query(sqlQuery, [courseId]);

    const formattedLessons = result.rows.map((row) => {
      let extractedVideoId = 'dQw4w9WgXcQ';

      /**
       * Extract proper YouTube ID
       */
      if (row.video_source) {
        const rawVideo = String(row.video_source);

        /**
         * If full youtube URL
         */
        const regex =
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;

        const match = rawVideo.match(regex);

        extractedVideoId = match
          ? match[1]
          : rawVideo;
      }

      return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        content: row.content,

        /**
         * FRONTEND EXPECTS THIS
         */
        videoId: extractedVideoId,

        sequenceOrder: row.sequence_order,

        quiz: (() => {
          try {
            return typeof row.quiz === 'string'
              ? JSON.parse(row.quiz)
              : row.quiz || [];
          } catch {
            return [];
          }
        })()
      };
    });

    return res.status(200).json({
      success: true,
      lessons: formattedLessons
    });

  } catch (error) {
    console.error('❌ Error fetching lessons:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons.',
      error: error.message
    });
  }
};
/**
 * GENERATE CERTIFICATE
 */
export const generateCertificate = async (req, res) => {
  try {
    const { userId, courseId, courseTitle, studentName } = req.body;

    if (!userId || !courseId || !courseTitle || !studentName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.'
      });
    }

    if (!isValidUserIdentity(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID user ID.'
      });
    }

    const dbUserId = String(userId).trim();

    // ✅ FIX: use dbUserId here
    const completionCheckQuery = `
      SELECT *
      FROM enrollments
      WHERE user_id = $1
      AND course_id = $2
      AND total_progress >= 100;
    `;

    const completionResult = await pool.query(
      completionCheckQuery,
      [dbUserId, courseId]
    );

    if (completionResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed yet.'
      });
    }

    const insertQuery = `
      INSERT INTO certificates (
        user_id,
        course_id,
        course_title,
        student_name
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      dbUserId,
      courseId,
      courseTitle,
      studentName
    ]);

    return res.status(201).json({
      success: true,
      message: 'Certificate generated successfully.',
      certificate: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Generate Certificate Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate certificate.',
      error: error.message
    });
  }
};

/**
 * FETCH USER CERTIFICATES
 */
export const getCompletedCoursesCertificates = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidUserIdentity(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UUID user ID.'
      });
    }

    const sqlQuery = `
      SELECT
        id,
        course_id,
        course_title,
        student_name,
        completion_date
      FROM certificates
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(sqlQuery, [userId]);

    const formatted = result.rows.map((row) => ({
      id: row.id,
      courseId: row.course_id,
      subjectName: row.course_title,
      studentName: row.student_name,
      completionDate: row.completion_date
    }));

    return res.status(200).json({
      success: true,
      courses: formatted
    });

  } catch (error) {
    console.error('❌ Fetch Certificates Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates.',
      error: error.message
    });
  }
};
/* =========================================
   GET USER NOTIFICATIONS
========================================= */
export const getUserNotifications = async (req, res) => {
  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      notifications: result.rows
    });

  } catch (error) {

    console.error(
      '❌ Notification Fetch Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.'
    });
  }
};


/* =========================================
   MARK NOTIFICATION READ
========================================= */
export const markNotificationRead = async (req, res) => {
  try {

    const { notificationId } = req.params;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
      `,
      [notificationId]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });

  } catch (error) {

    console.error(
      '❌ Notification Update Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.'
    });
  }
};
export const saveVideoProgress = async (req, res) => {
  try {

    const {
      userId,
      courseId,
      lessonId,
      watchedSeconds
    } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    await pool.query(
      `
      INSERT INTO user_lesson_progress (
        user_id,
        course_id,
        lesson_id,
        watched_seconds,
        content_read,
        video_watched,
        quiz_completed
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        false,
        false,
        false
      )

      ON CONFLICT (user_id, course_id, lesson_id)

      DO UPDATE SET
        watched_seconds = EXCLUDED.watched_seconds
      `,
      [
        userId,
        courseId,
        lessonId,
        watchedSeconds
      ]
    );

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(
      '❌ Save Video Progress Error:',
      error
    );

    return res.status(500).json({
      success: false
    });
  }
};