"use client";

import { Camera, X } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PROFILE_IMAGE_ACCEPT } from "@/lib/olympx/pending-registration-avatar";
import { cn } from "@/lib/utils";

type ProfileAvatarUploadProps = {
  previewUrl: string | null;
  initials: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
};

export function ProfileAvatarUpload({
  previewUrl,
  initials,
  onFileSelect,
  onClear,
  error,
  disabled,
  className,
}: ProfileAvatarUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full",
            "border-2 border-dashed border-slate-200/90 bg-slate-50 shadow-sm transition-all",
            "hover:border-primary/50 hover:bg-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-60",
            "dark:border-white/15 dark:bg-slate-900/50 dark:hover:border-primary/40",
            error && "border-red-400/70 ring-2 ring-red-400/20",
          )}
          aria-label="Upload profile photo (optional)"
        >
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Avatar className="h-full w-full border-0 bg-transparent">
              <AvatarFallback className="bg-slate-100 text-lg font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
          )}
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 transition-colors",
              "group-hover:bg-slate-900/35",
            )}
          >
            <Camera
              className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        </button>

        {previewUrl ? (
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -right-0.5 -top-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Remove profile photo"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        Profile photo{" "}
        <span className="font-medium text-slate-400 dark:text-slate-500">(optional)</span>
      </p>
      <p className="mt-0.5 text-center text-[11px] text-slate-400 dark:text-slate-500">
        JPG, PNG, or WebP · max 2 MB
      </p>
      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
