import pool from "../config/db.js";


// Add activity to a trip stop
export const addItineraryActivity = async (req, res) => {
  try {
    const { tripId, stopId } = req.params;

    const {
      activity_id,
      activity_date,
      activity_time,
      activity_order,
    } = req.body;

    if (!activity_id || !activity_date) {
      return res.status(400).json({
        message: "Activity and activity date are required",
      });
    }

    // Check trip stop belongs to logged-in user's trip
    const [stops] = await pool.query(
      `SELECT
        ts.id,
        ts.city_id,
        ts.arrival_date,
        ts.departure_date
       FROM trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.id = ?
       AND ts.trip_id = ?
       AND t.user_id = ?`,
      [stopId, tripId, req.user.userId]
    );

    if (stops.length === 0) {
      return res.status(404).json({
        message: "Trip stop not found",
      });
    }

    const stop = stops[0];

    // Check activity belongs to the same city
    const [activities] = await pool.query(
      `SELECT
        id,
        estimated_cost
       FROM activities
       WHERE id = ?
       AND city_id = ?`,
      [activity_id, stop.city_id]
    );

    if (activities.length === 0) {
      return res.status(400).json({
        message: "Activity does not belong to this city",
      });
    }

    // Check activity date is within stop dates
    if (
      activity_date < stop.arrival_date ||
      activity_date > stop.departure_date
    ) {
      return res.status(400).json({
        message: "Activity date must be within the trip stop dates",
      });
    }

    // Add activity
    const [result] = await pool.query(
      `INSERT INTO itinerary_activities
       (
         trip_stop_id,
         activity_id,
         activity_date,
         activity_time,
         estimated_cost,
         activity_order
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        stopId,
        activity_id,
        activity_date,
        activity_time || null,
        activities[0].estimated_cost || 0,
        activity_order || 1,
      ]
    );

    res.status(201).json({
      message: "Activity added to itinerary successfully",
      itinerary_activity: {
        id: result.insertId,
        trip_stop_id: Number(stopId),
        activity_id,
        activity_date,
        activity_time: activity_time || null,
        estimated_cost: activities[0].estimated_cost || 0,
        activity_order: activity_order || 1,
      },
    });
  } catch (error) {
    console.error("Add itinerary activity error:", error);

    res.status(500).json({
      message: "Server error while adding activity",
    });
  }
};


// Get all activities for a trip
export const getItineraryActivities = async (req, res) => {
  try {
    const { tripId } = req.params;

    const [activities] = await pool.query(
      `SELECT
        ia.id,
        ia.trip_stop_id,
        ia.activity_id,
        ia.activity_date,
        ia.activity_time,
        ia.estimated_cost,
        ia.activity_order,

        a.name AS activity_name,
        a.description,
        a.category,
        a.duration_minutes,
        a.image_url,

        c.id AS city_id,
        c.name AS city_name,
        c.country

       FROM itinerary_activities ia

       JOIN activities a
         ON ia.activity_id = a.id

       JOIN trip_stops ts
         ON ia.trip_stop_id = ts.id

       JOIN trips t
         ON ts.trip_id = t.id

       JOIN cities c
         ON ts.city_id = c.id

       WHERE ts.trip_id = ?
       AND t.user_id = ?

       ORDER BY
         ia.activity_date ASC,
         ia.activity_time ASC,
         ia.activity_order ASC`,
      [tripId, req.user.userId]
    );

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Get itinerary activities error:", error);

    res.status(500).json({
      message: "Server error while fetching itinerary activities",
    });
  }
};


// Update itinerary activity
export const updateItineraryActivity = async (req, res) => {
  try {
    const {
      tripId,
      itineraryActivityId,
    } = req.params;

    const {
      activity_date,
      activity_time,
      activity_order,
    } = req.body;

    if (!activity_date) {
      return res.status(400).json({
        message: "Activity date is required",
      });
    }

    const [result] = await pool.query(
      `UPDATE itinerary_activities ia

       JOIN trip_stops ts
         ON ia.trip_stop_id = ts.id

       JOIN trips t
         ON ts.trip_id = t.id

       SET
         ia.activity_date = ?,
         ia.activity_time = ?,
         ia.activity_order = ?

       WHERE ia.id = ?
       AND ts.trip_id = ?
       AND t.user_id = ?`,
      [
        activity_date,
        activity_time || null,
        activity_order || 1,
        itineraryActivityId,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Itinerary activity not found",
      });
    }

    res.status(200).json({
      message: "Itinerary activity updated successfully",
    });
  } catch (error) {
    console.error("Update itinerary activity error:", error);

    res.status(500).json({
      message: "Server error while updating itinerary activity",
    });
  }
};


// Delete itinerary activity
export const deleteItineraryActivity = async (req, res) => {
  try {
    const {
      tripId,
      itineraryActivityId,
    } = req.params;

    const [result] = await pool.query(
      `DELETE ia
       FROM itinerary_activities ia

       JOIN trip_stops ts
         ON ia.trip_stop_id = ts.id

       JOIN trips t
         ON ts.trip_id = t.id

       WHERE ia.id = ?
       AND ts.trip_id = ?
       AND t.user_id = ?`,
      [
        itineraryActivityId,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Itinerary activity not found",
      });
    }

    res.status(200).json({
      message: "Itinerary activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete itinerary activity error:", error);

    res.status(500).json({
      message: "Server error while deleting itinerary activity",
    });
  }
};