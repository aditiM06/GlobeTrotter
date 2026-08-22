import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import TripCard from "../components/TripCard";
import { apiRequest } from "../services/api";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/trips");

      setTrips(data.trips || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/trips/${tripId}`, {
        method: "DELETE",
      });

      setTrips((currentTrips) =>
        currentTrips.filter(
          (trip) => trip.id !== tripId
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Trips
            </h1>

            <p className="mt-1 text-slate-500">
              All your adventures in one place.
            </p>
          </div>

          <Link
            to="/trips/create"
            className="rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-700"
          >
            + Plan New Trip
          </Link>

        </div>

        {loading && (
          <div className="py-20 text-center text-slate-500">
            Loading your trips...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">

            <div className="text-5xl">
              🧳
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No trips yet
            </h2>

            <p className="mt-2 text-slate-500">
              Start planning your first adventure.
            </p>

            <Link
              to="/trips/create"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Create Your First Trip
            </Link>

          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default MyTrips;