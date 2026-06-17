const EmptyState = ({ title, message, action }) => (
  <div className="card flex flex-col items-start gap-3 p-6 text-sm text-zinc-400">
    <p className="text-base font-semibold text-zinc-100">{title}</p>
    <p>{message}</p>
    {action}
  </div>
);

export default EmptyState;

