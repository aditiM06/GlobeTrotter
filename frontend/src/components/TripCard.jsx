import { Link } from "react-router";

function TripCard({ trip, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
        {trip.cover_photo && (
          <img
            src={trip.cover_photo}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="p-5">

        <h3 className="text-xl font-bold text-slate-900">
          {trip.name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {formatDate(trip.start_date)} —{" "}
          {formatDate(trip.end_date)}
        </p>

        {trip.description && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">
            {trip.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Budget: ₹{Number(trip.budget || 0).toLocaleString()}
          </span>

          <div className="flex gap-2">
            <Link
              to={`/trips/${trip.id}`}
              className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
            >
              View
            </Link>

            <button
              onClick={() => onDelete(trip.id)}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TripCard;