import pool from "../db.js";

export default async function handler(req, res) {
  try {
    const result = await pool.query("SELECT NOW()");
    
    return res.status(200).json({
      success: true,
      time: result.rows[0]
    });

  } catch (err) {
    console.error("DB ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}