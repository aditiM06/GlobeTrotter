import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiRequest } from "../services/api";

function ItineraryBuilder() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [activities, setActivities] = useState([]);

  const [search, setSearch] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [activityResults, setActivityResults] = useState([]);

  const [selectedCity, setSelectedCity] = useState(null);

  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");

  const [activeStop, setActiveStop] = useState(null);
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");

  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD EVERYTHING
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tripData, stopsData, activitiesData] =
        await Promise.all([
          apiRequest(`/trips/${id}`),
          apiRequest(`/trips/${id}/stops`),
          apiRequest(`/trips/${id}/activities`),
        ]);

      setTrip(tripData.trip);
      setStops(stopsData.stops || []);
      setActivities(activitiesData.activities || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // --------------------------------------------------
  // CITY SEARCH
  // --------------------------------------------------

  const handleCitySearch = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      setCityResults([]);
      return;
    }

    try {
      const data = await apiRequest(
        `/cities?search=${encodeURIComponent(value)}`
      );

      setCityResults(data.cities || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // ACTIVITY SEARCH
  // --------------------------------------------------

  const handleActivitySearch = async (value, stop) => {
    setActivitySearch(value);
    setActiveStop(stop);

    if (!value.trim()) {
      setActivityResults([]);
      return;
    }

    try {
      const data = await apiRequest(
        `/activities?search=${encodeURIComponent(
          value
        )}&city_id=${stop.city_id}`
      );

      setActivityResults(data.activities || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // ADD STOP
  // --------------------------------------------------

  const handleAddStop = async (e) => {
    e.preventDefault();

    if (!selectedCity) {
      setError("Please select a city.");
      return;
    }

    if (!arrivalDate || !departureDate) {
      setError("Please select both dates.");
      return;
    }

    if (new Date(departureDate) < new Date(arrivalDate)) {
      setError("Departure date cannot be before arrival date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiRequest(`/trips/${id}/stops`, {
        method: "POST",
        body: JSON.stringify({
          city_id: selectedCity.id,
          arrival_date: arrivalDate,
          departure_date: departureDate,
          stop_order: stops.length + 1,
        }),
      });

      setSelectedCity(null);
      setSearch("");
      setCityResults([]);
      setArrivalDate("");
      setDepartureDate("");
      setShowAddStop(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE STOP
  // --------------------------------------------------

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm("Remove this destination?")) {
      return;
    }

    try {
      await apiRequest(
        `/trips/${id}/stops/${stopId}`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // ADD ACTIVITY
  // --------------------------------------------------

  const handleAddActivity = async (e) => {
    e.preventDefault();

    if (!activeStop || !selectedActivity) {
      setError("Please select an activity.");
      return;
    }

    if (!activityDate) {
      setError("Please select an activity date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const existingActivities =
        activities.filter(
          (activity) =>
            activity.trip_stop_id === activeStop.id
        );

      await apiRequest(
        `/trips/${id}/stops/${activeStop.id}/activities`,
        {
          method: "POST",
          body: JSON.stringify({
            activity_id: selectedActivity.id,
            activity_date: activityDate,
            activity_time:
              activityTime || null,
            activity_order:
              existingActivities.length + 1,
          }),
        }
      );

      setSelectedActivity(null);
      setActivitySearch("");
      setActivityResults([]);
      setActivityDate("");
      setActivityTime("");
      setShowAddActivity(null);
      setActiveStop(null);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE ACTIVITY
  // --------------------------------------------------

  const handleDeleteActivity = async (
    activityId
  ) => {
    if (!window.confirm("Remove this activity?")) {
      return;
    }

    try {
      await apiRequest(
        `/trips/${id}/activities/${activityId}`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading itinerary...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">

          <Link
            to={`/trips/${id}`}
            className="text-sm font-semibold text-indigo-600"
          >
            ← Back to Trip
          </Link>

          <div className="mt-5 flex items-end justify-between">

            <div>
              <p className="text-sm font-semibold text-indigo-600">
                Itinerary Builder
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {trip?.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Build your journey city by city.
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600">
              {stops.length}{" "}
              {stops.length === 1
                ? "destination"
                : "destinations"}
            </div>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}

            <button
              onClick={() => setError("")}
              className="ml-3 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ADD STOP */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Destinations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add cities and assign travel dates.
              </p>
            </div>

            <button
              onClick={() =>
                setShowAddStop(!showAddStop)
              }
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Add Stop
            </button>

          </div>

          {showAddStop && (
            <form
              onSubmit={handleAddStop}
              className="mt-6 border-t border-slate-100 pt-6"
            >

              {/* CITY */}
              <label className="text-sm font-semibold text-slate-700">
                Search City
              </label>

              <input
                value={search}
                onChange={(e) =>
                  handleCitySearch(e.target.value)
                }
                placeholder="Search Paris, Tokyo, Rome..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />

              {cityResults.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow">

                  {cityResults.map((city) => (
                    <button
                      type="button"
                      key={city.id}
                      onClick={() => {
                        setSelectedCity(city);
                        setSearch(city.name);
                        setCityResults([]);
                      }}
                      className="flex w-full justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {city.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {city.country}
                        </p>
                      </div>

                      <span className="text-xs text-indigo-600">
                        Popularity {city.popularity}
                      </span>
                    </button>
                  ))}

                </div>
              )}

              {selectedCity && (
                <div className="mt-4 rounded-xl bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase text-indigo-600">
                    Selected
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {selectedCity.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedCity.country}
                  </p>
                </div>
              )}

              {/* DATES */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Arrival
                  </label>

                  <input
                    type="date"
                    value={arrivalDate}
                    min={trip.start_date}
                    max={trip.end_date}
                    onChange={(e) =>
                      setArrivalDate(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Departure
                  </label>

                  <input
                    type="date"
                    value={departureDate}
                    min={arrivalDate || trip.start_date}
                    max={trip.end_date}
                    onChange={(e) =>
                      setDepartureDate(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </div>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Adding..."
                    : "Add Destination"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddStop(false)
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </section>

        {/* JOURNEY */}
        <section>

          <h2 className="text-2xl font-bold text-slate-900">
            Your Journey
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add activities to each destination.
          </p>

          <div className="mt-6 space-y-6">

            {stops.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-lg font-semibold text-slate-700">
                  No destinations yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first city above.
                </p>
              </div>
            )}

            {stops.map((stop, index) => {

              const stopActivities =
                activities.filter(
                  (activity) =>
                    activity.trip_stop_id === stop.id
                );

              const addingActivity =
                showAddActivity === stop.id;

              return (
                <div
                  key={stop.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* STOP HEADER */}
                  <div className="p-6">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row">

                      <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                          {index + 1}
                        </div>

                        <div>

                          <h3 className="text-xl font-bold text-slate-900">
                            {stop.city_name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {stop.country}
                            {stop.region &&
                              ` • ${stop.region}`}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                              🛬 {formatDate(stop.arrival_date)}
                            </span>

                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                              🛫 {formatDate(stop.departure_date)}
                            </span>

                          </div>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          handleDeleteStop(stop.id)
                        }
                        className="self-start rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                  {/* ACTIVITIES */}
                  <div className="border-t border-slate-100 bg-slate-50 p-6">

                    <div className="flex items-center justify-between">

                      <div>
                        <h4 className="font-bold text-slate-900">
                          Activities
                        </h4>

                        <p className="text-sm text-slate-500">
                          {stopActivities.length} planned
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowAddActivity(
                            addingActivity
                              ? null
                              : stop.id
                          );

                          setActiveStop(stop);
                          setSelectedActivity(null);
                          setActivitySearch("");
                          setActivityResults([]);
                          setActivityDate("");
                          setActivityTime("");
                        }}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-slate-200"
                      >
                        + Add Activity
                      </button>

                    </div>

                    {/* ACTIVITY SEARCH */}
                    {addingActivity && (
                      <form
                        onSubmit={handleAddActivity}
                        className="mt-5 rounded-xl bg-white p-5 ring-1 ring-slate-200"
                      >

                        <label className="text-sm font-semibold text-slate-700">
                          Search activities
                        </label>

                        <input
                          value={activitySearch}
                          onChange={(e) =>
                            handleActivitySearch(
                              e.target.value,
                              stop
                            )
                          }
                          placeholder={`Things to do in ${stop.city_name}...`}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                        />

                        {activityResults.length > 0 && (
                          <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200">

                            {activityResults.map(
                              (activity) => (
                                <button
                                  type="button"
                                  key={activity.id}
                                  onClick={() => {
                                    setSelectedActivity(
                                      activity
                                    );
                                    setActivitySearch(
                                      activity.name
                                    );
                                    setActivityResults(
                                      []
                                    );
                                  }}
                                  className="w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50"
                                >

                                  <div className="flex justify-between">

                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {activity.name}
                                      </p>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {activity.category ||
                                          "Activity"}
                                        {activity.duration_minutes &&
                                          ` • ${activity.duration_minutes} min`}
                                      </p>
                                    </div>

                                    <span className="font-semibold text-indigo-600">
                                      ₹
                                      {Number(
                                        activity.estimated_cost ||
                                          0
                                      ).toLocaleString()}
                                    </span>

                                  </div>

                                </button>
                              )
                            )}

                          </div>
                        )}

                        {selectedActivity && (
                          <div className="mt-4 rounded-xl bg-indigo-50 p-4">

                            <p className="text-xs font-semibold uppercase text-indigo-600">
                              Selected Activity
                            </p>

                            <p className="mt-1 font-bold text-slate-900">
                              {selectedActivity.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {selectedActivity.description}
                            </p>

                          </div>
                        )}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                          <div>
                            <label className="text-sm font-semibold text-slate-700">
                              Date
                            </label>

                            <input
                              type="date"
                              value={activityDate}
                              min={stop.arrival_date}
                              max={stop.departure_date}
                              onChange={(e) =>
                                setActivityDate(
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-slate-700">
                              Time
                            </label>

                            <input
                              type="time"
                              value={activityTime}
                              onChange={(e) =>
                                setActivityTime(
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                            />
                          </div>

                        </div>

                        <div className="mt-5 flex gap-3">

                          <button
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {saving
                              ? "Adding..."
                              : "Add Activity"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setShowAddActivity(null)
                            }
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                          >
                            Cancel
                          </button>

                        </div>

                      </form>
                    )}

                    {/* ACTIVITY LIST */}
                    {stopActivities.length > 0 && (
                      <div className="mt-5 space-y-3">

                        {stopActivities.map(
                          (activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-slate-200"
                            >

                              <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                                  🎯
                                </div>

                                <div>

                                  <p className="font-semibold text-slate-900">
                                    {activity.activity_name}
                                  </p>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {formatDate(
                                      activity.activity_date
                                    )}

                                    {activity.activity_time &&
                                      ` • ${activity.activity_time.slice(
                                        0,
                                        5
                                      )}`}

                                    {activity.category &&
                                      ` • ${activity.category}`}
                                  </p>

                                </div>

                              </div>

                              <div className="flex items-center gap-4">

                                <span className="text-sm font-semibold text-slate-700">
                                  ₹
                                  {Number(
                                    activity.estimated_cost ||
                                      0
                                  ).toLocaleString()}
                                </span>

                                <button
                                  onClick={() =>
                                    handleDeleteActivity(
                                      activity.id
                                    )
                                  }
                                  className="text-sm font-semibold text-red-500 hover:text-red-600"
                                >
                                  Remove
                                </button>

                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                    {stopActivities.length === 0 &&
                      !addingActivity && (
                        <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                          No activities planned yet.
                        </p>
                      )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </main>
    </div>
  );
}

export default ItineraryBuilder;