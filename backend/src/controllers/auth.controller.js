import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

/* =========================
   SIGNUP CONTROLLER
========================= */
export const signup = async (req, res) => {
  console.log("📥 RECEIVED BY BACKEND CONTROLLER:", req.body);

  try {
    const { name, phone, email, password } = req.body;

    // Validation
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing email
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      `
      INSERT INTO users
      (
        name,
        phone,
        email,
        password
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )

      RETURNING
        id,
        name,
        phone,
        email,
        created_at
      `,
      [
        name,
        phone,
        email,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error('❌ Signup Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server database error processing signup request.',
    });
  }
};


/* =========================
   LOGIN CONTROLLER
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Fetch user
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Email or Password',
      });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Email or Password',
      });
    }

    // Send user data
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not Provided',
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server database error processing login request.',
    });
  }
};


/* =========================
   GET USER PROFILE
========================= */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.error("❌ Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


/* =========================
   UPDATE USER PROFILE
========================= */
export const updateUserProfile = async (req, res) => {
  try {
    console.log("📥 UPDATE PROFILE BODY:", req.body);

    const {
      userId,
      name,
      email,
      phone,
      password,
    } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    // Check duplicate email
    const emailCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id != $2
      `,
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another account",
      });
    }

    // Hash password if provided
    let hashedPassword = null;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let query = `
      UPDATE users
      SET
        name = $1,
        email = $2,
        phone = $3
    `;

    const values = [
      name,
      email,
      phone,
    ];

    // Password update
    if (hashedPassword) {
      query += `,
        password = $4
      `;

      values.push(hashedPassword);

      query += `
        WHERE id = $5
        RETURNING
          id,
          name,
          email,
          phone
      `;

      values.push(userId);

    } else {

      query += `
        WHERE id = $4
        RETURNING
          id,
          name,
          email,
          phone
      `;

      values.push(userId);
    }

    console.log("🧠 FINAL QUERY:", query);
    console.log("🧠 VALUES:", values);

    // Execute update
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("❌ Update Profile Error FULL:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
/* =========================
   SEND CONTACT MESSAGE
========================= */
export const sendContactMessage = async (req, res) => {
  try {

    const {
      userId,
      studentName,
      studentEmail,
      subject,
      message
    } = req.body;

    /**
     * VALIDATION
     */
    if (
      !userId ||
      !studentName ||
      !studentEmail ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    /**
     * INSERT MESSAGE
     */
    const insertQuery = `
      INSERT INTO contact_messages
      (
        user_id,
        student_name,
        student_email,
        subject,
        message
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )

      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      userId,
      studentName,
      studentEmail,
      subject,
      message
    ]);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: result.rows[0]
    });

  } catch (error) {

    console.error('❌ Contact Message Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send message.',
      error: error.message
    });
  }
};
/* =========================
   FETCH ALL CONTACT MESSAGES
========================= */
export const getAllContactMessages = async (req, res) => {
  try {

    const query = `
      SELECT *
      FROM contact_messages
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      messages: result.rows
    });

  } catch (error) {

    console.error('❌ Fetch Contact Messages Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.',
      error: error.message
    });
  }
};
/* =========================
   ADMIN REPLY TO MESSAGE
========================= */
export const replyToContactMessage = async (req, res) => {
  try {

    const {
      messageId,
      adminReply
    } = req.body;

    /**
     * VALIDATION
     */
    if (!messageId || !adminReply) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and reply required.'
      });
    }

    /**
     * UPDATE REPLY
     */
    const updateQuery = `
      UPDATE contact_messages

      SET
        admin_reply = $1,
        reply_status = 'Replied',
        replied_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      adminReply,
      messageId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      data: result.rows[0]
    });

  } catch (error) {

    console.error('❌ Reply Contact Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to reply.',
      error: error.message
    });
  }
};
/* =========================
   FETCH USER CONTACT MESSAGES
========================= */
export const getUserContactMessages = async (req, res) => {
  try {

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required.'
      });
    }

    const query = `
      SELECT
        id,
        subject,
        message,
        admin_reply,
        reply_status,
        created_at,
        replied_at

      FROM contact_messages

      WHERE user_id = $1

      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return res.status(200).json({
      success: true,
      messages: result.rows
    });

  } catch (error) {

    console.error('❌ Fetch User Messages Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user messages.',
      error: error.message
    });
  }
};