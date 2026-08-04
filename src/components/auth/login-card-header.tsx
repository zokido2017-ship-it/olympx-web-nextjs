import { SportxoSxLogo } from "@/components/auth/sportxo-sx-logo";

type LoginCardHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function LoginCardHeader({
  title = "Login",
  subtitle = "Welcome back! Let's get you back in the game.",
}: LoginCardHeaderProps) {
  return (
    <div className="relative h-[11.5rem] w-full shrink-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 480 184"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill="#0B1F3A" d="M0 0H480V184H0V0Z" />
        <path
          fill="#2563EB"
          d="M152 0H480V184H108C108 184 196 122 236 184H0V0H152Z"
        />
        <path
          fill="#BFDBFE"
          fillOpacity="0.65"
          d="M136 0L214 0L176 184H88L136 0Z"
        />
        <path
          fill="#FFFFFF"
          d="M0 124C84 168 168 104 252 128C336 152 408 116 480 136V184H0V124Z"
        />
      </svg>

      <div className="relative z-10 flex h-full items-start justify-between px-8 pb-12 pt-7">
        <div className="max-w-[14.5rem]">
          <h1 className="text-[2rem] font-bold leading-none tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm font-medium leading-[1.35] text-white/92">
            {subtitle}
          </p>
        </div>
        <SportxoSxLogo className="-mr-1 mt-0.5" />
      </div>
    </div>
  );
}
