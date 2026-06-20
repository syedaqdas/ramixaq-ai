import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import FormInput from "../components/FormInput";
import ThemeToggle from "../components/ThemeToggle";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/auth/reset-password", {
        token: searchParams.get("token"),
        password
      });
      setMessage(data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reset your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">Choose a new password</h1>
        <form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit}>
          {message && <p className="rounded-md border border-mint/30 bg-mint/10 p-3 text-sm text-green-200">{message}</p>}
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <FormInput label="New password" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <FormInput label="Confirm password" type="password" minLength="6" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          <button className="btn-primary w-full" disabled={submitting || !searchParams.get("token")}>
            <KeyRound size={18} />
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
        <Link className="mt-5 block text-center text-sm font-semibold text-cyan" to="/login">Return to login</Link>
      </section>
    </main>
  );
};

export default ResetPassword;
