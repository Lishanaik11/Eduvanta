import db from '../config/db.js';

/* =====================================================
   CREATE NOTE
===================================================== */
export const createNote = async (req, res) => {

  try {

    const { title, course_id, description } = req.body;

    if (!title || !course_id) {

      return res.status(400).json({
        success: false,
        message: 'Title and Course are required'
      });

    }

    let fileUrl = null;

    if (req.file) {

      fileUrl = `/uploads/notes/${req.file.filename}`;

    }

    const query = `
      INSERT INTO course_notes
      (
        title,
        description,
        course_id,
        file_url,
        uploaded_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const result = await db.query(query, [
      title,
      description || '',
      course_id,
      fileUrl
    ]);

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: result.rows[0]
    });

  } catch (error) {

    console.error('❌ Create Note Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

/* =====================================================
   GET ALL NOTES
===================================================== */
export const getAllNotes = async (req, res) => {

  try {

    const query = `
      SELECT
        cn.id,
        cn.title,
        cn.description,
        cn.course_id,
        cn.file_url,
        cn.uploaded_at,
        c.title AS course_name
      FROM course_notes cn
      LEFT JOIN courses c
      ON cn.course_id = c.id
      ORDER BY cn.uploaded_at DESC;
    `;

    const result = await db.query(query);

    return res.status(200).json({
      success: true,
      notes: result.rows
    });

  } catch (error) {

    console.error('❌ Fetch Notes Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

/* =====================================================
   GET NOTES BY COURSE
===================================================== */
export const getNotesByCourse = async (req, res) => {

  try {

    const { courseId } = req.params;

    const query = `
      SELECT
        id,
        title,
        description,
        course_id,
        file_url,
        uploaded_at
      FROM course_notes
      WHERE course_id = $1
      ORDER BY uploaded_at DESC;
    `;

    const result = await db.query(query, [courseId]);

    return res.status(200).json({
      success: true,
      notes: result.rows
    });

  } catch (error) {

    console.error('❌ Get Notes By Course Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

/* =====================================================
   EDIT NOTE
===================================================== */
export const editNote = async (req, res) => {

  try {

    const { id } = req.params;

    const { title, course_id, description } = req.body;

    let query = `
      UPDATE course_notes
      SET
        title = $1,
        description = $2,
        course_id = $3
    `;

    let values = [
      title,
      description || '',
      course_id
    ];

    if (req.file) {

      query += `,
        file_url = $4
      WHERE id = $5
      RETURNING *;
      `;

      values.push(
        `/uploads/notes/${req.file.filename}`
      );

      values.push(id);

    } else {

      query += `
        WHERE id = $4
        RETURNING *;
      `;

      values.push(id);

    }

    const result = await db.query(query, values);

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: result.rows[0]
    });

  } catch (error) {

    console.error('❌ Edit Note Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

/* =====================================================
   DELETE NOTE
===================================================== */
export const deleteNote = async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(
      `DELETE FROM course_notes WHERE id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {

    console.error('❌ Delete Note Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};
/* =====================================================
   SAVE DOWNLOAD ENTRY
===================================================== */
export const saveDownload = async (req, res) => {

  try {

    const { userId, noteId } = req.body;

    if (!userId || !noteId) {

      return res.status(400).json({
        success: false,
        message: 'User ID and Note ID required'
      });

    }

    // FETCH NOTE DETAILS
    const noteQuery = `
      SELECT
        id,
        title,
        file_url
      FROM course_notes
      WHERE id = $1
    `;

    const noteResult = await db.query(noteQuery, [noteId]);

    if (noteResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });

    }

    const note = noteResult.rows[0];

    // DETECT FILE TYPE
    let fileType = 'PDF';

    if (note.file_url) {

      const ext = note.file_url.split('.').pop();

      fileType = ext || 'PDF';

    }

    // INSERT DOWNLOAD LOG
    const insertQuery = `
      INSERT INTO user_downloads
      (
        note_id,
        title,
        file_type,
        file_url,
        downloaded_at,
        user_id
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        NOW(),
        $5
      )
      RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      note.id,
      note.title,
      fileType,
      note.file_url,
      userId
    ]);

    return res.status(201).json({
      success: true,
      message: 'Download saved',
      download: result.rows[0]
    });

  } catch (error) {

    console.error('❌ Save Download Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

/* =====================================================
   GET USER DOWNLOADS
===================================================== */
export const getUserDownloads = async (req, res) => {

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
        id,
        note_id,
        title,
        file_type,
        file_url,
        downloaded_at,
        user_id
      FROM user_downloads
      WHERE user_id = $1
      ORDER BY downloaded_at DESC;
    `;

    const result = await db.query(query, [userId]);

    return res.status(200).json({
      success: true,
      downloads: result.rows
    });

  } catch (error) {

    console.error('❌ Fetch Downloads Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

};