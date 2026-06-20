import { Link } from "react-router-dom";

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-36 w-36 sm:h-44 sm:w-44"
};

const BrandLogo = ({ size = "md", linkTo, className = "", eager = false }) => {
  const image = (
    <img
      src="/ramixaq-logo.png"
      alt="Ramixaq AI"
      width="1254"
      height="1254"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={`${sizeClasses[size]} shrink-0 rounded-lg object-cover shadow-xl shadow-cyan/10 ${className}`}
    />
  );

  return linkTo ? (
    <Link className="inline-flex" to={linkTo} aria-label="Ramixaq AI home">
      {image}
    </Link>
  ) : image;
};

export default BrandLogo;
