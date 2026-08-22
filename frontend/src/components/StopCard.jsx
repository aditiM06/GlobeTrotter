const StopCard = ({ stop, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Stop {stop.stop_order}
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-1">
            {stop.city_name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {stop.country}
            {stop.region && ` • ${stop.region}`}
          </p>
        </div>

        <button
          onClick={() => onDelete(stop.id)}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">
            Arrival
          </p>

          <p className="text-sm font-medium mt-1">
            {stop.arrival_date}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">
            Departure
          </p>

          <p className="text-sm font-medium mt-1">
            {stop.departure_date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StopCard;