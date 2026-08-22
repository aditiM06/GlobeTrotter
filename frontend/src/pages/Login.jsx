import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      login(data);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">
            🌍
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-slate-500 mt-2">
            Continue planning your adventures
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">
                Password
              </label>

              <button
                type="button"
                className="text-sm text-indigo-600"
              >
                Forgot password?
              </button>
            </div>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;