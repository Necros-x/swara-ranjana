"use client";

export const MAX_FINAL_SLIP_BYTES = 5 * 1024 * 1024;
export const MAX_SOURCE_SLIP_BYTES = 20 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function baseName(filename: string) {
  return filename.replace(/\.[^.]+$/, "") || "payment-slip";
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image conversion failed."));
      },
      "image/webp",
      quality,
    );
  });
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 2200;
  const baseScale = Math.min(
    1,
    maxSide / Math.max(bitmap.width, bitmap.height),
  );
  const qualities = [0.86, 0.78, 0.7, 0.62, 0.54];
  let best: Blob | null = null;

  try {
    for (let index = 0; index < qualities.length; index += 1) {
      const extraScale = index < 3 ? 1 : Math.pow(0.86, index - 2);
      const scale = baseScale * extraScale;
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Image compression is not supported by this browser.");
      }

      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, qualities[index]);
      best = blob;

      if (blob.size <= MAX_FINAL_SLIP_BYTES) {
        break;
      }
    }
  } finally {
    bitmap.close();
  }

  if (!best) {
    throw new Error("Image conversion failed.");
  }

  return new File(
    [best],
    `${baseName(file.name)}.webp`,
    {
      type: "image/webp",
      lastModified: Date.now(),
    },
  );
}

async function optimizePdf(file: File) {
  const { PDFDocument } = await import("pdf-lib");
  const source = await file.arrayBuffer();
  const document = await PDFDocument.load(source, {
    ignoreEncryption: false,
    updateMetadata: false,
  });

  const bytes = await document.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  const output = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  return new File(
    [output],
    `${baseName(file.name)}.pdf`,
    {
      type: "application/pdf",
      lastModified: Date.now(),
    },
  );
}

export async function preparePaymentSlip(file: File) {
  if (file.size <= 0) {
    throw new Error("Choose a payment slip first.");
  }

  if (file.size > MAX_SOURCE_SLIP_BYTES) {
    throw new Error(
      "The selected file is larger than 20 MB. Choose a smaller source file.",
    );
  }

  let prepared: File;

  if (IMAGE_TYPES.has(file.type)) {
    prepared = await compressImage(file);
  } else if (file.type === "application/pdf") {
    try {
      prepared = await optimizePdf(file);
    } catch {
      throw new Error(
        "This PDF could not be optimized. Try exporting it again or upload an image of the slip.",
      );
    }
  } else {
    throw new Error("Upload JPG, PNG, WebP or PDF only.");
  }

  if (prepared.size > MAX_FINAL_SLIP_BYTES) {
    throw new Error(
      "The optimized slip is still larger than 5 MB. Export a smaller PDF or use a photo/screenshot of the slip.",
    );
  }

  return prepared;
}
