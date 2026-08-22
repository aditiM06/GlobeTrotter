import pool from "../config/db.js";

// Add an expense
export const addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      category,
      amount,
      description,
      expense_date,
    } = req.body;

    const validCategories = [
      "transport",
      "stay",
      "activities",
      "meals",
      "other",
    ];

    if (!category || amount === undefined) {
      return res.status(400).json({
        message: "Category and amount are required",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid expense category",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    // Make sure the trip belongs to the logged-in user
    const [trips] = await pool.query(
      `SELECT id, budget, start_date, end_date
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

    const trip = trips[0];

    // Insert expense
    const [result] = await pool.query(
      `INSERT INTO expenses
       (
         trip_id,
         category,
         amount,
         description,
         expense_date
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        tripId,
        category,
        amount,
        description || null,
        expense_date || null,
      ]
    );

    res.status(201).json({
      message: "Expense added successfully",
      expense: {
        id: result.insertId,
        trip_id: Number(tripId),
        category,
        amount: Number(amount),
        description: description || null,
        expense_date: expense_date || null,
      },
    });
  } catch (error) {
    console.error("Add expense error:", error);

    res.status(500).json({
      message: "Server error while adding expense",
    });
  }
};


// Get all expenses for a trip
export const getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user
    const [trips] = await pool.query(
      `SELECT id, name, budget
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

    const [expenses] = await pool.query(
      `SELECT
        id,
        trip_id,
        category,
        amount,
        description,
        expense_date,
        created_at
       FROM expenses
       WHERE trip_id = ?
       ORDER BY expense_date ASC, id ASC`,
      [tripId]
    );

    res.status(200).json({
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      message: "Server error while fetching expenses",
    });
  }
};


// Get budget summary
export const getBudgetSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user
    const [trips] = await pool.query(
      `SELECT
        id,
        name,
        budget,
        start_date,
        end_date
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

    const trip = trips[0];

    // Total spent + category breakdown
    const [categoryRows] = await pool.query(
      `SELECT
        category,
        SUM(amount) AS total
       FROM expenses
       WHERE trip_id = ?
       GROUP BY category
       ORDER BY total DESC`,
      [tripId]
    );

    // Total expense
    const [totalRows] = await pool.query(
      `SELECT
        COALESCE(SUM(amount), 0) AS total_spent
       FROM expenses
       WHERE trip_id = ?`,
      [tripId]
    );

    const budget = Number(trip.budget || 0);
    const totalSpent = Number(totalRows[0].total_spent || 0);
    const remaining = budget - totalSpent;

    // Number of trip days
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    const tripDays =
      Math.floor(
        (endDate - startDate) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const averagePerDay =
      tripDays > 0
        ? totalSpent / tripDays
        : 0;

    res.status(200).json({
      trip: {
        id: trip.id,
        name: trip.name,
        budget,
        start_date: trip.start_date,
        end_date: trip.end_date,
      },

      summary: {
        total_spent: Number(totalSpent.toFixed(2)),
        remaining_budget: Number(remaining.toFixed(2)),
        average_per_day: Number(
          averagePerDay.toFixed(2)
        ),
        over_budget: totalSpent > budget,
      },

      category_breakdown: categoryRows.map(
        (row) => ({
          category: row.category,
          total: Number(
            Number(row.total).toFixed(2)
          ),
        })
      ),
    });
  } catch (error) {
    console.error(
      "Get budget summary error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while calculating budget",
    });
  }
};


// Update expense
export const updateExpense = async (req, res) => {
  try {
    const {
      tripId,
      expenseId,
    } = req.params;

    const {
      category,
      amount,
      description,
      expense_date,
    } = req.body;

    const validCategories = [
      "transport",
      "stay",
      "activities",
      "meals",
      "other",
    ];

    if (!category || amount === undefined) {
      return res.status(400).json({
        message: "Category and amount are required",
      });
    }

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid expense category",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: "Amount cannot be negative",
      });
    }

    const [result] = await pool.query(
      `UPDATE expenses e
       JOIN trips t
         ON e.trip_id = t.id

       SET
         e.category = ?,
         e.amount = ?,
         e.description = ?,
         e.expense_date = ?

       WHERE e.id = ?
       AND e.trip_id = ?
       AND t.user_id = ?`,
      [
        category,
        amount,
        description || null,
        expense_date || null,
        expenseId,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error(
      "Update expense error:",
      error
    );

    res.status(500).json({
      message: "Server error while updating expense",
    });
  }
};


// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const {
      tripId,
      expenseId,
    } = req.params;

    const [result] = await pool.query(
      `DELETE e
       FROM expenses e
       JOIN trips t
         ON e.trip_id = t.id

       WHERE e.id = ?
       AND e.trip_id = ?
       AND t.user_id = ?`,
      [
        expenseId,
        tripId,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete expense error:",
      error
    );

    res.status(500).json({
      message: "Server error while deleting expense",
    });
  }
};