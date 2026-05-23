import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


/* =====================================================
   ADMIN SIGNUP
===================================================== */
export const adminSignup = async (req, res) => {

  console.log("📥 Admin Signup Request:", req.body);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {

    return res.status(400).json({
      success: false,
      message: "Username, email, and password are required fields."
    });
  }

  try {

    const adminCheck = await pool.query(
      `
      SELECT *
      FROM admins
      WHERE username = $1
      OR email = $2
      `,
      [username, email]
    );

    if (adminCheck.rows.length > 0) {

      return res.status(400).json({
        success: false,
        message: 'Username or Email is already registered.'
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newAdmin = await pool.query(
      `
      INSERT INTO admins
      (
        username,
        email,
        password
      )
      VALUES
      (
        $1,
        $2,
        $3
      )

      RETURNING
        id,
        username,
        email,
        created_at
      `,
      [
        username,
        email,
        hashedPassword
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Admin account registered successfully!',
      admin: newAdmin.rows[0]
    });

  } catch (error) {

    console.error(
      '❌ Error during Admin Signup:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Server database error processing admin registration.'
    });
  }
};



/* =====================================================
   ADMIN LOGIN
===================================================== */
export const adminLogin = async (req, res) => {

  console.log("📥 Admin Login Request:", req.body);

  try {

    const { username, password } = req.body;

    if (!username || !password) {

      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    const adminResult = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        password,
        created_at
      FROM admins
      WHERE username = $1
      `,
      [username]
    );

    if (adminResult.rows.length === 0) {

      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password"
      });
    }

    const admin = adminResult.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {

      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password"
      });
    }

const token = jwt.sign(
  {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: 'admin'
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '7d'
  }
);

return res.status(200).json({
  success: true,
  message: "Admin authorization successful!",
  token,
  admin: {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    createdAt: admin.created_at
  }
});

  } catch (error) {

    console.error(
      "❌ Error during Admin Login:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server database error processing admin authentication.",
      error: error.message
    });
  }
};



/* =====================================================
   GET ALL COURSES
===================================================== */
export const adminGetCourses = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        category,
        description,
        created_at
      FROM courses
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      success: true,
      courses: result.rows
    });

  } catch (error) {

    console.error(
      "❌ Fetch Admin Courses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};



/* =====================================================
   CREATE COURSE WITH LESSONS
===================================================== */
export const adminCreateCourse = async (req, res) => {

  try {

    const {
      title,
      category,
      description,
      lessons
    } = req.body;

    if (
      !title ||
      !category ||
      !description
    ) {

      return res.status(400).json({
        success: false,
        message: "All course fields are required."
      });
    }

    /* CREATE COURSE */
    const courseResult = await pool.query(
      `
      INSERT INTO courses
      (
        title,
        category,
        description
      )
      VALUES
      (
        $1,
        $2,
        $3
      )

      RETURNING *
      `,
      [
        title,
        category,
        description
      ]
    );

    const course = courseResult.rows[0];

    /* CREATE LESSONS */
    if (
      lessons &&
      Array.isArray(lessons) &&
      lessons.length > 0
    ) {

      for (let i = 0; i < lessons.length; i++) {

        const lesson = lessons[i];

        await pool.query(
          `
          INSERT INTO lessons
          (
            course_id,
            title,
            content,
            video_id,
            quiz,
            sequence_order
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
          `,
          [
            course.id,
            lesson.title,
            lesson.content,
            lesson.videoId,
            JSON.stringify(
  (lesson.quiz || []).map((q) => ({
    question: q.question || '',
    options: q.options || [],
    answer: q.answer || ''
  }))
),
            i + 1
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Course created successfully."
    });

  } catch (error) {

    console.error(
      "❌ Create Course Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    });
  }
};



/* =====================================================
   UPDATE COURSE WITH LESSONS
===================================================== */
export const adminUpdateCourse = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { courseId } = req.params;

    const {
      title,
      category,
      description,
      lessons
    } = req.body;

    /* =========================================
       VALIDATION
    ========================================= */
    if (
      !title ||
      !category ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required course fields."
      });
    }

    /* =========================================
       FETCH OLD COURSE
    ========================================= */
    const oldCourseResult = await client.query(
      `
      SELECT *
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    if (oldCourseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    const oldCourse = oldCourseResult.rows[0];

    /* =========================================
       UPDATE COURSE
    ========================================= */
    await client.query(
      `
      UPDATE courses
      SET
        title = $1,
        category = $2,
        description = $3,
        updated_at = NOW()
      WHERE id = $4
      `,
      [
        title,
        category,
        description,
        courseId
      ]
    );

    /* =========================================
       DELETE OLD LESSONS
    ========================================= */
    await client.query(
      `
      DELETE FROM lessons
      WHERE course_id = $1
      `,
      [courseId]
    );

    /* =========================================
       INSERT NEW LESSONS
    ========================================= */
    if (
      lessons &&
      Array.isArray(lessons)
    ) {
      for (let i = 0; i < lessons.length; i++) {

        const lesson = lessons[i];

        await client.query(
          `
          INSERT INTO lessons
          (
            course_id,
            title,
            content,
            video_id,
            quiz,
            sequence_order
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
          `,
          [
            courseId,
            lesson.title || '',
            lesson.content || '',
            lesson.videoId || '',
            JSON.stringify(
              (lesson.quiz || []).map((q) => ({
                question: q.question || '',
                options: q.options || [],
                answer: q.answer || ''
              }))
            ),
            i + 1
          ]
        );
      }
    }

    /* =========================================
       FIND USERS TO NOTIFY
       ONLY:
       - enrolled
       - not completed
       - OR no certificate
    ========================================= */

    const affectedUsersResult = await client.query(
      `
      SELECT
        e.user_id,
        e.total_progress,
        e.status,
        c.id AS certificate_id

      FROM enrollments e

      LEFT JOIN certificates c
      ON
        c.user_id = e.user_id
        AND c.course_id = e.course_id

      WHERE e.course_id = $1
      `,
      [courseId]
    );

    const affectedUsers = affectedUsersResult.rows;

    /* =========================================
       RESET PROGRESS
       + CREATE NOTIFICATIONS
    ========================================= */

    for (const user of affectedUsers) {

      const hasCertificate = !!user.certificate_id;

      /*
        ONLY RESET USERS WHO:
        - are incomplete
        - OR don't have certificate
      */

      const shouldReset =
        user.status !== 'Completed' ||
        !hasCertificate;

      if (shouldReset) {

        /* ------------------------------
           DELETE OLD LESSON PROGRESS
        ------------------------------ */
        await client.query(
          `
          DELETE FROM user_lesson_progress
          WHERE user_id = $1
          AND course_id = $2
          `,
          [
            user.user_id,
            courseId
          ]
        );

        /* ------------------------------
           RESET ENROLLMENT %
        ------------------------------ */
        await client.query(
          `
          UPDATE enrollments
          SET
            total_progress = 0,
            status = 'Pending',
            updated_at = NOW()
          WHERE user_id = $1
          AND course_id = $2
          `,
          [
            user.user_id,
            courseId
          ]
        );
      }

      /* =====================================
         CREATE USER NOTIFICATION
      ===================================== */

      await client.query(
        `
        INSERT INTO notifications
        (
          user_id,
            course_id,
          title,
          message,
          type,
          is_read,
          created_at
        )

        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          false,
          NOW()
        )
        `,
        [
          user.user_id,
            courseId,

          'Course Updated',

          shouldReset
            ? `The course "${title}" has been updated. Your progress has been reset because lessons/content changed.`
            : `The course "${title}" has received new updates.`,

          'course_update'
        ]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message:
        'Course updated successfully and users notified.'
    });

  } catch (error) {

    await client.query('ROLLBACK');

    console.error(
      '❌ Update Course Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update course.',
      error: error.message
    });

  } finally {
    client.release();
  }
};

/* =====================================================
   DELETE COURSE
===================================================== */
export const adminDeleteCourse = async (req, res) => {

  try {

    const { courseId } = req.params;

    await pool.query(
      `
      DELETE FROM lessons
      WHERE course_id = $1
      `,
      [courseId]
    );

    await pool.query(
      `
      DELETE FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully."
    });

  } catch (error) {

    console.error(
      "❌ Delete Course Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete course"
    });
  }
};



/* =====================================================
   GET COURSE LESSONS
===================================================== */
export const adminGetCourseLessons = async (req, res) => {

  try {

    const { courseId } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        course_id,
        title,
        content,
        video_id,
        quiz,
        sequence_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY sequence_order ASC
      `,
      [courseId]
    );

    const lessons = result.rows.map((lesson) => ({

      id: lesson.id,

      title: lesson.title || '',

      content: lesson.content || '',

      videoId: lesson.video_id || '',

      quiz:
        lesson.quiz
          ? (
              typeof lesson.quiz === 'string'
                ? JSON.parse(lesson.quiz)
                : lesson.quiz
            )
          : []

    }));

    return res.status(200).json({
      success: true,
      lessons
    });

  } catch (error) {

    console.error(
      "❌ Fetch Lessons Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: error.message
    });
  }
};



/* =====================================================
   GET SINGLE COURSE FULL DETAILS
===================================================== */
export const adminGetSingleCourse = async (req, res) => {

  try {

    const { courseId } = req.params;

    /* COURSE */
    const courseResult = await pool.query(
      `
      SELECT *
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    if (courseResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    /* LESSONS */
    const lessonsResult = await pool.query(
      `
      SELECT
        id,
        course_id,
        title,
        content,
        video_id,
        quiz,
        sequence_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY sequence_order ASC
      `,
      [courseId]
    );

    const lessons = lessonsResult.rows.map((lesson) => ({

      id: lesson.id,

      title: lesson.title || '',

      content: lesson.content || '',

      videoId: lesson.video_id || '',
quiz:
  lesson.quiz
    ? (
        (
          typeof lesson.quiz === 'string'
            ? JSON.parse(lesson.quiz)
            : lesson.quiz
        ).map((q) => ({
          question: q.question || q.q || '',
          options: q.options || [],
          answer: q.answer || q.correct || ''
        }))
      )
    : []
    }));

    return res.status(200).json({
      success: true,
      course: {
        ...courseResult.rows[0],
        lessons
      }
    });

  } catch (error) {

    console.error(
      "❌ Get Single Course Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
};
/* =====================================================
   UPDATE ADMIN PROFILE
===================================================== */
export const updateAdminProfile = async (req, res) => {

  try {

    const {
      userId,
      name,
      email,
      password
    } = req.body;

    /* =========================================
       VALIDATION
    ========================================= */
    if (!userId || !name || !email) {

      return res.status(400).json({
        success: false,
        message: 'Name and Email are required.'
      });
    }

    /* =========================================
       CHECK ADMIN EXISTS
    ========================================= */
    const adminCheck = await pool.query(
      `
      SELECT *
      FROM admins
      WHERE id = $1
      `,
      [userId]
    );

    if (adminCheck.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Admin not found.'
      });
    }

    const existingAdmin = adminCheck.rows[0];

    /* =========================================
       CHECK EMAIL DUPLICATE
    ========================================= */
    const emailCheck = await pool.query(
      `
      SELECT *
      FROM admins
      WHERE email = $1
      AND id != $2
      `,
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {

      return res.status(400).json({
        success: false,
        message: 'Email already in use by another admin.'
      });
    }

    /* =========================================
       HASH PASSWORD IF PROVIDED
    ========================================= */
    let updatedPassword = existingAdmin.password;

    if (
      password &&
      password.trim() !== ''
    ) {

      const salt = await bcrypt.genSalt(10);

      updatedPassword = await bcrypt.hash(
        password,
        salt
      );
    }

    /* =========================================
       UPDATE ADMIN
    ========================================= */
    const updatedAdmin = await pool.query(
      `
      UPDATE admins

      SET
        username = $1,
        email = $2,
        password = $3

      WHERE id = $4

      RETURNING
        id,
        username,
        email,
        created_at
      `,
      [
        name,
        email,
        updatedPassword,
        userId
      ]
    );

    /* =========================================
       GENERATE NEW TOKEN
    ========================================= */
    const token = jwt.sign(
      {
        id: updatedAdmin.rows[0].id,
        username: updatedAdmin.rows[0].username,
        email: updatedAdmin.rows[0].email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    /* =========================================
       RESPONSE
    ========================================= */
    return res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully.',

      token,

      admin: {
        id: updatedAdmin.rows[0].id,
        username: updatedAdmin.rows[0].username,
        email: updatedAdmin.rows[0].email,
        createdAt: updatedAdmin.rows[0].created_at
      }
    });

  } catch (error) {

    console.error(
      '❌ Admin Profile Update Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update admin profile.',
      error: error.message
    });
  }
};