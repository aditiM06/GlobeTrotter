import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
        >
          <span className="text-2xl">🌍</span>

          <span className="text-xl font-bold text-slate-900">
            GlobeTrotter
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Dashboard
          </Link>

          <Link
            to="/trips"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            My Trips
          </Link>

          <Link
            to="/trips/create"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Plan Trip
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name}
            </p>

            <p className="text-xs text-slate-500">
              Traveler
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;