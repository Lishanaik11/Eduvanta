import pool from '../config/db.js';

/* =========================================================
   SUBMIT FEEDBACK
========================================================= */
export const submitFeedback = async (req, res) => {
  try {

    const {
      userId,
      courseId,
      name,
      email,
      rating,
      feedbackText
    } = req.body;

    // Validation
    if (
      !userId ||
      !courseId ||
      !name ||
      !email ||
      !rating ||
      !feedbackText
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify student is enrolled in selected course
    const enrollmentCheck = await pool.query(
      `
      SELECT * FROM enrollments
      WHERE user_id = $1
      AND course_id = $2
      `,
      [userId, courseId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Insert feedback
    await pool.query(
      `
      INSERT INTO feedback
      (
        user_id,
        course_id,
        name,
        email,
        rating,
        feedback_text
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        userId,
        courseId,
        name,
        email,
        rating,
        feedbackText
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback Submission Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
};
/* =========================================================
   GET ALL FEEDBACK FOR ADMIN
========================================================= */
export const getAllFeedbackAnalytics = async (req, res) => {
  try {

    const feedbackResult = await pool.query(`
      SELECT
        f.id,
        f.name,
        f.rating,
        f.feedback_text,
        f.created_at,
        c.title AS course_title,

        CASE
          WHEN f.rating >= 4 THEN 'positive'
          WHEN f.rating <= 2 THEN 'negative'
          ELSE 'neutral'
        END AS sentiment

      FROM feedback f

      LEFT JOIN courses c
      ON c.id = f.course_id

      ORDER BY f.created_at DESC
    `);

    const feedbacks = feedbackResult.rows;

    const totalReviews = feedbacks.length;

    /* =====================================
       AVG RATING
    ===================================== */

    const avgRating =
      totalReviews > 0
        ? (
            feedbacks.reduce(
              (sum, item) =>
                sum + Number(item.rating),
              0
            ) / totalReviews
          ).toFixed(1)
        : 0;

    /* =====================================
       POSITIVE / NEGATIVE COUNTS
    ===================================== */

    const positiveCount = feedbacks.filter(
      item => Number(item.rating) >= 4
    ).length;

    const negativeCount = feedbacks.filter(
      item => Number(item.rating) <= 2
    ).length;

    /* =====================================
       TREND GRAPH DATA
    ===================================== */

    const trendData = feedbacks
      .slice()
      .reverse()
      .map((item) => ({
        date: new Date(
          item.created_at
        ).toLocaleDateString(
          'en-IN',
          {
            day: 'numeric',
            month: 'short'
          }
        ),

        rating: Number(item.rating)
      }));

    /* =====================================
       FINAL RESPONSE
    ===================================== */

    return res.status(200).json({
      success: true,

      metrics: {
        avgRating,

        positiveFeedback:
          totalReviews > 0
            ? `${(
                (positiveCount / totalReviews) * 100
              ).toFixed(1)}%`
            : '0%',

        negativeFeedback:
          totalReviews > 0
            ? `${(
                (negativeCount / totalReviews) * 100
              ).toFixed(1)}%`
            : '0%',

        totalReviews
      },

      feedbacks,

      trendData
    });

  } catch (error) {

    console.error(
      'Feedback Analytics Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};