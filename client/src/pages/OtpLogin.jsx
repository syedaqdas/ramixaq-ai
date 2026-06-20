import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import BrandLogo from "../components/BrandLogo";
import DeveloperCredit from "../components/DeveloperCredit";
import FormInput from "../components/FormInput";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const OtpLogin = () => {
  const { token, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/send-otp", { email: email.trim().toLowerCase() });
      setMessage(data.message);
      setStep("otp");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the login code."));
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyOtp({ email: email.trim().toLowerCase(), otp });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not verify the login code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="w-full max-w-md">
        <BrandLogo size="lg" linkTo="/" eager />
        <h1 className="mt-5 text-3xl font-bold text-white">Login with OTP</h1>
        <p className="mt-2 text-sm text-zinc-400">Use a secure 6 digit code sent to your registered email.</p>

        <form className="card mt-6 space-y-4 p-6" onSubmit={step === "email" ? sendOtp : submitOtp}>
          {message && <p className="rounded-md border border-mint/30 bg-mint/10 p-3 text-sm text-green-200">{message}</p>}
          {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <FormInput
            label="Email"
            type="email"
            value={email}
            disabled={step === "otp"}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {step === "otp" && (
            <FormInput
              label="6 digit OTP"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength="6"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
            />
          )}
          <button className="btn-primary w-full" disabled={loading}>
            {step === "email" ? <Mail size={18} /> : <KeyRound size={18} />}
            {loading ? "Please wait..." : step === "email" ? "Send login code" : "Verify and login"}
          </button>
          {step === "otp" && (
            <button className="w-full text-sm font-semibold text-cyan" type="button" onClick={() => { setStep("email"); setOtp(""); setMessage(""); }}>
              Change email or resend
            </button>
          )}
        </form>

        <Link className="mt-5 block text-center text-sm font-semibold text-cyan" to="/login">
          Login with password
        </Link>
        <DeveloperCredit className="mt-7" />
      </section>
    </main>
  );
};

export default OtpLogin;
