import pool from "../config/db.js";

// Search activities
export const searchActivities = async (req, res) => {
  try {
    const { city_id, search, category, max_cost } = req.query;

    let query = `
      SELECT
        a.id,
        a.city_id,
        c.name AS city_name,
        c.country,
        a.name,
        a.description,
        a.category,
        a.duration_minutes,
        a.estimated_cost,
        a.image_url
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1 = 1
    `;

    const values = [];

    if (city_id) {
      query += ` AND a.city_id = ?`;
      values.push(city_id);
    }

    if (search) {
      query += ` AND a.name LIKE ?`;
      values.push(`%${search}%`);
    }

    if (category) {
      query += ` AND a.category = ?`;
      values.push(category);
    }

    if (max_cost) {
      query += ` AND a.estimated_cost <= ?`;
      values.push(max_cost);
    }

    query += ` ORDER BY a.name ASC`;

    const [activities] = await pool.query(query, values);

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Search activities error:", error);

    res.status(500).json({
      message: "Server error while searching activities",
    });
  }
};


// Get one activity
export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(
      `SELECT
        a.id,
        a.city_id,
        c.name AS city_name,
        c.country,
        a.name,
        a.description,
        a.category,
        a.duration_minutes,
        a.estimated_cost,
        a.image_url
       FROM activities a
       JOIN cities c ON a.city_id = c.id
       WHERE a.id = ?`,
      [id]
    );

    if (activities.length === 0) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.status(200).json({
      activity: activities[0],
    });
  } catch (error) {
    console.error("Get activity error:", error);

    res.status(500).json({
      message: "Server error while fetching activity",
    });
  }
};