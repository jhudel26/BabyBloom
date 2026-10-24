import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import { getStorageStats, db } from '../db';
import { downloadDataUrl } from '../utils/exportUtils';

export const Settings: React.FC = () => {
  const {
    photos,
    projects,
    darkMode,
    toggleDarkMode,
    wipeAll,
    refreshData,
  } = useCollage();

  const [stats, setStats] = useState<{
    photoCount: number;
    completedDays: number;
    totalMB: string;
    projectCount: number;
  }>({
    photoCount: 0,
    completedDays: 0,
    totalMB: '0.00',
    projectCount: 0,
  });

  const [isWiping, setIsWiping] = useState<boolean>(false);
  const [showWipeModal, setShowWipeModal] = useState<boolean>(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    const s = await getStorageStats();
    setStats(s);
  };

  useEffect(() => {
    loadStats();
  }, [photos, projects]);

  // Export complete JSON backup
  const handleExportBackup = async () => {
    try {
      setBackupStatus('Generating JSON backup archive...');
      const allPhotosList = await db.photos.toArray();
      const allProjectsList = await db.projects.toArray();
      const currentProfile = await db.profile.get('current');
      const currentSettings = await db.settings.get('user');

      const backupData = {
        version: 1,
        appName: 'BabyBloom',
        exportedAt: new Date().toISOString(),
        profile: currentProfile,
        photos: allPhotosList,
        projects: allProjectsList,
        settings: currentSettings,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split('T')[0];
      downloadDataUrl(url, `BabyBloom_Backup_${dateStr}.json`);
      URL.revokeObjectURL(url);

      setBackupStatus('Backup exported successfully!');
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      console.error('Backup failed:', err);
      setBackupStatus('Failed to generate backup.');
    }
  };

  // Restore JSON backup
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBackupStatus('Restoring backup data...');
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.appName || data.appName !== 'BabyBloom') {
        alert('Invalid backup file. Must be a BabyBloom JSON backup archive.');
        setBackupStatus(null);
        return;
      }

      // Restore tables
      if (Array.isArray(data.photos)) {
        await db.photos.clear();
        await db.photos.bulkAdd(data.photos);
      }
      if (Array.isArray(data.projects)) {
        await db.projects.clear();
        await db.projects.bulkAdd(data.projects);
      }
      if (data.profile) {
        await db.profile.put({ ...data.profile, id: 'current' });
      }

      await refreshData();
      await loadStats();

      setBackupStatus('Backup restored successfully!');
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      console.error('Failed to restore:', err);
      alert('Error parsing or restoring backup file.');
      setBackupStatus(null);
    } finally {
      e.target.value = '';
    }
  };

  // Wipe All Data
  const handleWipeData = async () => {
    setIsWiping(true);
    await wipeAll();
    await loadStats();
    setIsWiping(false);
    setShowWipeModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Hidden file input for restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleRestoreFile}
        className="hidden"
      />

      {/* Header */}
      <div className="pb-6 border-b border-[#EAE3D9] dark:border-zinc-800">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight">
          Settings & Data Privacy
        </h1>
        <p className="text-sm text-[#73675C] dark:text-zinc-400 mt-1">
          Manage local IndexedDB storage, create portable backups, and configure editor appearance.
        </p>
      </div>

      {backupStatus && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{backupStatus}</span>
        </div>
      )}

      {/* Storage & Privacy Transparency Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
              100% Client-Side Private Storage
            </h3>
            <p className="text-xs text-[#7A6E64] dark:text-zinc-400">
              Your baby’s pictures never leave your device.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#6E6359] dark:text-zinc-400 leading-relaxed">
          BabyBloom does not upload your photographs to any cloud server, third-party database, or external AI model. All photos, baby milestone details, and collage designs are stored locally in your web browser using HTML5 IndexedDB.
        </p>

        {/* Storage Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-zinc-800/60 border border-[#EFE8DD] dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-[#807469] dark:text-zinc-400 block">Total Photos</span>
            <span className="font-serif font-bold text-xl text-[#2C2723] dark:text-zinc-100">
              {stats.photoCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-zinc-800/60 border border-[#EFE8DD] dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-[#807469] dark:text-zinc-400 block">Completed Days</span>
            <span className="font-serif font-bold text-xl text-emerald-700 dark:text-emerald-400">
              {stats.completedDays} / 30
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-zinc-800/60 border border-[#EFE8DD] dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-[#807469] dark:text-zinc-400 block">IndexedDB Usage</span>
            <span className="font-serif font-bold text-xl text-[#2C2723] dark:text-zinc-100">
              {stats.totalMB} MB
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-zinc-800/60 border border-[#EFE8DD] dark:border-zinc-700/60 text-center">
            <span className="text-[11px] text-[#807469] dark:text-zinc-400 block">Saved Projects</span>
            <span className="font-serif font-bold text-xl text-[#2C2723] dark:text-zinc-100">
              {stats.projectCount}
            </span>
          </div>
        </div>
      </div>

      {/* Backup & Restore Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
          Backup & Portability
        </h3>
        <p className="text-xs text-[#7A6E64] dark:text-zinc-400 leading-relaxed">
          Because photos are kept locally in browser storage, clearing your browser cache may erase your project. We recommend downloading a JSON backup file to keep on your hard drive or move to another computer.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Full JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Restore from Backup</span>
          </button>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
          Studio Editor Preferences
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-[#F0EAE1] dark:border-zinc-800 text-xs">
          <div>
            <span className="font-semibold text-[#2C2723] dark:text-zinc-200 block">
              Dark Mode Editor Interface
            </span>
            <span className="text-[#7A6E64] dark:text-zinc-400">
              Low-glare dark chrome for evening editing sessions.
            </span>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-[#D6CABF] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Danger Zone: Wipe Storage */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-serif font-bold text-lg">Danger Zone</h3>
        </div>
        <p className="text-xs text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
          Erase all stored photos, baby profile information, and saved collage projects from this browser. This action cannot be undone.
        </p>

        <button
          onClick={() => setShowWipeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors mt-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Wipe All Local Data</span>
        </button>
      </div>

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#EAE3D9] dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-rose-600 dark:text-rose-400">
              Confirm Data Deletion
            </h3>
            <p className="text-xs text-[#7A6E64] dark:text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete all {stats.photoCount} baby photos and {stats.projectCount} saved projects?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeData}
                disabled={isWiping}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {isWiping ? 'Wiping...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
