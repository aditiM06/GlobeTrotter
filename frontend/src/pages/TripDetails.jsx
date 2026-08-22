import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiRequest } from "../services/api"

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);

        const [tripData, stopsData] = await Promise.all([
          apiRequest(`/trips/${id}`),
          apiRequest(`/trips/${id}/stops`),
        ]);

        setTrip(tripData.trip);
        setStops(stopsData.stops);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-slate-500">Loading trip...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-slate-600">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-10">

          <button
            onClick={() => navigate("/trips")}
            className="mb-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← Back to My Trips
          </button>

          <div className="grid gap-8 md:grid-cols-3">

            <div className="md:col-span-2">

              <h1 className="text-4xl font-bold text-slate-900">
                {trip.name}
              </h1>

              <p className="mt-3 text-slate-500">
                {formatDate(trip.start_date)} —{" "}
                {formatDate(trip.end_date)}
              </p>

              {trip.description && (
                <p className="mt-5 max-w-2xl text-slate-600">
                  {trip.description}
                </p>
              )}

            </div>

            <div className="rounded-2xl bg-indigo-50 p-6">
              <p className="text-sm font-medium text-indigo-600">
                Trip Budget
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                ₹{Number(trip.budget || 0).toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {stops.length}{" "}
                {stops.length === 1 ? "destination" : "destinations"}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-8 flex flex-wrap gap-3">

          <Link
            to={`/trips/${id}/itinerary`}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Build Itinerary
          </Link>

          <Link
            to={`/trips/${id}/budget`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Budget
          </Link>

          <Link
            to={`/trips/${id}/calendar`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Calendar
          </Link>
          <Link
  to={`/trips/${trip.id}/budget`}
  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
>
  View Budget
</Link>

        </div>

        {/* Stops */}
        <section>

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Your Journey
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cities included in your trip
              </p>
            </div>

            <Link
              to={`/trips/${id}/itinerary`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage itinerary →
            </Link>

          </div>

          {stops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <h3 className="text-lg font-semibold text-slate-900">
                No destinations yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Start building your journey by adding your first city.
              </p>

              <Link
                to={`/trips/${id}/itinerary`}
                className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add Destination
              </Link>

            </div>
          ) : (
            <div className="space-y-4">

              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {stop.city_name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {stop.country}
                          {stop.region && ` • ${stop.region}`}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {formatDate(stop.arrival_date)} —{" "}
                          {formatDate(stop.departure_date)}
                        </p>
                      </div>

                    </div>

                    <Link
                      to={`/trips/${id}/itinerary`}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Manage
                    </Link>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default TripDetails;