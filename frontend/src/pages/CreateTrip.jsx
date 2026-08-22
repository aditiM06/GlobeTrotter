import { useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

function CreateTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    cover_photo: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      formData.end_date <
      formData.start_date
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/trips", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget || 0),
        }),
      });

      navigate("/trips");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Plan a New Trip
          </h1>

          <p className="mt-2 text-slate-500">
            Start with the basics. You can add cities
            and activities next.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Trip name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Trip Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. European Summer Adventure"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Dates */}
            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us a little about this trip..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Estimated Budget
              </label>

              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                placeholder="50000"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                Enter your total planned budget.
              </p>
            </div>

            {/* Cover photo */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cover Photo URL
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                type="url"
                name="cover_photo"
                value={formData.cover_photo}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                We'll add actual image uploading later.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/trips")}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create Trip"}
              </button>

            </div>

          </form>
        </div>

      </main>
    </div>
  );
}

export default CreateTrip;