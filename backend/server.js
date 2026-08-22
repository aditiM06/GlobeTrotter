import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import tripRoutes from "./routes/tripRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import tripStopRoutes from "./routes/tripStopRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import itineraryActivityRoutes from "./routes/itineraryActivityRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/trips", tripStopRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/trips", itineraryActivityRoutes);
app.use("/api/trips", expenseRoutes);
app.use("/api", shareRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "GlobeTrotter backend is working!",
  });
});

// Database test route
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      message: "Database connected successfully!",
      result: rows[0].result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You accessed a protected route!",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});