import express from "express";

import {
  addItineraryActivity,
  getItineraryActivities,
  updateItineraryActivity,
  deleteItineraryActivity,
} from "../controllers/itineraryActivityController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:tripId/stops/:stopId/activities",
  authenticateToken,
  addItineraryActivity
);

router.get(
  "/:tripId/activities",
  authenticateToken,
  getItineraryActivities
);

router.put(
  "/:tripId/activities/:itineraryActivityId",
  authenticateToken,
  updateItineraryActivity
);

router.delete(
  "/:tripId/activities/:itineraryActivityId",
  authenticateToken,
  deleteItineraryActivity
);

export default router;