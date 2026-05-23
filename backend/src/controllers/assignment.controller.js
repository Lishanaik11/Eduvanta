import pool from '../config/db.js';

/* =====================================================
   FETCH STUDENT ASSIGNMENTS
===================================================== */
export const getStudentAssignments = async (req, res) => {
  try {

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const query = `
      SELECT
        a.id,
        a.title,
        a.description,
        a.course_id,
        a.course_title,
        a.due_date,
        a.max_marks,

        s.submitted_url,
        s.submitted_at,
        s.status,
        s.grade,
        s.feedback

      FROM assignments a

      INNER JOIN enrollments ec
        ON ec.course_id = a.course_id

      LEFT JOIN assignment_submissions s
        ON s.assignment_id = a.id
        AND s.user_id = $1::uuid

      WHERE ec.user_id = $1::uuid

      ORDER BY a.due_date ASC;
    `;

    const result = await pool.query(query, [userId]);

    return res.status(200).json({
      success: true,
      assignments: result.rows
    });

  } catch (error) {

    console.error(
      '❌ Assignment Fetch Error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });

  }
};


/* =====================================================
   RECALCULATE LMS COURSE PROGRESS
===================================================== */
const recalculateCourseProgress = async (
  userId,
  courseId
) => {

  /**
   * FETCH LESSON STATES
   */
  const lessonProgressQuery = `
    SELECT
      COALESCE(content_read, false) AS content_read,
      COALESCE(video_watched, false) AS video_watched,
      COALESCE(quiz_completed, false) AS quiz_completed
    FROM user_lesson_progress
    WHERE user_id = $1
    AND course_id = $2;
  `;

  const lessonResult = await pool.query(
    lessonProgressQuery,
    [userId, courseId]
  );

  /**
   * TOTAL LESSONS
   */
  const lessonCountQuery = `
    SELECT COUNT(*)::INT AS total
    FROM lessons
    WHERE course_id = $1;
  `;

  const lessonCountResult = await pool.query(
    lessonCountQuery,
    [courseId]
  );

  const totalLessons =
    lessonCountResult.rows[0]?.total || 1;

  /**
   * TOTAL ASSIGNMENTS
   */
  const assignmentCountQuery = `
    SELECT COUNT(*)::INT AS total
    FROM assignments
    WHERE course_id = $1;
  `;

  const assignmentCountResult = await pool.query(
    assignmentCountQuery,
    [courseId]
  );

  const totalAssignments =
    assignmentCountResult.rows[0]?.total || 0;

  /**
   * SUBMITTED ASSIGNMENTS
   */
  const submittedAssignmentsQuery = `
   SELECT COUNT(*)::INT AS total
FROM assignment_submissions s

INNER JOIN assignments a
  ON a.id = s.assignment_id

WHERE s.user_id = $1
AND a.course_id = $2
AND s.status = 'Approved';
  `;

  const submittedAssignmentsResult =
    await pool.query(
      submittedAssignmentsQuery,
      [userId, courseId]
    );

  const submittedAssignments =
    submittedAssignmentsResult.rows[0]?.total || 0;

  /**
   * LMS WEIGHT CALCULATION
   */
  let totalProgress = 0;

  const lessonWeight = 55 / totalLessons;

  lessonResult.rows.forEach((row) => {

    if (row.content_read) {
      totalProgress += lessonWeight * (15 / 55);
    }

    if (row.video_watched) {
      totalProgress += lessonWeight * (25 / 55);
    }

    if (row.quiz_completed) {
      totalProgress += lessonWeight * (15 / 55);
    }

  });

  /**
   * ASSIGNMENTS = 45%
   */
  if (totalAssignments > 0) {

    const assignmentWeight =
      45 / totalAssignments;

    totalProgress += (
      submittedAssignments *
      assignmentWeight
    );

  }

  const finalProgress = Math.min(
    Math.round(totalProgress),
    100
  );

  /**
   * UPDATE ENROLLMENTS
   */
  await pool.query(
    `
    UPDATE enrollments
    SET
      total_progress = $1,
      status = CASE
        WHEN $1 >= 100 THEN 'Completed'
        ELSE 'Pending'
      END
    WHERE user_id = $2
    AND course_id = $3
    `,
    [
      finalProgress,
      userId,
      courseId
    ]
  );

  return finalProgress;
};


/* =====================================================
   SUBMIT ASSIGNMENT
===================================================== */
export const submitAssignmentSolution = async (
  req,
  res
) => {

  try {

    const { assignmentId, userId } = req.body;

    if (
      !assignmentId ||
      !userId ||
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing fields'
      });
    }

    /**
     * FILE URL
     */
    const submittedUrl =
      `/uploads/assignments/${req.file.filename}`;

    /**
     * INSERT SUBMISSION
     */
    const query = `
      INSERT INTO assignment_submissions
      (
        assignment_id,
        user_id,
        submitted_url,
        status
      )

      VALUES
      (
        $1,
        $2::uuid,
        $3,
        'Submitted'
      )

      ON CONFLICT (user_id, assignment_id)

      DO UPDATE SET
        submitted_url = EXCLUDED.submitted_url,
        submitted_at = CURRENT_TIMESTAMP,
        status = 'Submitted'

      RETURNING *;
    `;

    const result = await pool.query(query, [
      assignmentId,
      userId,
      submittedUrl
    ]);

    /**
     * FETCH COURSE ID
     */
    const courseQuery = `
      SELECT course_id
      FROM assignments
      WHERE id = $1;
    `;

    const courseResult = await pool.query(
      courseQuery,
      [assignmentId]
    );

    const courseId =
      courseResult.rows[0]?.course_id;

    /**
     * RECALCULATE PROGRESS
     */
    const updatedProgress =
      await recalculateCourseProgress(
        userId,
        courseId
      );

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted',
      updatedProgress,
      submission: result.rows[0]
    });

  } catch (error) {

    console.error(
      '❌ Assignment Submit Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Submission failed'
    });

  }

};


