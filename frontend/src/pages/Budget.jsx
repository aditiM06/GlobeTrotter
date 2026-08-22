import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiRequest } from "../services/api";

function Budget() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBudget = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetData, expenseData] = await Promise.all([
        apiRequest(`/trips/${id}/budget`),
        apiRequest(`/trips/${id}/expenses`),
      ]);

      setData(budgetData);
      setExpenses(expenseData.expenses || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load budget");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading budget...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const { trip, summary, category_breakdown } = data;

  const categoryColors = {
    transport: "#6366f1",
    stay: "#8b5cf6",
    activities: "#ec4899",
    meals: "#f59e0b",
    other: "#64748b",
  };

  const chartData = category_breakdown.map((item) => ({
    name:
      item.category.charAt(0).toUpperCase() +
      item.category.slice(1),
    value: Number(item.total),
    category: item.category,
  }));

  const budgetPercentage =
    trip.budget > 0
      ? Math.min((summary.total_spent / trip.budget) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              to={`/trips/${id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Trip
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Budget & Expenses
            </h1>

            <p className="mt-1 text-slate-500">
              {trip.name}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Summary Cards */}
        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Budget
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{Number(trip.budget).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Spent
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              ₹{Number(summary.total_spent).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Remaining
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                summary.remaining_budget < 0
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}
            >
              ₹
              {Math.abs(
                Number(summary.remaining_budget)
              ).toLocaleString()}
            </p>

            {summary.remaining_budget < 0 && (
              <p className="mt-1 text-sm font-medium text-red-500">
                Over budget
              </p>
            )}
          </div>

        </div>

        {/* Progress */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Budget Usage
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {budgetPercentage.toFixed(0)}% of your budget used
              </p>
            </div>

            <span
              className={`text-sm font-semibold ${
                summary.over_budget
                  ? "text-red-600"
                  : "text-indigo-600"
              }`}
            >
              ₹{Number(summary.total_spent).toLocaleString()} / ₹
              {Number(trip.budget).toLocaleString()}
            </span>
          </div>

          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                summary.over_budget
                  ? "bg-red-500"
                  : "bg-indigo-500"
              }`}
              style={{
                width: `${budgetPercentage}%`,
              }}
            />
          </div>

        </div>

        {/* Chart + Breakdown */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Expense Breakdown
            </h2>

            {chartData.length === 0 ? (
              <div className="flex h-72 items-center justify-center">
                <p className="text-slate-400">
                  No expenses recorded yet.
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={
                            categoryColors[
                              entry.category
                            ] || "#94a3b8"
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toLocaleString()}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              By Category
            </h2>

            <div className="mt-5 space-y-4">

              {category_breakdown.length === 0 ? (
                <p className="text-slate-400">
                  No expenses recorded yet.
                </p>
              ) : (
                category_breakdown.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            categoryColors[
                              item.category
                            ] || "#94a3b8",
                        }}
                      />

                      <span className="font-medium capitalize text-slate-700">
                        {item.category}
                      </span>

                    </div>

                    <span className="font-bold text-slate-900">
                      ₹{Number(item.total).toLocaleString()}
                    </span>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>

        {/* Average */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Average Daily Spending
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Based on your current recorded expenses
              </p>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              ₹
              {Number(
                summary.average_per_day
              ).toLocaleString()}
            </p>

          </div>

        </div>

        {/* Expense List */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-slate-900">
              Recent Expenses
            </h2>

          </div>

          {expenses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-400">
                No expenses recorded yet.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">

              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                >
                  <div>

                    <p className="font-semibold capitalize text-slate-800">
                      {expense.category}
                    </p>

                    {expense.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {expense.description}
                      </p>
                    )}

                    {expense.expense_date && (
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          expense.expense_date
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                  <p className="font-bold text-slate-900">
                    ₹
                    {Number(
                      expense.amount
                    ).toLocaleString()}
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default Budget;
