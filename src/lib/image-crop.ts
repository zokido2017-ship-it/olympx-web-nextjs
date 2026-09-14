export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const MIN_EXPORT_SIZE = 200;

export async function cropImageToFile(
  image: HTMLImageElement,
  crop: CropArea,
  fileName = "profile-photo.jpg",
  mimeType = "image/jpeg",
): Promise<File> {
  const exportSize = Math.max(Math.round(crop.width), MIN_EXPORT_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = exportSize;
  canvas.height = exportSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare image crop.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    exportSize,
    exportSize,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not export cropped image."));
      },
      mimeType,
      0.92,
    );
  });

  return new File([blob], fileName, { type: mimeType });
}

export function computeCenteredSquareCrop(
  imageWidth: number,
  imageHeight: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
): CropArea {
  const baseSize = Math.min(imageWidth, imageHeight) / zoom;
  const width = Math.min(baseSize, imageWidth);
  const height = Math.min(baseSize, imageHeight);
  const maxX = Math.max(imageWidth - width, 0);
  const maxY = Math.max(imageHeight - height, 0);
  const x = Math.min(Math.max((imageWidth - width) / 2 + offsetX, 0), maxX);
  const y = Math.min(Math.max((imageHeight - height) / 2 + offsetY, 0), maxY);

  return { x, y, width, height };
}
