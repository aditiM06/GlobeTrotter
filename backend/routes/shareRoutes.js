import express from "express";

import {
  createShare,
  getPublicItinerary,
  updateShareStatus,
  deleteShare,
} from "../controllers/shareController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner routes
router.post(
  "/trips/:tripId/share",
  authenticateToken,
  createShare
);

router.put(
  "/trips/:tripId/share",
  authenticateToken,
  updateShareStatus
);

router.delete(
  "/trips/:tripId/share",
  authenticateToken,
  deleteShare
);

// Public route
router.get(
  "/shared/:shareToken",
  getPublicItinerary
);

export default router;