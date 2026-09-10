import { cn } from "@/lib/cn";

type AuthPrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthPrimaryButton({
  className,
  children,
  type = "button",
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 min-h-[3rem] w-full items-center justify-center rounded-full bg-sportxo-blue px-6 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgb(37_99_235_/_0.9)] transition-all",
        "hover:bg-[#1d4ed8] hover:shadow-[0_14px_28px_-12px_rgb(37_99_235_/_0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/35 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
