import pool from "../config/db.js";


// Add a city to a trip
export const addTripStop = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      city_id,
      arrival_date,
      departure_date,
      stop_order,
    } = req.body;

    // Basic validation
    if (
      !city_id ||
      !arrival_date ||
      !departure_date ||
      stop_order === undefined
    ) {
      return res.status(400).json({
        message:
          "City, arrival date, departure date and stop order are required",
      });
    }

    // Check that the trip belongs to logged-in user
    const [trips] = await pool.query(
      `SELECT id
       FROM trips
       WHERE id = ? AND user_id = ?`,
      [tripId, req.user.userId]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    // Check city exists
    const [cities] = await pool.query(
      `SELECT id
       FROM cities
       WHERE id = ?`,
      [city_id]
    );

    if (cities.length === 0) {
      return res.status(404).json({
        message: "City not found",
      });
    }

    // Validate dates
    if (new Date(departure_date) < new Date(arrival_date)) {
      return res.status(400).json({
        message: "Departure date cannot be before arrival date",
      });
    }

    // Add stop
    const [result] = await pool.query(
      `INSERT INTO trip_stops
       (trip_id, city_id, arrival_date, departure_date, stop_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tripId,
        city_id,
        arrival_date,
        departure_date,
        stop_order,
      ]
    );

    res.status(201).json({
      message: "City added to trip successfully",
      stop: {
        id: result.insertId,
        trip_id: Number(tripId),
        city_id,
        arrival_date,
        departure_date,
        stop_order,
      },
    });
  } catch (error) {
    console.error("Add trip stop error:", error);

    res.status(500).json({
      message: "Server error while adding city to trip",
    });
  }
};


// Get all stops of a trip
export const getTripStops = async (req, res) => {
  try {
    const { tripId } = req.params;

    const [stops] = await pool.query(
      `SELECT
        ts.id,
        ts.trip_id,
        ts.city_id,
        c.name AS city_name,
        c.country,
        c.region,
        c.cost_index,
        c.popularity,
        c.image_url,
        ts.arrival_date,
        ts.departure_date,
        ts.stop_order
       FROM trip_stops ts
       JOIN cities c ON ts.city_id = c.id
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.trip_id = ?
       AND t.user_id = ?
       ORDER BY ts.stop_order ASC`,
      [tripId, req.user.userId]
    );

    res.status(200).json({
      stops,
    });
  } catch (error) {
    console.error("Get trip stops error:", error);

    res.status(500).json({
      message: "Server error while fetching trip stops",
    });
  }
};


// Update a trip stop
export const updateTripStop = async (req, res) => {
  try {
    const { tripId, stopId } = req.params;

    const {
      city_id,
      arrival_date,
      departure_date,
      stop_order,
    } = req.body;

    if (
      !city_id ||
      !arrival_date ||
      !departure_date ||
      stop_order === undefined
    ) {
      return res.status(400).json({
        message:
          "City, arrival date, departure date and stop order are required",
      });
    }

    if (new Date(departure_date) < new Date(arrival_date)) {
      return res.status(400).json({
        message: "Departure date cannot be before arrival date",
      });
    }

    const [result] = await pool.query(
      `UPDATE trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       SET
         ts.city_id = ?,
         ts.arrival_date = ?,
         ts.departure_date = ?,
         ts.stop_order = ?
       WHERE ts.id = ?
       AND ts.trip_id = ?
       AND t.user_id = ?`,
      [
        city_id,
        arrival_date,
        departure_date,
        stop_order,
        stopId,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Trip stop not found",
      });
    }

    res.status(200).json({
      message: "Trip stop updated successfully",
    });
  } catch (error) {
    console.error("Update trip stop error:", error);

    res.status(500).json({
      message: "Server error while updating trip stop",
    });
  }
};


// Delete a trip stop
export const deleteTripStop = async (req, res) => {
  try {
    const { tripId, stopId } = req.params;

    const [result] = await pool.query(
      `DELETE ts
       FROM trip_stops ts
       JOIN trips t ON ts.trip_id = t.id
       WHERE ts.id = ?
       AND ts.trip_id = ?
       AND t.user_id = ?`,
      [stopId, tripId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Trip stop not found",
      });
    }

    res.status(200).json({
      message: "Trip stop deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip stop error:", error);

    res.status(500).json({
      message: "Server error while deleting trip stop",
    });
  }
};