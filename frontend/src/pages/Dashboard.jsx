import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white sm:p-12">

          <p className="text-sm font-medium text-indigo-100">
            Welcome back, {user?.name} 👋
          </p>

          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Where will your next adventure take you?
          </h1>

          <p className="mt-4 max-w-xl text-indigo-100">
            Plan multi-city trips, discover amazing
            destinations, organize activities, and keep
            your travel budget under control.
          </p>

          <Link
            to="/trips/create"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-indigo-600 hover:bg-indigo-50"
          >
            Start Planning →
          </Link>

        </section>

        {/* Quick actions */}
        <section className="mt-10">

          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">

            <Link
              to="/trips/create"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">✈️</div>

              <h3 className="mt-4 font-bold text-slate-900">
                Plan a Trip
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create a new personalized itinerary.
              </p>
            </Link>

            <Link
              to="/trips"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">🧳</div>

              <h3 className="mt-4 font-bold text-slate-900">
                My Trips
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                View and manage your travel plans.
              </p>
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-3xl">🌎</div>

              <h3 className="mt-4 font-bold text-slate-900">
                Explore
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Discover destinations and activities.
              </p>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;