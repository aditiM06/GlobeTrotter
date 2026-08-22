import pool from "../config/db.js";

export const createTrip = async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      cover_photo,
      budget,
    } = req.body;

    // Basic validation
    if (!name || !start_date || !end_date) {
      return res.status(400).json({
        message: "Trip name, start date and end date are required",
      });
    }

    // Make sure end date is not before start date
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    // Create trip for the logged-in user
    const [result] = await pool.query(
      `INSERT INTO trips
       (user_id, name, description, start_date, end_date, cover_photo, budget)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        name,
        description || null,
        start_date,
        end_date,
        cover_photo || null,
        budget || 0,
      ]
    );

    res.status(201).json({
      message: "Trip created successfully",
      trip: {
        id: result.insertId,
        user_id: req.user.userId,
        name,
        description: description || null,
        start_date,
        end_date,
        cover_photo: cover_photo || null,
        budget: budget || 0,
      },
    });
  } catch (error) {
    console.error("Create trip error:", error);

    res.status(500).json({
      message: "Server error while creating trip",
    });
  }
};


// Get all trips belonging to the logged-in user
export const getMyTrips = async (req, res) => {
  try {
    const [trips] = await pool.query(
      `SELECT
        id,
        name,
        description,
        start_date,
        end_date,
        cover_photo,
        budget,
        created_at
       FROM trips
       WHERE user_id = ?
       ORDER BY start_date ASC`,
      [req.user.userId]
    );

    res.status(200).json({
      trips,
    });
  } catch (error) {
    console.error("Get trips error:", error);

    res.status(500).json({
      message: "Server error while fetching trips",
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const [trips] = await pool.query(
      `SELECT
        id,
        name,
        description,
        start_date,
        end_date,
        cover_photo,
        budget,
        created_at
       FROM trips
       WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.status(200).json({
      trip: trips[0],
    });
  } catch (error) {
    console.error("Get trip error:", error);

    res.status(500).json({
      message: "Server error while fetching trip",
    });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      start_date,
      end_date,
      cover_photo,
      budget,
    } = req.body;

    // Basic validation
    if (!name || !start_date || !end_date) {
      return res.status(400).json({
        message: "Trip name, start date and end date are required",
      });
    }

    // Make sure end date is not before start date
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    // Update only the logged-in user's trip
    const [result] = await pool.query(
      `UPDATE trips
       SET
         name = ?,
         description = ?,
         start_date = ?,
         end_date = ?,
         cover_photo = ?,
         budget = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        description || null,
        start_date,
        end_date,
        cover_photo || null,
        budget || 0,
        id,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.status(200).json({
      message: "Trip updated successfully",
    });
  } catch (error) {
    console.error("Update trip error:", error);

    res.status(500).json({
      message: "Server error while updating trip",
    });
  }
};
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM trips
       WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.status(200).json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip error:", error);

    res.status(500).json({
      message: "Server error while deleting trip",
    });
  }
};