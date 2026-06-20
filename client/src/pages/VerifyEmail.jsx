import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errors";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { setSessionUser } = useAuth();
  const [status, setStatus] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Verification token is missing.");
      return;
    }

    api.post("/auth/verify-email", { token })
      .then(({ data }) => {
        if (data.user) setSessionUser(data.user);
        setStatus(data.message);
        setSuccess(true);
      })
      .catch((error) => setStatus(getApiErrorMessage(error, "Email verification failed.")));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <section className="card w-full max-w-md p-7 text-center">
        <BadgeCheck className={`mx-auto ${success ? "text-mint" : "text-cyan"}`} size={44} />
        <h1 className="mt-4 text-2xl font-bold text-white">Email verification</h1>
        <p className="mt-3 text-sm text-zinc-400">{status}</p>
        <Link className="btn-primary mt-6" to={success ? "/dashboard" : "/profile"}>
          {success ? "Open dashboard" : "Open profile"}
        </Link>
      </section>
    </main>
  );
};

export default VerifyEmail;
