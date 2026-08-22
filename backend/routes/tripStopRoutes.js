import express from "express";

import {
  addTripStop,
  getTripStops,
  updateTripStop,
  deleteTripStop,
} from "../controllers/tripStopController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:tripId/stops", authenticateToken, addTripStop);

router.get("/:tripId/stops", authenticateToken, getTripStops);

router.put(
  "/:tripId/stops/:stopId",
  authenticateToken,
  updateTripStop
);

router.delete(
  "/:tripId/stops/:stopId",
  authenticateToken,
  deleteTripStop
);

export default router;