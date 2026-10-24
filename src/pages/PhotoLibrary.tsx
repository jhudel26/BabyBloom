import React, { useState, useRef } from 'react';
import {
  Upload,
  Trash2,
  Crop,
  Info,
  X,
  ZoomIn,
  Move,
  Play,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import type { BulkUploadItem } from '../context/CollageContext';
import type { DayPhoto, PhotoCrop } from '../types';
import { validateImageFile, extractDateFromFile } from '../utils/imageUtils';

export const PhotoLibrary: React.FC = () => {
  const {
    photos,
    allPhotos,
    uploadSinglePhoto,
    uploadBulkPhotos,
    deletePhoto,
    updateCrop,
    loadSamplePhotos,
  } = useCollage();

  const [editingCropPhoto, setEditingCropPhoto] = useState<DayPhoto | null>(null);
  const [cropState, setCropState] = useState<PhotoCrop>({ x: 0.5, y: 0.5, scale: 1, rotation: 0 });

  // Bulk Upload Review Modal State
  const [bulkReviewItems, setBulkReviewItems] = useState<BulkUploadItem[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadDay, setTargetUploadDay] = useState<number>(1);

  // Group photos by day
  const photosByDay = new Map<number, DayPhoto[]>();
  for (let i = 1; i <= 30; i++) {
    photosByDay.set(i, []);
  }
  for (const p of allPhotos) {
    const list = photosByDay.get(p.dayNumber) || [];
    list.push(p);
    photosByDay.set(p.dayNumber, list);
  }

  // Handle Bulk File Selection & Chronological Suggestion
  const handleBulkFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBulkError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setBulkError(validation.error || 'Invalid file detected.');
        return;
      }
      validFiles.push(file);
    }

    // Sort files chronologically by date taken / last modified
    validFiles.sort((a, b) => a.lastModified - b.lastModified);

    // Find available slots or suggest sequential days starting from first available or Day 1
    const reviewItems: BulkUploadItem[] = validFiles.map((file, idx) => {
      const dateTaken = extractDateFromFile(file);
      const suggestedDay = Math.min(30, idx + 1);
      return {
        file,
        suggestedDay,
        dateTaken,
      };
    });

    setBulkReviewItems(reviewItems);
    setIsBulkModalOpen(true);
  };

  // Confirm Bulk Upload
  const handleConfirmBulkUpload = async () => {
    await uploadBulkPhotos(bulkReviewItems);
    setIsBulkModalOpen(false);
    setBulkReviewItems([]);
  };

  // Open Single Day Upload
  const handleTriggerSingleUpload = (day: number) => {
    setTargetUploadDay(day);
    singleFileInputRef.current?.click();
  };

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    await uploadSinglePhoto(targetUploadDay, file);
    e.target.value = '';
  };

  // Drag and drop handler for the whole page
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBulkFilesSelected(e.dataTransfer.files);
    }
  };

  // Open Crop Editor Modal
  const openCropModal = (photo: DayPhoto) => {
    setEditingCropPhoto(photo);
    setCropState(photo.crop || { x: 0.5, y: 0.5, scale: 1, rotation: 0 });
  };

  const saveCrop = async () => {
    if (editingCropPhoto) {
      await updateCrop(editingCropPhoto.dayNumber, cropState);
      setEditingCropPhoto(null);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn"
    >
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleBulkFilesSelected(e.target.files)}
        className="hidden"
      />
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSingleFileChange}
        className="hidden"
      />

      {/* Header & Bulk Upload Zone */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight">
            Photo Library
          </h1>
          <p className="text-sm text-[#73675C] dark:text-zinc-400 mt-1">
            Assign your baby’s photos to Day 1 through Day 30. You can upload multiple shots per day and select your favorite as primary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {photos.size === 0 && (
            <button
              onClick={loadSamplePhotos}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4 text-amber-600" />
              <span>Load 30 Sample Photos</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Preservation Rule Reminder Pill */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
        <span>
          <strong>Authentic Keepsake Notice:</strong> All uploaded photos are stored non-destructively in your browser's IndexedDB. Cropping and repositioning adjust only display coordinates, preserving your original high-resolution baby photos completely untouched.
        </span>
      </div>

      {/* 30 Day Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const dayPhotos = photosByDay.get(day) || [];
          const primaryPhoto = dayPhotos.find((p) => p.isPrimary) || dayPhotos[0];
          const hasMultiple = dayPhotos.length > 1;

          return (
            <div
              key={day}
              className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-900 ${
                primaryPhoto
                  ? 'border-[#E2D8CE] dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-[#BFAF9F]'
                  : 'border-dashed border-[#DACFC2] dark:border-zinc-700 hover:border-amber-500 bg-[#FAF7F2]/60 dark:bg-zinc-800/20'
              }`}
            >
              {/* Day Header Badge */}
              <div className="p-3 flex items-center justify-between z-10">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  primaryPhoto
                    ? 'bg-[#EAE3D9] text-[#42372E] dark:bg-zinc-800 dark:text-zinc-200'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  Day {day}
                </span>

                {hasMultiple && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200" title={`${dayPhotos.length} photos uploaded for Day ${day}`}>
                    +{dayPhotos.length - 1} alt
                  </span>
                )}
              </div>

              {/* Thumbnail or Empty State */}
              <div className="px-3 pb-2 flex-1 flex flex-col justify-center items-center min-h-[140px]">
                {primaryPhoto ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 group/img">
                    <img
                      src={primaryPhoto.dataUrl}
                      alt={`Day ${day}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    />

                    {/* Quick action overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openCropModal(primaryPhoto)}
                        title="Adjust Focal Crop & Scale"
                        className="p-1.5 rounded-lg bg-white/90 text-zinc-800 hover:bg-white shadow transition-transform hover:scale-110"
                      >
                        <Crop className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePhoto(primaryPhoto.id)}
                        title="Delete this photo"
                        className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white shadow transition-transform hover:scale-110"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleTriggerSingleUpload(day)}
                    className="w-full h-full flex flex-col items-center justify-center py-6 cursor-pointer text-center group-hover:scale-105 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F3EDE4] dark:bg-zinc-800 flex items-center justify-center text-[#8C7A6A] dark:text-zinc-400 group-hover:bg-[#E7DCCE] transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#7D7063] dark:text-zinc-400 mt-2">
                      Add Day {day}
                    </span>
                  </div>
                )}
              </div>

              {/* Slot Footer Details */}
              <div className="px-3 py-2 bg-[#FAF7F2] dark:bg-zinc-800/50 border-t border-[#F0EAE1] dark:border-zinc-800 flex items-center justify-between text-[11px] text-[#7A6E64] dark:text-zinc-400">
                <span className="truncate max-w-[80px]" title={primaryPhoto?.dateTaken || 'No date set'}>
                  {primaryPhoto?.dateTaken || 'Unset date'}
                </span>

                <button
                  onClick={() => handleTriggerSingleUpload(day)}
                  className="font-medium text-[#80664C] dark:text-amber-400 hover:underline"
                >
                  {primaryPhoto ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Upload Review & Day Assignment Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#EAE3D9] dark:border-zinc-800 max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE3D9] dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#2C2723] dark:text-zinc-50">
                  Review & Assign {bulkReviewItems.length} Photos
                </h3>
                <p className="text-xs text-[#7A6E64] dark:text-zinc-400 mt-0.5">
                  We sorted your photographs chronologically. You can adjust the assigned day number for each photo before confirming.
                </p>
                {bulkError && <p className="text-xs text-rose-600 font-semibold mt-1">{bulkError}</p>}
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Items List */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bulkReviewItems.map((item, idx) => {
                const objectUrl = URL.createObjectURL(item.file);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-[#E2D8CE] dark:border-zinc-800 bg-[#FAF7F2]/60 dark:bg-zinc-800/40 flex items-center gap-3"
                  >
                    <img
                      src={objectUrl}
                      alt={item.file.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-semibold text-[#2C2723] dark:text-zinc-200 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-[#7A6E64] dark:text-zinc-400">
                        Date: {item.dateTaken}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[11px] font-semibold text-[#42372E] dark:text-zinc-300">
                          Day:
                        </label>
                        <select
                          value={item.suggestedDay}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            const updated = [...bulkReviewItems];
                            updated[idx].suggestedDay = val;
                            setBulkReviewItems(updated);
                          }}
                          className="px-2 py-1 text-xs rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100"
                        >
                          {Array.from({ length: 30 }, (_, d) => d + 1).map((d) => (
                            <option key={d} value={d}>
                              Day {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#EAE3D9] dark:border-zinc-800 flex items-center justify-between bg-[#FAF7F2] dark:bg-zinc-900">
              <span className="text-xs text-[#7A6E64] dark:text-zinc-400">
                {bulkReviewItems.length} photos ready to import into local IndexedDB
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkUpload}
                  className="px-5 py-2.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Confirm & Import Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-Destructive Crop & Focal Position Modal */}
      {editingCropPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#EAE3D9] dark:border-zinc-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-[#80664C] dark:text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
                  Focal Position & Zoom (Day {editingCropPhoto.dayNumber})
                </h3>
              </div>
              <button
                onClick={() => setEditingCropPhoto(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <img
                src={editingCropPhoto.dataUrl}
                alt="Crop preview"
                className="w-full h-full object-cover transition-all"
                style={{
                  objectPosition: `${cropState.x * 100}% ${cropState.y * 100}%`,
                  transform: `scale(${cropState.scale})`,
                }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none rounded-2xl" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                Zoom: {cropState.scale.toFixed(1)}x • Focal: {Math.round(cropState.x * 100)}%, {Math.round(cropState.y * 100)}%
              </div>
            </div>

            {/* Sliders for Non-Destructive Adjustments */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" /> Zoom Scale
                  </span>
                  <span>{cropState.scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={cropState.scale}
                  onChange={(e) => setCropState({ ...cropState, scale: parseFloat(e.target.value) })}
                  className="w-full accent-[#80664C]"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" /> Horizontal Focal Point (X)
                  </span>
                  <span>{Math.round(cropState.x * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={cropState.x}
                  onChange={(e) => setCropState({ ...cropState, x: parseFloat(e.target.value) })}
                  className="w-full accent-[#80664C]"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" /> Vertical Focal Point (Y)
                  </span>
                  <span>{Math.round(cropState.y * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={cropState.y}
                  onChange={(e) => setCropState({ ...cropState, y: parseFloat(e.target.value) })}
                  className="w-full accent-[#80664C]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D9] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropState({ ...cropState, y: 0.18 })}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors"
                >
                  Focus Face (Top)
                </button>
                <button
                  type="button"
                  onClick={() => setCropState({ x: 0.5, y: 0.5, scale: 1, rotation: 0 })}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium"
                >
                  Center
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCropPhoto(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCrop}
                  className="px-5 py-2 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
