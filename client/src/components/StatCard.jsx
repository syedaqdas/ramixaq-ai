const StatCard = ({ icon: Icon, label, value, accent = "text-cyan" }) => (
  <div className="card p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg border border-line bg-zinc-950 p-3 ${accent}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

export default StatCard;

