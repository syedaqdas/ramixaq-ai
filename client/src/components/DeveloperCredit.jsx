const DeveloperCredit = ({ className = "" }) => (
  <footer className={`text-center text-xs leading-5 text-zinc-500 ${className}`}>
    Built and Developed by{" "}
    <a
      className="font-semibold text-cyan hover:text-cyan/80"
      href="https://syedaqdas.github.io/Portfolio-Website/"
      target="_blank"
      rel="noreferrer"
    >
      Syed Aqdas Imam
    </a>{" "}
    - Software Developer
  </footer>
);

export default DeveloperCredit;
