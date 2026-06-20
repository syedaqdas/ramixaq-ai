import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import DeveloperCredit from "../components/DeveloperCredit";

const NotFound = () => (
  <main className="grid min-h-screen place-items-center px-4 text-center">
    <div>
      <div className="flex justify-center">
        <BrandLogo size="md" linkTo="/" eager />
      </div>
      <p className="text-sm uppercase tracking-wide text-cyan">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Page not found</h1>
      <Link className="btn-primary mt-6" to="/">
        Back to Ramixaq AI
      </Link>
      <DeveloperCredit className="mt-8" />
    </div>
  </main>
);

export default NotFound;
