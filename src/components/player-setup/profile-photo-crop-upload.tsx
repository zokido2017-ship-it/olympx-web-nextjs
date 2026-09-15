"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import {
  computeCenteredSquareCrop,
  cropImageToFile,
  loadImageFromFile,
} from "@/lib/image-crop";
import {
  PROFILE_PHOTO_ACCEPT,
  validateProfilePhoto,
} from "@/lib/player-profile-mappers";

type ProfilePhotoCropUploadProps = {
  previewUrl: string | null;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
  error?: string | null;
};

export function ProfilePhotoCropUpload({
  previewUrl,
  onPhotoChange,
  error,
}: ProfilePhotoCropUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  const resetDialogState = useCallback(() => {
    if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    setSourceFile(null);
    setSourcePreview(null);
    setLoadedImage(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setLocalError(null);
    setIsSaving(false);
    dragOrigin.current = null;
  }, [sourcePreview]);

  useEffect(() => {
    return () => {
      if (sourcePreview) URL.revokeObjectURL(sourcePreview);
    };
  }, [sourcePreview]);

  const openCropper = async (file: File) => {
    const validationError = validateProfilePhoto(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    resetDialogState();
    const preview = URL.createObjectURL(file);
    setSourceFile(file);
    setSourcePreview(preview);
    setDialogOpen(true);

    try {
      const image = await loadImageFromFile(file);
      setLoadedImage(image);
    } catch {
      setLocalError("Could not load the selected image.");
      setDialogOpen(false);
    }
  };

  const onFileSelected = (file: File | undefined) => {
    if (!file) return;
    void openCropper(file);
  };

  const onConfirmCrop = async () => {
    if (!loadedImage || !sourceFile) return;

    setIsSaving(true);
    setLocalError(null);
    try {
      const crop = computeCenteredSquareCrop(
        loadedImage.width,
        loadedImage.height,
        zoom,
        offset.x,
        offset.y,
      );
      const mimeType = "image/jpeg";
      const extension = "jpg";
      const cropped = await cropImageToFile(
        loadedImage,
        crop,
        `profile-photo.${extension}`,
        mimeType,
      );
      const validationError = validateProfilePhoto(cropped);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      onPhotoChange(cropped, URL.createObjectURL(cropped));
      setDialogOpen(false);
      resetDialogState();
    } catch (cropError) {
      setLocalError(
        cropError instanceof Error
          ? cropError.message
          : "Could not crop the image.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cropPreview = loadedImage
    ? computeCenteredSquareCrop(
        loadedImage.width,
        loadedImage.height,
        zoom,
        offset.x,
        offset.y,
      )
    : null;

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-center pb-1">
          <button
            type="button"
            aria-label="Upload profile photo"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              onFileSelected(file);
            }}
            className={cn(
              "relative flex size-[96px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-200 sm:size-[112px]",
              isDragging
                ? "border-sportxo-blue bg-[#EFF6FF]"
                : "border-[#CBD5E1] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] hover:border-sportxo-blue/45 hover:bg-[#F8FAFC]",
            )}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <>
                <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sportxo-blue shadow-sm">
                  <UploadCloud className="size-5" aria-hidden />
                </span>
                <span className="mt-2 text-xs font-semibold text-sportxo-navy">
                  Photo
                </span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={PROFILE_PHOTO_ACCEPT}
            className="hidden"
            onChange={(event) => onFileSelected(event.target.files?.[0])}
          />
        </div>
        <p className="text-center text-xs text-sportxo-text-muted">
          Optional. JPEG, PNG, or WebP up to 5 MB. You can crop after selecting.
        </p>
        {(error || localError) && !dialogOpen ? (
          <p className="text-center text-xs text-red-600">{error || localError}</p>
        ) : null}
      </div>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetDialogState();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-base font-bold text-sportxo-navy">
                Crop profile photo
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close crop dialog"
                  className="rounded-full p-1 text-sportxo-text-muted hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            <div
              className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl bg-[#0F172A]"
              onPointerDown={(event) => {
                dragOrigin.current = {
                  x: event.clientX,
                  y: event.clientY,
                  offsetX: offset.x,
                  offsetY: offset.y,
                };
              }}
              onPointerMove={(event) => {
                if (!dragOrigin.current) return;
                setOffset({
                  x: dragOrigin.current.offsetX + (event.clientX - dragOrigin.current.x),
                  y: dragOrigin.current.offsetY + (event.clientY - dragOrigin.current.y),
                });
              }}
              onPointerUp={() => {
                dragOrigin.current = null;
              }}
              onPointerLeave={() => {
                dragOrigin.current = null;
              }}
            >
              {sourcePreview && cropPreview && loadedImage ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${sourcePreview})`,
                    backgroundSize: `${(loadedImage.width / cropPreview.width) * 100 * zoom}% auto`,
                    backgroundPosition: `${-cropPreview.x / cropPreview.width * 100}% ${-cropPreview.y / cropPreview.height * 100}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-sportxo-text-muted">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number.parseFloat(event.target.value))}
                className="w-full"
              />
            </div>

            {localError ? (
              <p className="mt-3 text-xs text-red-600">{localError}</p>
            ) : null}

            <div className="mt-5 flex gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-sportxo-navy"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                disabled={!loadedImage || isSaving}
                onClick={() => void onConfirmCrop()}
                className="flex-1 rounded-xl bg-sportxo-blue px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Use photo"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
