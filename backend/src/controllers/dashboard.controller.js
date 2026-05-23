import pool from '../config/db.js';

/* =========================
   STUDENT DASHBOARD METRICS
========================= */
export const getStudentDashboardMetrics = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("📥 DASHBOARD USER ID:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    /* =========================
       ENROLLED COURSES COUNT
    ========================= */

    const enrolledCoursesQuery = `
      SELECT COUNT(*) AS total
      FROM enrollments
      WHERE user_id = $1
    `;

    const enrolledCoursesResult = await pool.query(
      enrolledCoursesQuery,
      [userId]
    );

    const enrolledCourses = parseInt(
      enrolledCoursesResult.rows[0]?.total || 0
    );

    console.log("📘 ENROLLED:", enrolledCourses);

    /* =========================
       PENDING ASSIGNMENTS COUNT
       MATCH USING course_title
    ========================= */

    const pendingAssignmentsQuery = `
      SELECT COUNT(*) AS total

      FROM assignments a

      INNER JOIN enrollments e
      ON e.course_title = a.course_title

      WHERE e.user_id = $1

      AND NOT EXISTS (
        SELECT 1
        FROM assignment_submissions s
        WHERE s.assignment_id = a.id
        AND s.user_id = $1
      )
    `;

    const pendingAssignmentsResult = await pool.query(
      pendingAssignmentsQuery,
      [userId]
    );

    const pendingAssignments = parseInt(
      pendingAssignmentsResult.rows[0]?.total || 0
    );

    console.log("📝 PENDING:", pendingAssignments);

    return res.status(200).json({
      success: true,
      metrics: {
        enrolledCourses,
        pendingAssignments,
      },
    });

  } catch (error) {
    console.error("❌ DASHBOARD METRICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    });
  }
};