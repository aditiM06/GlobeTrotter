import express from "express";

import {
  addExpense,
  getTripExpenses,
  getBudgetSummary,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:tripId/expenses",
  authenticateToken,
  addExpense
);

router.get(
  "/:tripId/expenses",
  authenticateToken,
  getTripExpenses
);

router.get(
  "/:tripId/budget",
  authenticateToken,
  getBudgetSummary
);

router.put(
  "/:tripId/expenses/:expenseId",
  authenticateToken,
  updateExpense
);

router.delete(
  "/:tripId/expenses/:expenseId",
  authenticateToken,
  deleteExpense
);

export default router;