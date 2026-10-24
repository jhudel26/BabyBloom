import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  Palette,
  Layout,
  Sliders,
  Type,
  AlertCircle,
  Eye,
  Check,
  Square,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import { THEMES } from '../constants/themes';
import { COLLAGE_LAYOUTS } from '../constants/layouts';
import { CANVAS_DIMENSIONS } from '../constants/dimensions';
import type { CollageLayoutType, ThemeId, CanvasDimensionId } from '../types';
import { renderCollageToCanvas } from '../utils/canvasRenderer';
import { preloadImages } from '../utils/exportUtils';
import { computeCollageLayout, type LayoutSlot } from '../utils/layoutEngine';
import type { NavTab } from '../components/layout/Navbar';

interface CollageStudioProps {
  onNavigate: (tab: NavTab) => void;
}

export const CollageStudio: React.FC<CollageStudioProps> = ({ onNavigate }) => {
  const {
    photos,
    profile,
    config,
    updateConfig,
    undo,
    redo,
    canUndo,
    canRedo,
    saveCurrentProject,
    updateCrop,
  } = useCollage();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Studio UI state
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [activeTab, setActiveTab] = useState<'layout' | 'theme' | 'dimensions' | 'style' | 'text'>('layout');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showPrintGuides, setShowPrintGuides] = useState<boolean>(false);
  const [imageElements, setImageElements] = useState<Map<number, HTMLImageElement>>(new Map());

  // Interactive In-Collage Slot Drag & Face Adjuster State
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [draggingDay, setDraggingDay] = useState<number | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; scale: number; rotation: number };
    slot: LayoutSlot;
  } | null>(null);

  // Compute Layout Dimensions
  const dim = CANVAS_DIMENSIONS[config.dimensionId] || CANVAS_DIMENSIONS['portrait-4-5'];
  const previewWidth = 1400;
  const previewHeight = Math.round(previewWidth / dim.aspectRatio);
  const computedLayout = computeCollageLayout(config, previewWidth, previewHeight);

  // Count missing days
  const missingDays: number[] = [];
  for (let d = 1; d <= 30; d++) {
    if (!photos.has(d)) missingDays.push(d);
  }

  // Preload images whenever photos change
  useEffect(() => {
    let isMounted = true;
    preloadImages(photos).then((loadedMap) => {
      if (isMounted) {
        setImageElements(loadedMap);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [photos]);

  // Render canvas whenever dependencies change
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    if (canvas.width !== previewWidth || canvas.height !== previewHeight) {
      canvas.width = previewWidth;
      canvas.height = previewHeight;
    }

    await renderCollageToCanvas({
      canvas,
      config,
      photos,
      profile,
      imageElements,
      showGuides: showPrintGuides,
    });
  }, [config, photos, profile, imageElements, showPrintGuides, previewWidth, previewHeight]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle In-Collage Slot Dragging for Instant Face Repositioning
  const handleSlotPointerDown = (e: React.PointerEvent, slot: LayoutSlot) => {
    const photo = photos.get(slot.dayNumber);
    if (!photo) return;

    e.preventDefault();
    e.stopPropagation();
    setSelectedDay(slot.dayNumber);
    setDraggingDay(slot.dayNumber);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...(photo.crop || { x: 0.5, y: 0.28, scale: 1, rotation: 0 }) },
      slot,
    };
  };

  const handleSlotPointerMove = (e: React.PointerEvent, slot: LayoutSlot) => {
    if (draggingDay !== slot.dayNumber || !dragStateRef.current) return;
    e.preventDefault();

    const { startX, startY, startCrop } = dragStateRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const rect = canvasRef.current?.getBoundingClientRect();
    const visualSlotHeight = rect ? (slot.height * rect.height) / previewHeight : slot.height;
    const visualSlotWidth = rect ? (slot.width * rect.width) / previewWidth : slot.width;

    const sensY = 1.25 / Math.max(80, visualSlotHeight);
    const sensX = 1.25 / Math.max(80, visualSlotWidth);

    // Moving pointer DOWN drags the picture downward inside the frame, revealing the baby's head/face at top (y decreases towards 0)
    const newY = Math.max(0, Math.min(1, startCrop.y - deltaY * sensY));
    const newX = Math.max(0, Math.min(1, startCrop.x - deltaX * sensX));

    updateCrop(slot.dayNumber, {
      ...startCrop,
      x: Number(newX.toFixed(3)),
      y: Number(newY.toFixed(3)),
    });
  };

  const handleSlotPointerUp = (e: React.PointerEvent) => {
    if (draggingDay !== null) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingDay(null);
      dragStateRef.current = null;
    }
  };

  // Instant Face Focus Preset (moves focal point to top 20% where baby's face & smile are located)
  const focusFace = (day: number) => {
    const photo = photos.get(day);
    if (!photo) return;
    const current = photo.crop || { x: 0.5, y: 0.28, scale: 1, rotation: 0 };
    updateCrop(day, {
      ...current,
      y: 0.18,
    });
  };

  const centerPhoto = (day: number) => {
    const photo = photos.get(day);
    if (!photo) return;
    const current = photo.crop || { x: 0.5, y: 0.28, scale: 1, rotation: 0 };
    updateCrop(day, {
      ...current,
      x: 0.5,
      y: 0.5,
    });
  };

  const nudgeCrop = (day: number, dx: number, dy: number) => {
    const photo = photos.get(day);
    if (!photo) return;
    const current = photo.crop || { x: 0.5, y: 0.28, scale: 1, rotation: 0 };
    updateCrop(day, {
      ...current,
      x: Math.max(0, Math.min(1, Number((current.x + dx).toFixed(2)))),
      y: Math.max(0, Math.min(1, Number((current.y + dy).toFixed(2)))),
    });
  };

  const adjustZoom = (day: number, delta: number) => {
    const photo = photos.get(day);
    if (!photo) return;
    const current = photo.crop || { x: 0.5, y: 0.28, scale: 1, rotation: 0 };
    updateCrop(day, {
      ...current,
      scale: Math.max(1, Math.min(2.5, Number((current.scale + delta).toFixed(2)))),
    });
  };

  // Handle Save Project
  const handleSave = async () => {
    setIsSaving(true);
    await saveCurrentProject(config.name);
    setIsSaving(false);
    setSaveSuccessMsg('Project saved successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const selectedPhoto = selectedDay ? photos.get(selectedDay) : null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#F2EDE6] dark:bg-[#121214] animate-fadeIn">
      {/* Studio Top Control Bar */}
      <div className="h-14 border-b border-[#E2D8CC] dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            className="font-serif font-bold text-base sm:text-lg text-[#2C2723] dark:text-zinc-100 bg-transparent hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 px-2 py-1 rounded border border-transparent hover:border-[#DED5C7] dark:hover:border-zinc-700 focus:border-[#9E8265] focus:outline-none transition-colors max-w-[200px] sm:max-w-xs"
            title="Click to rename collage project"
          />

          <div className="h-5 w-px bg-[#E2D8CC] dark:bg-zinc-800 hidden sm:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo last change (Ctrl+Z)"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo change (Ctrl+Y)"
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Canvas Zoom Controls */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAF7F2] dark:bg-zinc-800 px-3 py-1 rounded-full border border-[#E5DACD] dark:border-zinc-700">
          <button
            onClick={() => setZoomScale(Math.max(0.4, zoomScale - 0.1))}
            title="Zoom out"
            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300 min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(Math.min(1.6, zoomScale + 0.1))}
            title="Zoom in"
            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-600 mx-1" />
          <button
            onClick={() => setZoomScale(0.85)}
            title="Fit to Screen"
            className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            Fit
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Print Guides Toggle */}
          <button
            onClick={() => setShowPrintGuides(!showPrintGuides)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showPrintGuides
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                : 'border-[#DED5C7] dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Toggle 0.25 inch print-safe margins guide"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Guides</span>
          </button>

          {/* Save Project Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DED5C7] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Export Keepsake Button */}
          <button
            onClick={() => onNavigate('export')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#537557] hover:bg-[#436247] text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Keepsake</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Canvas + Customization Control Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Central Canvas Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center p-6 relative bg-dot-pattern"
        >
          {/* Missing photos warning banner */}
          {missingDays.length > 0 && (
            <div className="absolute top-4 left-6 right-6 z-10 max-w-xl mx-auto p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/80 backdrop-blur-md border border-amber-300/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{missingDays.length} days not yet uploaded</strong> (e.g. Day {missingDays.slice(0, 3).join(', ')}...). Empty days will display elegant placeholders.
                </span>
              </div>
              <button
                onClick={() => onNavigate('library')}
                className="font-semibold text-amber-800 dark:text-amber-300 underline shrink-0 ml-2"
              >
                Upload Now
              </button>
            </div>
          )}

          {/* Success toast notification */}
          {saveSuccessMsg && (
            <div className="absolute top-4 z-20 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Live Canvas Element with Interactive Drag Overlays */}
          <div
            className="relative transition-transform duration-150 ease-out origin-center shadow-2xl rounded-xl"
            style={{
              transform: `scale(${zoomScale})`,
            }}
          >
            <canvas
              ref={canvasRef}
              className="rounded-lg max-w-full block shadow-inner"
            />

            {/* Interactive Slot Drag & Reposition Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {computedLayout.slots.map((slot) => {
                const photo = photos.get(slot.dayNumber);
                const isSelected = selectedDay === slot.dayNumber;
                const isDraggingThis = draggingDay === slot.dayNumber;
                if (!photo) return null; // Empty slots remain static

                const leftPercent = (slot.x / previewWidth) * 100;
                const topPercent = (slot.y / previewHeight) * 100;
                const widthPercent = (slot.width / previewWidth) * 100;
                const heightPercent = (slot.height / previewHeight) * 100;

                return (
                  <div
                    key={slot.dayNumber}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      borderRadius: `${Math.min(slot.width / 4, config.borderRadius)}px`,
                    }}
                    onPointerDown={(e) => handleSlotPointerDown(e, slot)}
                    onPointerMove={(e) => handleSlotPointerMove(e, slot)}
                    onPointerUp={handleSlotPointerUp}
                    onPointerCancel={handleSlotPointerUp}
                    className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-all select-none group touch-none ${
                      isSelected
                        ? 'ring-4 ring-amber-500/90 shadow-xl z-20'
                        : 'hover:ring-2 hover:ring-amber-400/70 z-10'
                    }`}
                    title={`Day ${slot.dayNumber}: Drag directly on photo to center baby's face`}
                  >
                    {/* Subtle drag hint indicator on hover or selected */}
                    <div className={`absolute bottom-2 inset-x-2 flex items-center justify-center pointer-events-none transition-opacity ${
                      isSelected || isDraggingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] text-white font-medium shadow-sm">
                        <Move className="w-2.5 h-2.5 text-amber-300" />
                        <span>{isDraggingThis ? 'Repositioning...' : 'Drag to center face'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating In-Collage Photo Face Adjuster Bar */}
          {selectedPhoto && selectedDay && (
            <div className="absolute bottom-6 z-30 flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-[#D8C7B5] dark:border-zinc-700 shadow-2xl animate-fadeIn text-xs">
              {/* Day Badge */}
              <div className="flex items-center gap-2 border-r border-[#EAE3D9] dark:border-zinc-800 pr-3">
                <span className="font-serif font-bold text-sm text-[#2C2723] dark:text-zinc-100">
                  Day {selectedDay}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Face Adjuster
                </span>
              </div>

              {/* Instant Focus Face (Upper Third) Button */}
              <button
                onClick={() => focusFace(selectedDay)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-xs transition-all"
                title="Instantly center the baby's face & eyes into the frame"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                <span>Focus Baby Face</span>
              </button>

              {/* Center Photo Button */}
              <button
                onClick={() => centerPhoto(selectedDay)}
                className="px-2.5 py-1.5 rounded-xl border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors font-medium"
                title="Reset focal point to center"
              >
                Center
              </button>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

              {/* Nudge Pan Arrows */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline mr-0.5">Nudge:</span>
                <button
                  onClick={() => nudgeCrop(selectedDay, 0, -0.05)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Move Photo Down / Reveal Top Face"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudgeCrop(selectedDay, 0, 0.05)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Move Photo Up"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudgeCrop(selectedDay, -0.05, 0)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Move Photo Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudgeCrop(selectedDay, 0.05, 0)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Move Photo Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

              {/* Zoom In / Out Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">Zoom:</span>
                <button
                  onClick={() => adjustZoom(selectedDay, -0.1)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 min-w-[32px] text-center">
                  {(selectedPhoto.crop?.scale || 1).toFixed(1)}x
                </span>
                <button
                  onClick={() => adjustZoom(selectedDay, 0.1)}
                  className="p-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close / Dismiss */}
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 ml-1"
                title="Close toolbar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Customization Drawer */}
        <div className="w-80 sm:w-96 border-l border-[#E2D8CC] dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 z-20">
          {/* Sidebar Tab Navigation */}
          <div className="flex border-b border-[#E2D8CC] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-800/60 p-1">
            {[
              { id: 'layout' as const, label: 'Layout', icon: Layout },
              { id: 'theme' as const, label: 'Theme', icon: Palette },
              { id: 'dimensions' as const, label: 'Size', icon: Square },
              { id: 'style' as const, label: 'Borders', icon: Sliders },
              { id: 'text' as const, label: 'Text', icon: Type },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-[#80664C] dark:text-amber-300 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Content Panels */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* TAB 1: LAYOUT SELECTOR */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100">
                    Choose Collage Layout
                  </h3>
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
                    7 distinct layout designs engineered for Day 1 to Day 30 milestones.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {(Object.keys(COLLAGE_LAYOUTS) as CollageLayoutType[]).map((layoutKey) => {
                    const l = COLLAGE_LAYOUTS[layoutKey];
                    const isSelected = config.layout === layoutKey;
                    return (
                      <div
                        key={layoutKey}
                        onClick={() => updateConfig({ layout: layoutKey })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#9E8265] dark:border-amber-400 bg-[#FAF7F2] dark:bg-zinc-800/80 shadow-sm ring-1 ring-[#9E8265]'
                            : 'border-[#E5DACD] dark:border-zinc-800 hover:border-[#C4B39F] bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-sm text-[#2C2723] dark:text-zinc-100">
                            {l.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-[#9E8265] dark:text-amber-400" />}
                        </div>
                        <p className="text-[11px] font-medium text-[#80664C] dark:text-amber-300/80 mt-0.5">
                          {l.tagline}
                        </p>
                        <p className="text-xs text-[#73675C] dark:text-zinc-400 mt-1 leading-relaxed">
                          {l.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Hero Day Selector if layout uses hero */}
                {(config.layout === 'hero-timeline' || config.layout === 'magazine' || config.layout === 'milestone-poster') && (
                  <div className="pt-4 border-t border-[#EAE3D9] dark:border-zinc-800 space-y-2">
                    <label className="block text-xs font-semibold text-[#42372E] dark:text-zinc-200">
                      Select Featured Hero Photo:
                    </label>
                    <select
                      value={config.heroDay}
                      onChange={(e) => updateConfig({ heroDay: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-[#2C2723] dark:text-zinc-100"
                    >
                      {Array.from({ length: 30 }, (_, d) => d + 1).map((d) => (
                        <option key={d} value={d}>
                          Day {d} {photos.has(d) ? '(Photo Uploaded)' : '(No photo)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: THEME SELECTOR */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100">
                    Ready-Made Themes
                  </h3>
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
                    10 bespoke color harmonies and typography styles.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = config.themeId === themeKey;
                    return (
                      <div
                        key={themeKey}
                        onClick={() => updateConfig({ themeId: themeKey })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#9E8265] dark:border-amber-400 bg-[#FAF7F2] dark:bg-zinc-800/80 shadow-sm ring-1 ring-[#9E8265]'
                            : 'border-[#E5DACD] dark:border-zinc-800 hover:border-[#C4B39F] bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Color Swatch */}
                          <div
                            className="w-8 h-8 rounded-lg border shadow-sm shrink-0 flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: t.bgColor,
                              borderColor: t.borderColor,
                            }}
                          >
                            <span style={{ color: t.accentColor }}>★</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-sm text-[#2C2723] dark:text-zinc-100">
                                {t.name}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {t.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7A6E64] dark:text-zinc-400 line-clamp-1">
                              {t.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-[#9E8265] dark:text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: DIMENSIONS & ASPECT RATIO */}
            {activeTab === 'dimensions' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100">
                    Canvas Dimensions & Print Size
                  </h3>
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
                    High-resolution aspect ratios optimized for standard framing and print documents.
                  </p>
                </div>

                <div className="space-y-2">
                  {(Object.keys(CANVAS_DIMENSIONS) as CanvasDimensionId[]).map((dimKey) => {
                    const d = CANVAS_DIMENSIONS[dimKey];
                    const isSelected = config.dimensionId === dimKey;
                    return (
                      <div
                        key={dimKey}
                        onClick={() => updateConfig({ dimensionId: dimKey })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#9E8265] dark:border-amber-400 bg-[#FAF7F2] dark:bg-zinc-800/80 shadow-sm ring-1 ring-[#9E8265]'
                            : 'border-[#E5DACD] dark:border-zinc-800 hover:border-[#C4B39F] bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-sm text-[#2C2723] dark:text-zinc-100">
                            {d.label}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-[#9E8265] dark:text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-[#7A6E64] dark:text-zinc-400 mt-0.5">
                          {d.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: BORDERS, SPACING & CORNER RADIUS */}
            {activeTab === 'style' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100">
                    Spacing & Frame Controls
                  </h3>
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
                    Fine-tune photo gaps, borders, and margins.
                  </p>
                </div>

                {/* Spacing Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-[#42372E] dark:text-zinc-200">
                    <span>Spacing Between Photos</span>
                    <span>{config.spacing} px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="36"
                    step="2"
                    value={config.spacing}
                    onChange={(e) => updateConfig({ spacing: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#80664C]"
                  />
                </div>

                {/* Outer Padding Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-[#42372E] dark:text-zinc-200">
                    <span>Outer Canvas Margin</span>
                    <span>{config.outerPadding} px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="4"
                    value={config.outerPadding}
                    onChange={(e) => updateConfig({ outerPadding: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#80664C]"
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-[#42372E] dark:text-zinc-200">
                    <span>Photo Corner Radius</span>
                    <span>{config.borderRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={config.borderRadius}
                    onChange={(e) => updateConfig({ borderRadius: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#80664C]"
                  />
                </div>

                {/* Border Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold text-[#42372E] dark:text-zinc-200">
                    <span>Photo Border Width</span>
                    <span>{config.borderWidth} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={config.borderWidth}
                    onChange={(e) => updateConfig({ borderWidth: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#80664C]"
                  />
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-[#EAE3D9] dark:border-zinc-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-[#42372E] dark:text-zinc-200">
                      Soft Drop Shadow
                    </span>
                    <input
                      type="checkbox"
                      checked={config.shadowEnabled}
                      onChange={(e) => updateConfig({ shadowEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#80664C] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-[#42372E] dark:text-zinc-200">
                      Show Day Badges (1-30)
                    </span>
                    <input
                      type="checkbox"
                      checked={config.showDayNumbers}
                      onChange={(e) => updateConfig({ showDayNumbers: e.target.checked })}
                      className="w-4 h-4 accent-[#80664C] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-[#42372E] dark:text-zinc-200">
                      Show Decorative Corner Art
                    </span>
                    <input
                      type="checkbox"
                      checked={config.showDecorations}
                      onChange={(e) => updateConfig({ showDecorations: e.target.checked })}
                      className="w-4 h-4 accent-[#80664C] rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: TYPOGRAPHY & TEXT LABELS */}
            {activeTab === 'text' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100">
                    Titles & Milestone Typography
                  </h3>
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
                    Personalize titles, subtitles, and baby milestone stats.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#42372E] dark:text-zinc-200 mb-1">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#42372E] dark:text-zinc-200 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => updateConfig({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#42372E] dark:text-zinc-200 mb-1">
                    Footer Milestone Dedication
                  </label>
                  <input
                    type="text"
                    value={config.milestoneText}
                    onChange={(e) => updateConfig({ milestoneText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100"
                  />
                </div>

                <div className="pt-2 border-t border-[#EAE3D9] dark:border-zinc-800 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-[#42372E] dark:text-zinc-200">
                      Include Baby Profile Info in Header
                    </span>
                    <input
                      type="checkbox"
                      checked={config.showBabyInfo}
                      onChange={(e) => updateConfig({ showBabyInfo: e.target.checked })}
                      className="w-4 h-4 accent-[#80664C] rounded"
                    />
                  </label>

                  <div>
                    <label className="block font-semibold text-[#42372E] dark:text-zinc-200 mb-1">
                      Day Badge Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Day X', '#X', 'X'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => updateConfig({ dayNumberFormat: fmt })}
                          className={`py-1.5 rounded-lg border text-xs font-semibold ${
                            config.dayNumberFormat === fmt
                              ? 'bg-[#80664C] text-white border-[#80664C]'
                              : 'border-[#D6CABF] dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
