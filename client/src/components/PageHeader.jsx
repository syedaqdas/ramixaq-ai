const PageHeader = ({ eyebrow, title, children }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="text-sm font-medium uppercase tracking-wide text-cyan">{eyebrow}</p>}
      <h1 className="page-title mt-1">{title}</h1>
    </div>
    {children}
  </div>
);

export default PageHeader;

