import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="grid min-h-screen place-items-center px-4 text-center">
    <div>
      <p className="text-sm uppercase tracking-wide text-cyan">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Page not found</h1>
      <Link className="btn-primary mt-6" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  </main>
);

export default NotFound;

