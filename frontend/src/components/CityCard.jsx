const CityCard = ({ city, onAdd }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
      {city.image_url ? (
        <img
          src={city.image_url}
          alt={city.name}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          {city.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {city.country}
          {city.region && ` • ${city.region}`}
        </p>

        <div className="flex items-center justify-between mt-5">
          <div>
            <p className="text-xs text-gray-400">
              Cost Index
            </p>

            <p className="font-semibold text-gray-800">
              {city.cost_index}
            </p>
          </div>

          <button
            onClick={() => onAdd(city)}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition"
          >
            Add to Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityCard;