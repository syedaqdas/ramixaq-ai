const colors = {
  Completed: "border-mint/40 bg-mint/10 text-green-200",
  "In Progress": "border-cyan/40 bg-cyan/10 text-cyan-100",
  Planned: "border-amber/40 bg-amber/10 text-amber-100",
  Archived: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  "Not Started": "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  High: "border-red-500/40 bg-red-500/10 text-red-200",
  Medium: "border-amber/40 bg-amber/10 text-amber-100",
  Low: "border-mint/40 bg-mint/10 text-green-200"
};

const StatusBadge = ({ value }) => <span className={`chip ${colors[value] || ""}`}>{value}</span>;

export default StatusBadge;

