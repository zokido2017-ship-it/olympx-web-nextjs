import { cn } from "@/lib/cn";

type FitnessIconProps = {
  className?: string;
};

export function AppleHealthIcon({ className }: FitnessIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function GoogleFitIcon({ className }: FitnessIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M12 20.8c-4.1-3-6.8-5.6-6.8-8.9 0-2.8 2.2-5.1 5-5.1 1.4 0 2.8.6 3.7 1.6.9-1 2.3-1.6 3.7-1.6 2.8 0 5 2.3 5 5.1 0 3.3-2.7 5.9-6.8 8.9z"
        fill="#4285F4"
        fillOpacity="0.15"
        stroke="#4285F4"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 20.8V7.2"
        stroke="#EA4335"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 20.8 5.2 11.8"
        stroke="#FBBC04"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 20.8 18.8 11.8"
        stroke="#34A853"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FitbitIcon({ className }: FitnessIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <circle cx="12" cy="4.5" r="1.45" />
      <circle cx="8.5" cy="7.5" r="1.45" />
      <circle cx="15.5" cy="7.5" r="1.45" />
      <circle cx="6" cy="11.5" r="1.45" />
      <circle cx="12" cy="11.5" r="1.45" />
      <circle cx="18" cy="11.5" r="1.45" />
      <circle cx="8.5" cy="15.5" r="1.45" />
      <circle cx="15.5" cy="15.5" r="1.45" />
      <circle cx="6" cy="19.5" r="1.45" />
      <circle cx="12" cy="19.5" r="1.45" />
      <circle cx="18" cy="19.5" r="1.45" />
    </svg>
  );
}

type FitnessProviderIconTileProps = {
  children: React.ReactNode;
  className?: string;
};

export function FitnessProviderIconTile({
  children,
  className,
}: FitnessProviderIconTileProps) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-lg border border-[#EEF2F6] bg-[#F4F6F9]",
        className,
      )}
    >
      {children}
    </span>
  );
}
