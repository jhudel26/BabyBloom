import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import type { BabyProfile, CanvasDimension, CollageConfig, DayPhoto } from '../types';
import { renderCollageToCanvas } from './canvasRenderer';
import { CANVAS_DIMENSIONS } from '../constants/dimensions';

export interface ExportProgressCallback {
  (step: string, percent: number): void;
}

export interface ExportOptions {
  config: CollageConfig;
  photos: Map<number, DayPhoto>;
  profile: BabyProfile;
  format: 'png' | 'jpeg' | 'pdf';
  jpegQuality?: number; // 0.8 to 1.0
  printBleed?: boolean;
  watermark?: boolean;
  onProgress?: ExportProgressCallback;
}

/**
 * Preloads all needed Image elements from data URLs so canvas can render synchronously
 */
export async function preloadImages(photos: Map<number, DayPhoto>): Promise<Map<number, HTMLImageElement>> {
  const map = new Map<number, HTMLImageElement>();
  const promises: Promise<void>[] = [];

  for (const [dayNumber, photo] of photos.entries()) {
    if (photo.dataUrl) {
      const p = new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          map.set(dayNumber, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to preload image for Day ${dayNumber}`);
          resolve();
        };
        img.src = photo.dataUrl;
      });
      promises.push(p);
    }
  }

  await Promise.all(promises);
  return map;
}

/**
 * Creates an offscreen full-resolution canvas, renders the collage, and returns it
 */
export async function generateFullResolutionCanvas(
  config: CollageConfig,
  photos: Map<number, DayPhoto>,
  profile: BabyProfile,
  onProgress?: ExportProgressCallback
): Promise<HTMLCanvasElement> {
  onProgress?.('Preparing dimensions and preloading photos...', 20);

  const dimension: CanvasDimension = CANVAS_DIMENSIONS[config.dimensionId] || CANVAS_DIMENSIONS['portrait-4-5'];
  const targetWidth = config.customWidth || dimension.width;
  const targetHeight = config.customHeight || dimension.height;

  // Offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  onProgress?.('Loading high-resolution photographs...', 45);
  const imageElements = await preloadImages(photos);

  onProgress?.('Composing layout and rendering artwork...', 75);
  await renderCollageToCanvas({
    canvas,
    config,
    photos,
    profile,
    imageElements,
    showGuides: false,
  });

  onProgress?.('Finalizing render...', 90);
  return canvas;
}

/**
 * Exports the collage into PNG, JPEG, or PDF and prompts download
 */
export async function exportCollage(options: ExportOptions): Promise<void> {
  const { config, photos, profile, format, jpegQuality = 0.95, onProgress } = options;

  const canvas = await generateFullResolutionCanvas(config, photos, profile, onProgress);

  const cleanBabyName = profile.name ? profile.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'Baby';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${cleanBabyName}_First_30_Days_Collage_${timestamp}`;

  onProgress?.('Generating downloadable file...', 95);

  if (format === 'png') {
    const dataUrl = canvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, `${filename}.png`);
  } else if (format === 'jpeg') {
    const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
    downloadDataUrl(dataUrl, `${filename}.jpg`);
  } else if (format === 'pdf') {
    // Print-ready PDF
    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: config.dimensionId === 'print-a3' ? 'a3' : 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale canvas into PDF page
    const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
  }

  onProgress?.('Complete!', 100);

  // Joyful confetti milestone celebration!
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E5C07B', '#A88057', '#9C586F', '#537557', '#FAF7F2'],
    });
  } catch {
    // ignore in environments without window/canvas
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
