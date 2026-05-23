import pool from '../config/db.js';

/* =====================================================
   SUBMIT CONTACT MESSAGE
===================================================== */
export const submitContactMessage = async (req, res) => {
  try {

    const {
      user_id,
      student_name,
      student_email,
      subject,
      message
    } = req.body;

    // Validation
    if (
      !student_name ||
      !student_email ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const query = `
      INSERT INTO contact_messages
      (
        user_id,
        student_name,
        student_email,
        subject,
        message,
        reply_status,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        'Pending',
        NOW()
      )
      RETURNING *;
    `;

    const values = [
      user_id || null,
      student_name.trim(),
      student_email.trim(),
      subject.trim(),
      message.trim()
    ];

    const result = await pool.query(
      query,
      values
    );

    return res.status(201).json({
      success: true,
      message: 'Message submitted successfully',
      data: result.rows[0]
    });

  } catch (error) {

    console.error(
      '❌ Submit Contact Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/* =====================================================
   GET ALL CONTACT MESSAGES
===================================================== */
export const getAllMessages = async (req, res) => {

  try {

    const query = `
      SELECT
        id,
        user_id,
        student_name,
        student_email,
        subject,
        message,
        admin_reply,
        reply_status,
        created_at,
        replied_at
      FROM contact_messages
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      messages: result.rows
    });

  } catch (error) {

    console.error(
      '❌ Fetch Messages Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

/* =====================================================
   DELETE CONTACT MESSAGE
===================================================== */
export const deleteMessage = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM contact_messages
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {

    console.error(
      '❌ Delete Message Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/* =====================================================
   ADMIN REPLY TO MESSAGE
===================================================== */
export const replyToMessage = async (req, res) => {

  try {

    const { id } = req.params;
    const { admin_reply } = req.body;

    if (!admin_reply) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }

    const query = `
      UPDATE contact_messages
      SET
        admin_reply = $1,
        reply_status = 'Replied',
        replied_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(
      query,
      [admin_reply, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: result.rows[0]
    });

  } catch (error) {

    console.error(
      '❌ Reply Message Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};