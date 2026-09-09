import Image from "next/image";
import { cn } from "@/lib/cn";

type SportAssetIconProps = {
  src: string;
  alt: string;
  /** Outer box size in pixels (icon scales inside with object-contain). */
  size?: number;
  className?: string;
};

/** Renders sport artwork PNGs centered in a square box without color filters. */
export function SportAssetIcon({
  src,
  alt,
  size = 36,
  className,
}: SportAssetIconProps) {
  const innerSize = Math.round(size * 0.88);

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={innerSize}
        height={innerSize}
        unoptimized
        draggable={false}
        sizes={`${innerSize}px`}
        className="pointer-events-none block h-auto w-auto max-h-full max-w-full object-contain object-center"
      />
    </span>
  );
}
