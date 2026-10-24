import type { PhotoCrop } from '../types';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!acceptedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported format "${file.type || 'unknown'}". Please upload JPG, PNG, or WebP.`,
    };
  }

  // Maximum 25MB per file
  const maxSize = 25 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`,
    };
  }

  return { valid: true };
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function extractDateFromFile(file: File): string {
  // If lastModified is available, format as YYYY-MM-DD
  if (file.lastModified) {
    const date = new Date(file.lastModified);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}

export async function createThumbnail(dataUrl: string, maxWidth = 300, maxHeight = 300): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export interface DrawCropParams {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

/**
 * Calculates non-destructive source crop coordinates for canvas drawImage.
 * Fits the image to cover targetWidth x targetHeight, applying focal point (crop.x, crop.y) and zoom scale.
 */
export function calculateSourceCrop(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number,
  crop: PhotoCrop = { x: 0.5, y: 0.5, scale: 1, rotation: 0 }
): DrawCropParams {
  const targetRatio = targetWidth / targetHeight;
  const imgRatio = imgWidth / imgHeight;

  let baseWidth: number;
  let baseHeight: number;

  if (imgRatio > targetRatio) {
    // Image is wider than target: fit height, crop width
    baseHeight = imgHeight;
    baseWidth = imgHeight * targetRatio;
  } else {
    // Image is taller than target: fit width, crop height
    baseWidth = imgWidth;
    baseHeight = imgWidth / targetRatio;
  }

  // Apply zoom scale (scale >= 1 shrinks the source crop box)
  const scale = Math.max(1, crop.scale || 1);
  const sWidth = baseWidth / scale;
  const sHeight = baseHeight / scale;

  // Focal point (0.5 is center, 0 is left/top, 1 is right/bottom)
  // For baby portrait photography, default y is 0.28 (upper third) to keep faces naturally centered
  const focalX = crop.x ?? 0.5;
  const focalY = crop.y !== undefined ? crop.y : 0.28;

  // Calculate centered position then offset by focal point
  const maxOffsetX = imgWidth - sWidth;
  const maxOffsetY = imgHeight - sHeight;

  const sx = Math.max(0, Math.min(maxOffsetX, focalX * (imgWidth - sWidth)));
  const sy = Math.max(0, Math.min(maxOffsetY, focalY * (imgHeight - sHeight)));

  return {
    sx,
    sy,
    sWidth,
    sHeight,
  };
}

/**
 * Generates an elegant soft sample photograph dataURL for demo / testing
 * with a beautiful baby milestone aesthetic, soft pastel tones, and day label.
 */
export function generateSamplePhotoDataUrl(day: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Soft soothing pastel background
  const hues = [35, 42, 28, 195, 145, 340, 210, 48];
  const hue = hues[(day - 1) % hues.length];
  
  const grad = ctx.createRadialGradient(400, 360, 40, 400, 400, 520);
  grad.addColorStop(0, `hsl(${hue}, 45%, 96%)`);
  grad.addColorStop(0.7, `hsl(${hue}, 40%, 88%)`);
  grad.addColorStop(1, `hsl(${hue}, 35%, 80%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 800);

  // Decorative soft nursery stars & dots
  ctx.fillStyle = `hsla(${hue}, 40%, 40%, 0.15)`;
  for (let i = 0; i < 20; i++) {
    const rx = (Math.sin(day * 13 + i * 29) * 0.5 + 0.5) * 700 + 50;
    const ry = (Math.cos(day * 17 + i * 31) * 0.5 + 0.5) * 700 + 50;
    const r = (i % 3) + 2;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft illustration representing day milestone
  ctx.fillStyle = `hsla(${hue}, 50%, 35%, 0.2)`;
  ctx.beginPath();
  ctx.arc(400, 370, 140, 0, Math.PI * 2);
  ctx.fill();

  // Subtle baby icon or milestone emblem
  ctx.fillStyle = `hsl(${hue}, 45%, 32%)`;
  ctx.font = 'normal 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Day ${day}`, 400, 360);

  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillStyle = `hsl(${hue}, 30%, 45%)`;
  ctx.fillText('Precious Moment', 400, 420);

  // Border frame
  ctx.strokeStyle = `hsla(${hue}, 40%, 30%, 0.25)`;
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 752, 752);

  return canvas.toDataURL('image/jpeg', 0.9);
}
