import express from "express";
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createTrip);
router.get("/", authenticateToken, getMyTrips);
router.get("/:id", authenticateToken, getTripById);
router.put("/:id", authenticateToken, updateTrip);
router.delete("/:id", authenticateToken, deleteTrip);

export default router;