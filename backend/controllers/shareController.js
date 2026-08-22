import crypto from "crypto";
import pool from "../config/db.js";

// Create or enable a public share
export const createShare = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Check that trip belongs to logged-in user
    const [trips] = await pool.query(
      `SELECT id, name
       FROM trips
       WHERE id = ?
       AND user_id = ?`,
      [tripId, req.user.userId]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    // Check if a share already exists
    const [existingShares] = await pool.query(
      `SELECT id, share_token, is_public
       FROM trip_shares
       WHERE trip_id = ?`,
      [tripId]
    );

    // If already exists, simply enable it
    if (existingShares.length > 0) {
      const share = existingShares[0];

      await pool.query(
        `UPDATE trip_shares
         SET is_public = TRUE
         WHERE id = ?`,
        [share.id]
      );

      return res.status(200).json({
        message: "Trip sharing enabled",
        share: {
          share_token: share.share_token,
          is_public: true,
        },
      });
    }

    // Generate unique token
    const shareToken = crypto.randomBytes(32).toString("hex");

    const [result] = await pool.query(
      `INSERT INTO trip_shares
       (trip_id, share_token, is_public)
       VALUES (?, ?, TRUE)`,
      [tripId, shareToken]
    );

    res.status(201).json({
      message: "Trip sharing enabled",
      share: {
        id: result.insertId,
        share_token: shareToken,
        is_public: true,
      },
    });
  } catch (error) {
    console.error("Create share error:", error);

    res.status(500).json({
      message: "Server error while creating share",
    });
  }
};


// Get public itinerary
export const getPublicItinerary = async (req, res) => {
  try {
    const { shareToken } = req.params;

    // Find valid public share
    const [shares] = await pool.query(
      `SELECT
        ts.id AS share_id,
        ts.trip_id,
        ts.share_token,
        t.name AS trip_name,
        t.description AS trip_description,
        t.start_date,
        t.end_date,
        t.cover_photo,
        t.budget,
        u.name AS owner_name

       FROM trip_shares ts

       JOIN trips t
         ON ts.trip_id = t.id

       JOIN users u
         ON t.user_id = u.id

       WHERE ts.share_token = ?
       AND ts.is_public = TRUE`,
      [shareToken]
    );

    if (shares.length === 0) {
      return res.status(404).json({
        message: "Public itinerary not found",
      });
    }

    const trip = shares[0];

    // Get trip stops
    const [stops] = await pool.query(
      `SELECT
        ts.id,
        ts.city_id,
        c.name AS city_name,
        c.country,
        c.region,
        ts.arrival_date,
        ts.departure_date,
        ts.stop_order

       FROM trip_stops ts

       JOIN cities c
         ON ts.city_id = c.id

       WHERE ts.trip_id = ?

       ORDER BY ts.stop_order ASC`,
      [trip.trip_id]
    );

    // Get itinerary activities
    const [activities] = await pool.query(
      `SELECT
        ia.id,
        ia.trip_stop_id,
        ia.activity_date,
        ia.activity_time,
        ia.activity_order,

        a.id AS activity_id,
        a.name AS activity_name,
        a.description,
        a.category,
        a.duration_minutes,
        a.estimated_cost,
        a.image_url

       FROM itinerary_activities ia

       JOIN activities a
         ON ia.activity_id = a.id

       JOIN trip_stops ts
         ON ia.trip_stop_id = ts.id

       WHERE ts.trip_id = ?

       ORDER BY
         ia.activity_date ASC,
         ia.activity_time ASC,
         ia.activity_order ASC`,
      [trip.trip_id]
    );

    res.status(200).json({
      trip: {
        id: trip.trip_id,
        name: trip.trip_name,
        description: trip.trip_description,
        start_date: trip.start_date,
        end_date: trip.end_date,
        cover_photo: trip.cover_photo,
        budget: trip.budget,
        owner_name: trip.owner_name,
      },
      stops,
      activities,
    });
  } catch (error) {
    console.error(
      "Get public itinerary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching public itinerary",
    });
  }
};


// Enable/disable sharing
export const updateShareStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { is_public } = req.body;

    if (typeof is_public !== "boolean") {
      return res.status(400).json({
        message: "is_public must be true or false",
      });
    }

    const [result] = await pool.query(
      `UPDATE trip_shares ts

       JOIN trips t
         ON ts.trip_id = t.id

       SET ts.is_public = ?

       WHERE ts.trip_id = ?
       AND t.user_id = ?`,
      [
        is_public,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Share link not found",
      });
    }

    res.status(200).json({
      message: is_public
        ? "Trip sharing enabled"
        : "Trip sharing disabled",
    });
  } catch (error) {
    console.error(
      "Update share status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating share status",
    });
  }
};


// Delete share link
export const deleteShare = async (req, res) => {
  try {
    const { tripId } = req.params;

    const [result] = await pool.query(
      `DELETE ts
       FROM trip_shares ts

       JOIN trips t
         ON ts.trip_id = t.id

       WHERE ts.trip_id = ?
       AND t.user_id = ?`,
      [
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Share link not found",
      });
    }

    res.status(200).json({
      message: "Share link deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete share error:",
      error
    );

    res.status(500).json({
      message: "Server error while deleting share",
    });
  }
};