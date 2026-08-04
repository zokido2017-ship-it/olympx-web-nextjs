export function SportsTechVisual() {
  return (
    <div
      className="relative mx-auto mt-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_64px_-12px_rgb(0_0_0/0.45)] backdrop-blur-sm md:mt-14 lg:mt-16"
      aria-hidden
    >
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-sportxo-blue/30 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 size-40 rounded-full bg-cyan-400/20 blur-3xl" />

      <svg
        viewBox="0 0 400 280"
        className="relative z-10 w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="20"
          y="40"
          width="360"
          height="200"
          rx="16"
          stroke="url(#gridStroke)"
          strokeWidth="1"
          fill="url(#panelFill)"
        />
        <path
          d="M20 140 H380"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <path
          d="M200 40 V240"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <circle cx="200" cy="140" r="36" stroke="#2563EB" strokeWidth="2" />
        <circle cx="200" cy="140" r="6" fill="#2563EB" />
        <circle cx="80" cy="90" r="8" fill="#60A5FA" fillOpacity="0.9" />
        <circle cx="320" cy="90" r="8" fill="#60A5FA" fillOpacity="0.9" />
        <circle cx="80" cy="190" r="8" fill="#93C5FD" fillOpacity="0.85" />
        <circle cx="320" cy="190" r="8" fill="#93C5FD" fillOpacity="0.85" />
        <path
          d="M88 90 L192 132 M312 90 L208 132 M88 190 L192 148 M312 190 L208 148"
          stroke="#2563EB"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <rect
          x="48"
          y="248"
          width="120"
          height="8"
          rx="4"
          fill="white"
          fillOpacity="0.15"
        />
        <rect
          x="48"
          y="262"
          width="200"
          height="6"
          rx="3"
          fill="white"
          fillOpacity="0.08"
        />
        <defs>
          <linearGradient id="panelFill" x1="20" y1="40" x2="380" y2="240">
            <stop stopColor="#1E3A5F" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0B1F3A" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gridStroke" x1="20" y1="40" x2="380" y2="240">
            <stop stopColor="#2563EB" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {["Athletes", "Teams", "Tournaments", "Sponsors"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
