import pool from '../config/db.js';

/* =========================================================
   GET COURSE ANALYTICS
========================================================= */
export const getCourseAnalytics = async (req, res) => {
  try {

    /* =========================================================
       TOP STATS
    ========================================================= */

    // Total Courses
    const totalCoursesQuery = `
      SELECT COUNT(*) AS total_courses
      FROM courses
    `;

    // Total Enrollments
    const totalEnrollmentsQuery = `
      SELECT COUNT(*) AS total_enrollments
      FROM enrollments
    `;

    // Average Completion Rate
const avgCompletionRateQuery = `
  SELECT 
    ROUND(
      (
        COUNT(*) FILTER (
          WHERE LOWER(TRIM(status)) = 'completed'
        )::decimal
        / NULLIF(COUNT(*), 0)
      ) * 100,
      1
    ) AS avg_completion_rate
  FROM enrollments
`;

    const [
      totalCoursesResult,
      totalEnrollmentsResult,
      avgCompletionRateResult,
    ] = await Promise.all([
      pool.query(totalCoursesQuery),
      pool.query(totalEnrollmentsQuery),
      pool.query(avgCompletionRateQuery),
    ]);

    /* =========================================================
       CATEGORY ANALYTICS
    ========================================================= */

const categoryAnalyticsQuery = `
  SELECT
    c.title,

    COUNT(e.id) AS enrollments,

    COUNT(*) FILTER (
      WHERE LOWER(TRIM(e.status)) = 'completed'
    ) AS completions

  FROM courses c

  LEFT JOIN enrollments e
  ON c.id = e.course_id

  GROUP BY c.title

  ORDER BY enrollments DESC

  LIMIT 5
`;
    const categoryAnalyticsResult = await pool.query(
      categoryAnalyticsQuery
    );

    const categoryLabels =
  categoryAnalyticsResult.rows.map(
    (item) => item.title
  );

    const categoryEnrollments =
      categoryAnalyticsResult.rows.map(
        (item) => Number(item.enrollments)
      );

    const categoryCompletions =
      categoryAnalyticsResult.rows.map(
        (item) => Number(item.completions)
      );

    /* =========================================================
       TOP PERFORMING COURSES TABLE
    ========================================================= */

const topCoursesQuery = `
  SELECT

    c.id,
    c.title,

    COUNT(e.id) AS enrollments,

    COUNT(*) FILTER (
      WHERE LOWER(TRIM(e.status)) = 'completed'
    ) AS completions,

    ROUND(
      (
        COUNT(*) FILTER (
          WHERE LOWER(TRIM(e.status)) = 'completed'
        )::decimal

        / NULLIF(COUNT(e.id), 0)
      ) * 100,
      1
    ) AS completion_rate

  FROM courses c

  LEFT JOIN enrollments e
  ON c.id = e.course_id

  GROUP BY c.id, c.title

  ORDER BY enrollments DESC

  LIMIT 10
`;

    const topCoursesResult = await pool.query(topCoursesQuery);

    const formattedCourses =
  topCoursesResult.rows.map((course) => {

    const completionRate =
      Number(course.completion_rate || 0);

    return {
      id: course.id,

      name: course.title,

      enrollments: Number(course.enrollments),

      completions: Number(course.completions),

      rate: `${completionRate}%`,

      // DYNAMIC TREND
      trend: `${completionRate}%`,

      // TRUE = GREEN UP
      // FALSE = RED DOWN
      positive: completionRate >= 50
    };
  });

    /* =========================================================
       FINAL RESPONSE
    ========================================================= */

    res.status(200).json({
      success: true,

      topStats: {
        totalCourses:
          Number(
            totalCoursesResult.rows[0].total_courses
          ),

        totalEnrollments:
          Number(
            totalEnrollmentsResult.rows[0].total_enrollments
          ),

        avgCompletionRate:
          `${avgCompletionRateResult.rows[0].avg_completion_rate || 0}%`,
      },

      categoryData: {
        labels: categoryLabels,
        enrollments: categoryEnrollments,
        completions: categoryCompletions,
      },

      tableData: formattedCourses,
    });

  } catch (error) {
    console.error(
      "❌ Course Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch course analytics",
      error: error.message,
    });
  }
};