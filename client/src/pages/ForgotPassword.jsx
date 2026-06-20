import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import BrandLogo from "../components/BrandLogo";
import DeveloperCredit from "../components/DeveloperCredit";
import FormInput from "../components/FormInput";
import ThemeToggle from "../components/ThemeToggle";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setMessage(data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not request a password reset."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-md">
        <BrandLogo size="md" linkTo="/" eager />
        <h1 className="mt-5 text-3xl font-bold text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your account email and we will send a secure reset link.</p>
        <form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit}>
          {message && <p className="rounded-md border border-mint/30 bg-mint/10 p-3 text-sm text-green-200">{message}</p>}
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <FormInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button className="btn-primary w-full" disabled={submitting}>
            <Mail size={18} />
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link className="mt-5 block text-center text-sm font-semibold text-cyan" to="/login">Back to login</Link>
        <DeveloperCredit className="mt-7" />
      </section>
    </main>
  );
};

export default ForgotPassword;
