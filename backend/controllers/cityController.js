import pool from "../config/db.js";

export const searchCities = async (req, res) => {
  try {
    const { search, country, region } = req.query;

    let query = `
      SELECT
        id,
        name,
        country,
        region,
        cost_index,
        popularity,
        image_url
      FROM cities
      WHERE 1 = 1
    `;

    const values = [];

    if (search) {
      query += ` AND name LIKE ?`;
      values.push(`%${search}%`);
    }

    if (country) {
      query += ` AND country = ?`;
      values.push(country);
    }

    if (region) {
      query += ` AND region = ?`;
      values.push(region);
    }

    query += ` ORDER BY popularity DESC`;

    const [cities] = await pool.query(query, values);

    res.status(200).json({
      cities,
    });
  } catch (error) {
    console.error("Search cities error:", error);

    res.status(500).json({
      message: "Server error while searching cities",
    });
  }
};