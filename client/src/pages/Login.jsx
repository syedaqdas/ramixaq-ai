import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, token } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan text-xl font-black text-zinc-950">
            RA
          </div>
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
