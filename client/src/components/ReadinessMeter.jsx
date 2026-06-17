const ReadinessMeter = ({ score = 0 }) => {
  const bounded = Math.max(0, Math.min(score, 100));
  const label = bounded >= 80 ? "Ready" : bounded >= 55 ? "Building" : "Needs focus";

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#22d3ee ${bounded * 3.6}deg, #27272a 0deg)`
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-zinc-950">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{bounded}</p>
              <p className="text-xs uppercase tracking-wide text-zinc-500">score</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-cyan">{label}</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Internship readiness</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            The score combines skills, completed projects, certificates, public profile completion, and active internship goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadinessMeter;

