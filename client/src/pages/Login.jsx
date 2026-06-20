import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/errors";
import FormInput from "../components/FormInput";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-md">
        <div className="mb-8">
          <img
            src="/ramixaq-logo.png"
            alt="Ramixaq AI"
            className="h-24 w-24 rounded-lg object-cover shadow-xl shadow-cyan/10"
          />
          <h1 className="mt-5 text-3xl font-bold text-white">Ramixaq AI</h1>
          <p className="mt-2 text-sm font-semibold text-cyan">Build. Track. Achieve.</p>
          <p className="mt-2 text-sm text-zinc-400">
            An AI-powered career intelligence and internship readiness platform for students.
          </p>
        </div>

        <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <div className="text-right">
            <Link className="text-xs font-semibold text-cyan hover:text-cyan/80" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            <LogIn size={18} />
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New here?{" "}
          <Link className="font-semibold text-cyan hover:text-cyan/80" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
