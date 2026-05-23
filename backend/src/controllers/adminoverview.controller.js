import pool from '../config/db.js';

/* =====================================================
   FETCH ADMIN OVERVIEW METRICS
===================================================== */
export const getAdminOverviewMetrics = async (req, res) => {

  try {

    /* TOTAL STUDENTS */
    const totalStudentsQuery = `
      SELECT COUNT(*)::INT AS total
      FROM users;
    `;

    /* TOTAL COURSES */
    const totalCoursesQuery = `
      SELECT COUNT(*)::INT AS total
      FROM courses;
    `;

    /* ACTIVE ENROLLMENTS */
    const activeEnrollmentsQuery = `
      SELECT COUNT(*)::INT AS total
      FROM enrollments;
    `;

    /* PENDING ASSIGNMENTS */
    const pendingAssignmentsQuery = `
      SELECT COUNT(*)::INT AS total
      FROM assignment_submissions
      WHERE status = 'Submitted';
    `;

    /* COMPLETED COURSES */
    const completedCoursesQuery = `
      SELECT COUNT(*)::INT AS total
      FROM enrollments
      WHERE status = 'Completed';
    `;

    /* CERTIFICATES ISSUED */
    const certificatesIssuedQuery = `
      SELECT COUNT(*)::INT AS total
      FROM certificates;
    `;

    /* EXECUTE ALL QUERIES */
    const [
      studentsResult,
      coursesResult,
      enrollmentsResult,
      pendingAssignmentsResult,
      completedCoursesResult,
      certificatesResult
    ] = await Promise.all([

      pool.query(totalStudentsQuery),

      pool.query(totalCoursesQuery),

      pool.query(activeEnrollmentsQuery),

      pool.query(pendingAssignmentsQuery),

      pool.query(completedCoursesQuery),

      pool.query(certificatesIssuedQuery)

    ]);

    return res.status(200).json({
      success: true,

      metrics: {

        totalStudents:
          studentsResult.rows[0].total,

        totalCourses:
          coursesResult.rows[0].total,

        activeEnrollments:
          enrollmentsResult.rows[0].total,

        pendingAssignments:
          pendingAssignmentsResult.rows[0].total,

        completedCourses:
          completedCoursesResult.rows[0].total,

        certificatesIssued:
          certificatesResult.rows[0].total

      }

    });

  } catch (error) {

    console.error(
      '❌ Admin Overview Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch overview metrics'
    });

  }

};