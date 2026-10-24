import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import { CANVAS_DIMENSIONS } from '../constants/dimensions';
import { exportCollage, preloadImages } from '../utils/exportUtils';
import { renderCollageToCanvas } from '../utils/canvasRenderer';
import type { NavTab } from '../components/layout/Navbar';

interface ExportPreviewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({ onNavigate }) => {
  const { config, photos, profile } = useCollage();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [format, setFormat] = useState<'png' | 'jpeg' | 'pdf'>('png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.95);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStep, setExportStep] = useState<string>('');
  const [imageElements, setImageElements] = useState<Map<number, HTMLImageElement>>(new Map());

  const currentDim = CANVAS_DIMENSIONS[config.dimensionId] || CANVAS_DIMENSIONS['portrait-4-5'];
  const targetWidth = config.customWidth || currentDim.width;
  const targetHeight = config.customHeight || currentDim.height;

  // Preload images
  useEffect(() => {
    let isMounted = true;
    preloadImages(photos).then((loaded) => {
      if (isMounted) setImageElements(loaded);
    });
    return () => {
      isMounted = false;
    };
  }, [photos]);

  // Render preview canvas
  const renderPreview = useCallback(async () => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;

    // High quality scaled down preview for DOM
    const previewWidth = 1200;
    const previewHeight = Math.round(previewWidth / currentDim.aspectRatio);

    canvas.width = previewWidth;
    canvas.height = previewHeight;

    await renderCollageToCanvas({
      canvas,
      config,
      photos,
      profile,
      imageElements,
      showGuides: false,
    });
  }, [config, photos, profile, imageElements, currentDim]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Handle Export Action
  const handleDownload = async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportStep('Initializing high-resolution renderer...');

    try {
      await exportCollage({
        config,
        photos,
        profile,
        format,
        jpegQuality,
        onProgress: (step, percent) => {
          setExportStep(step);
          setExportProgress(percent);
        },
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please check memory limits or try PNG/JPEG format.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportStep('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] dark:border-zinc-800">
        <div>
          <button
            onClick={() => onNavigate('studio')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80664C] dark:text-amber-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Studio Editor</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight">
            Export Keepsake
          </h1>
          <p className="text-sm text-[#73675C] dark:text-zinc-400 mt-1">
            Generate full studio-resolution files suitable for home and professional lab printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#537557] hover:bg-[#436247] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 group"
          >
            <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
            <span>{isExporting ? 'Generating Keepsake...' : `Download ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar when exporting */}
      {isExporting && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-2 animate-pulse">
          <div className="flex justify-between text-xs font-medium text-[#42372E] dark:text-zinc-300">
            <span>{exportStep}</span>
            <span>{exportProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-[#F3EDE4] dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#537557] rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: Left Settings & Specs, Right Big Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Export Format & Specs */}
        <div className="space-y-6">
          {/* Format Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
              Select Output Format
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  id: 'png' as const,
                  label: 'PNG Image (Lossless)',
                  desc: 'Maximum crystal clarity, uncompressed pixels. Ideal for photo labs and archives.',
                  icon: ImageIcon,
                },
                {
                  id: 'jpeg' as const,
                  label: 'JPEG Image (Compact)',
                  desc: 'Standard high-definition photograph format with adjustable compression.',
                  icon: ImageIcon,
                },
                {
                  id: 'pdf' as const,
                  label: 'Print-Ready PDF Document',
                  desc: 'Vector-embedded document calibrated for home/commercial desktop printers.',
                  icon: FileText,
                },
              ].map((fmt) => {
                const isSelected = format === fmt.id;
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#80664C] dark:border-amber-400 bg-[#FAF7F2] dark:bg-zinc-800/80 shadow-sm ring-1 ring-[#80664C]'
                        : 'border-[#E5DACD] dark:border-zinc-800 hover:border-[#C4B39F] bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-[#80664C] dark:text-amber-400' : 'text-zinc-400'}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-[#2C2723] dark:text-zinc-100">
                        {fmt.label}
                      </h4>
                      <p className="text-[11px] text-[#7A6E64] dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {fmt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* JPEG Quality Slider if JPEG is selected */}
            {format === 'jpeg' && (
              <div className="pt-3 border-t border-[#EAE3D9] dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-[#42372E] dark:text-zinc-200">
                  <span>Compression Quality</span>
                  <span>{Math.round(jpegQuality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.0"
                  step="0.02"
                  value={jpegQuality}
                  onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                  className="w-full accent-[#80664C]"
                />
              </div>
            )}
          </div>

          {/* Resolution Specifications */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
              Print Resolution &amp; Dimensions
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F0EAE1] dark:border-zinc-800">
                <span className="text-[#7A6E64] dark:text-zinc-400">Canvas Preset:</span>
                <span className="font-semibold text-[#2C2723] dark:text-zinc-200">
                  {currentDim.label}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0EAE1] dark:border-zinc-800">
                <span className="text-[#7A6E64] dark:text-zinc-400">Pixel Dimensions:</span>
                <span className="font-mono font-semibold text-[#2C2723] dark:text-zinc-200">
                  {targetWidth} × {targetHeight} px
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0EAE1] dark:border-zinc-800">
                <span className="text-[#7A6E64] dark:text-zinc-400">Target Print DPI:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  300 DPI (Studio Grade)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#7A6E64] dark:text-zinc-400">Watermark:</span>
                <span className="font-semibold text-zinc-500">None (Pure Keepsake)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Full original resolution preserved without AI recompression.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Resolution Preview Display */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="w-full p-4 rounded-3xl bg-[#EBE4DC] dark:bg-zinc-800/80 border border-[#DACDC0] dark:border-zinc-700 flex flex-col items-center justify-center shadow-inner overflow-hidden">
            <div className="w-full max-w-xl shadow-2xl rounded-xl overflow-hidden bg-white">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-auto block"
              />
            </div>
            <p className="text-[11px] text-[#7A6E64] dark:text-zinc-400 mt-3 text-center">
              Print Proof Preview • {config.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
