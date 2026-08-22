import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyTrips from "./pages/MyTrips";
import CreateTrip from "./pages/CreateTrip";
import TripDetails from "./pages/TripDetails";
import ItineraryBuilder from "./pages/ItineraryBuilder";
import Budget from "./pages/Budget";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips/create"
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            }
          />
          <Route
  path="/trips/:id"
  element={
    <ProtectedRoute>
      <TripDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/trips/:id/itinerary"
  element={
    <ProtectedRoute>
      <ItineraryBuilder />
    </ProtectedRoute>
  }
/>

<Route
  path="/trips/:id/budget"
  element={
    <ProtectedRoute>
      <Budget />
    </ProtectedRoute>
  }
/>




        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;