/* =====================================================
   UNSUBMIT ASSIGNMENT
===================================================== */
/* =====================================================
   UNSUBMIT ASSIGNMENT
===================================================== */
/* =====================================================
   UNSUBMIT ASSIGNMENT
===================================================== */
export const unsubmitAssignmentSolution = async (
  req,
  res
) => {

  try {

    const {
      assignmentId,
      userId
    } = req.body;

    if (!assignmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    /**
     * CHECK EXISTING SUBMISSION
     */
    const existingSubmission = await pool.query(
      `
      SELECT *
      FROM assignment_submissions
      WHERE assignment_id = $1
      AND user_id = $2::uuid
      `,
      [
        assignmentId,
        userId
      ]
    );

    if (existingSubmission.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    /**
     * DON'T ALLOW AFTER APPROVAL
     */
    if (
      existingSubmission.rows[0].status === 'Approved'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Approved assignments cannot be unsubmitted'
      });
    }

    /**
     * DELETE SUBMISSION
     */
    await pool.query(
      `
      DELETE FROM assignment_submissions
      WHERE assignment_id = $1
      AND user_id = $2::uuid
      `,
      [
        assignmentId,
        userId
      ]
    );

    /**
     * FETCH COURSE ID
     */
    const courseQuery = `
      SELECT course_id
      FROM assignments
      WHERE id = $1;
    `;

    const courseResult = await pool.query(
      courseQuery,
      [assignmentId]
    );

    const courseId =
      courseResult.rows[0]?.course_id;

    /**
     * RECALCULATE PROGRESS
     */
    const updatedProgress =
      await recalculateCourseProgress(
        userId,
        courseId
      );

    return res.status(200).json({
      success: true,
      message: 'Assignment unsubmitted successfully',
      updatedProgress
    });

  } catch (error) {

    console.error(
      '❌ Assignment Unsubmit Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to unsubmit assignment'
    });

  }

};
/* =====================================================
   ADMIN CREATE ASSIGNMENT
===================================================== */
export const createAssignment = async (
  req,
  res
) => {

  try {

    const {
      title,
      description,
      due_date,
      max_marks,
      course_id,
      course_title
    } = req.body;

    if (
      !title ||
      !description ||
      !due_date ||
      !course_id ||
      !course_title
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const query = `
      INSERT INTO assignments
      (
        title,
        description,
        due_date,
        max_marks,
        course_id,
        course_title
      )

      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )

      RETURNING *;
    `;

    const result = await pool.query(query, [
      title,
      description,
      due_date,
      max_marks || 100,
      course_id,
      course_title
    ]);

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: result.rows[0]
    });

  } catch (error) {

    console.error(
      '❌ Create Assignment Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });

  }

};
/* =====================================================
   ADMIN FETCH SUBMISSIONS
===================================================== */
export const getAllAssignmentSubmissions = async (
  req,
  res
) => {

  try {

    const query = `
      SELECT

        s.id,
        s.assignment_id,
        s.user_id,
        s.submitted_url,
        s.submitted_at,
        s.status,
        s.grade,
        s.feedback,

        a.title,
        a.description,
        a.course_title,

        u.name AS student_name,
        u.email AS student_email

      FROM assignment_submissions s

      INNER JOIN assignments a
        ON a.id = s.assignment_id

      INNER JOIN users u
        ON u.id = s.user_id

      WHERE
  s.submitted_url IS NOT NULL
  AND COALESCE(s.admin_hidden, false) = false

      ORDER BY s.submitted_at DESC;
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      submissions: result.rows
    });

  } catch (error) {

    console.error(
      '❌ Fetch Submissions Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });

  }

};/* =====================================================
   APPROVE ASSIGNMENT
===================================================== */
export const approveAssignmentSubmission = async (
  req,
  res
) => {

  try {

    const {
      submissionId
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID required'
      });
    }

    /**
     * UPDATE STATUS
     */
    const updateQuery = `
      UPDATE assignment_submissions

      SET
        status = 'Approved'

      WHERE id = $1

      RETURNING *;
    `;

    const result = await pool.query(
      updateQuery,
      [submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    /**
     * FETCH COURSE
     */
    const courseQuery = `
      SELECT a.course_id

      FROM assignments a

      INNER JOIN assignment_submissions s
        ON s.assignment_id = a.id

      WHERE s.id = $1;
    `;

    const courseResult = await pool.query(
      courseQuery,
      [submissionId]
    );

    const courseId =
      courseResult.rows[0]?.course_id;

    /**
     * RECALCULATE
     */
    await recalculateCourseProgress(
      result.rows[0].user_id,
      courseId
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment approved successfully'
    });

  } catch (error) {

    console.error(
      '❌ Approve Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Approval failed'
    });

  }

};
/* =====================================================
   REJECT ASSIGNMENT
===================================================== */
export const rejectAssignmentSubmission = async (
  req,
  res
) => {

  try {

    const {
      submissionId,
      feedback
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID required'
      });
    }

    const query = `
      UPDATE assignment_submissions

      SET
        status = 'Rejected',
        feedback = $2

      WHERE id = $1

      RETURNING *;
    `;

    const result = await pool.query(
      query,
      [
        submissionId,
        feedback || 'Assignment rejected by admin'
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    /**
     * FETCH COURSE
     */
    const courseQuery = `
      SELECT a.course_id

      FROM assignments a

      INNER JOIN assignment_submissions s
        ON s.assignment_id = a.id

      WHERE s.id = $1;
    `;

    const courseResult = await pool.query(
      courseQuery,
      [submissionId]
    );

    const courseId =
      courseResult.rows[0]?.course_id;

    /**
     * RECALCULATE
     */
    await recalculateCourseProgress(
      result.rows[0].user_id,
      courseId
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment rejected successfully'
    });

  } catch (error) {

    console.error(
      '❌ Reject Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Rejection failed'
    });

  }

};
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { submissionId, status, feedback } = req.body;

    if (!submissionId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    // Normalize status (VERY IMPORTANT FIX)
    const normalizedStatus = String(status).trim();

    // 1. Update submission
    const result = await pool.query(
      `
      UPDATE assignment_submissions
      SET status = $1,
          feedback = $2
      WHERE id = $3
      RETURNING *
      `,
      [normalizedStatus, feedback || null, submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const submission = result.rows[0];

    // 2. Get courseId properly
    const courseResult = await pool.query(
      `
      SELECT a.course_id
      FROM assignments a
      INNER JOIN assignment_submissions s
        ON s.assignment_id = a.id
      WHERE s.id = $1
      `,
      [submissionId]
    );

    const courseId = courseResult.rows[0]?.course_id;

    // 3. CRITICAL FIX → RECALCULATE PROGRESS
    if (courseId) {
      await recalculateCourseProgress(
        submission.user_id,
        courseId
      );
    }

    return res.status(200).json({
      success: true,
      message: "Submission updated & progress recalculated",
      data: submission
    });

  } catch (err) {
    console.error("updateAssignmentStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
/* =====================================================
   HIDE SUBMISSION FROM ADMIN PANEL ONLY
===================================================== */
export const deleteSubmissionRecord = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID required'
      });
    }

    /**
     * CHECK EXISTING
     */
    const existing = await pool.query(
      `
      SELECT *
      FROM assignment_submissions
      WHERE id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    /**
     * HIDE FROM ADMIN PANEL ONLY
     * DO NOT DELETE DB RECORD
     */
    const result = await pool.query(
      `
      UPDATE assignment_submissions

      SET
        admin_hidden = true

      WHERE id = $1

      RETURNING *;
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Submission hidden from admin panel'
    });

  } catch (error) {

    console.error(
      '❌ Hide Submission Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to hide submission'
    });

  }

};