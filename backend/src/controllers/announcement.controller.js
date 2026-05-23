import pool from '../config/db.js';

/* =========================================================
   CREATE ANNOUNCEMENT
========================================================= */

export const createAnnouncement = async (req, res) => {
  try {

    const {
      title,
      content
    } = req.body;

    const adminId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content required'
      });
    }

    const query = `
      INSERT INTO announcements
      (
        title,
        message,
        source,
        created_by,
        is_active
      )
      VALUES
      (
        $1,
        $2,
        'admin',
        $3,
        true
      )
      RETURNING *
    `;

    const result = await pool.query(
      query,
      [title, content, adminId]
    );

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement: result.rows[0]
    });

  } catch (error) {

    console.error(
      'Create Announcement Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create announcement'
    });
  }
};

/* =========================================================
   GET ALL ANNOUNCEMENTS
========================================================= */
export const getAllAnnouncements = async (req, res) => {
  try {

    const query = `
     SELECT
  id,
  title,
  message AS content,
  source,
  created_by,
  created_at,
  updated_at,
  is_active
FROM announcements
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      announcements: result.rows
    });

  } catch (error) {

    console.error(
      'Fetch Announcements Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
};


/* =========================================================
   UPDATE ANNOUNCEMENT
========================================================= */
export const updateAnnouncement = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      title,
      content
    } = req.body;

    const query = `
  UPDATE announcements
  SET
    title = $1,
    message = $2,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $3
  RETURNING *
`;

    const result = await pool.query(
      query,
      [title, content, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement updated',
      announcement: result.rows[0]
    });

  } catch (error) {

    console.error(
      'Update Announcement Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to update announcement'
    });
  }
};


/* =========================================================
   DELETE ANNOUNCEMENT
========================================================= */
export const deleteAnnouncement = async (req, res) => {
  try {

    const { id } = req.params;

    const query = `
      DELETE FROM announcements
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(
      query,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {

    console.error(
      'Delete Announcement Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement'
    });
  }
};