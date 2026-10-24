import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Palette,
  Calendar,
  FolderOpen,
  ArrowRight,
  User,
  Heart,
  Plus,
  Play,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import type { NavTab } from '../components/layout/Navbar';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { photos, profile, updateProfile, projects, loadProject, loadSamplePhotos, createNewProject } = useCollage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);

  const completedCount = photos.size;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleStartNewCollage = () => {
    createNewProject();
    onNavigate('studio');
  };

  const handleOpenProject = async (id: string) => {
    await loadProject(id);
    onNavigate('studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#F5ECE0] to-[#EBE0D2] dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-[#E5DACD] dark:border-zinc-800 p-8 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-zinc-800/80 backdrop-blur-sm text-xs font-semibold text-[#80664C] dark:text-amber-300 border border-[#DFD1BF] dark:border-zinc-700">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>First Month Milestone Keepsake</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight leading-tight">
            Our Baby's First 30 Days
          </h1>

          <p className="text-base sm:text-lg text-[#695E55] dark:text-zinc-300 font-sans leading-relaxed">
            Thirty days of little moments, endless love. Transform your daily photos into a timeless, studio-grade keepsake album ready to frame and cherish forever.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartNewCollage}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white font-medium shadow-md hover:shadow-lg transition-all text-sm group"
            >
              <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
              <span>Create My Collage</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('library')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 text-[#42372E] dark:text-zinc-200 border border-[#D8CABE] dark:border-zinc-700 font-medium text-sm transition-all"
            >
              <Camera className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Manage 30-Day Photos</span>
            </button>

            {completedCount === 0 && (
              <button
                onClick={loadSamplePhotos}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 text-sm font-medium transition-all"
                title="Populate 30 sample milestone photos to test all layouts instantly"
              >
                <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Load Sample Photos</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative subtle background circle */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/20 to-orange-200/10 pointer-events-none blur-2xl" />
      </div>

      {/* Grid: Baby Profile + 30-Day Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baby Profile Card */}
        <div className="lg:col-span-1 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#F3EDE4] dark:bg-zinc-800 flex items-center justify-center text-[#80664C] dark:text-amber-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
                  Baby Profile
                </h3>
                <p className="text-xs text-[#807469] dark:text-zinc-400">Milestone Keepsake Details</p>
              </div>
            </div>

            <button
              onClick={() => {
                setProfileForm(profile);
                setIsEditingProfile(!isEditingProfile);
              }}
              className="text-xs font-semibold text-[#80664C] dark:text-amber-400 hover:underline"
            >
              {isEditingProfile ? 'Cancel' : profile.name ? 'Edit' : '+ Add Info'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-zinc-800/50 border border-[#F0EAE1] dark:border-zinc-800 text-center">
                <p className="text-xs uppercase tracking-wider text-[#8A7E73] dark:text-zinc-400 font-medium">
                  Beloved Baby
                </p>
                <h4 className="font-serif text-2xl font-bold text-[#2C2723] dark:text-zinc-100 mt-0.5">
                  {profile.name || 'Our Little Wonder'}
                </h4>
                {profile.birthDate && (
                  <p className="text-xs text-[#7A6E64] dark:text-zinc-400 mt-1 flex items-center justify-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Born on {profile.birthDate}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#F8F5F0] dark:bg-zinc-800/40">
                  <span className="text-[#8A7E73] dark:text-zinc-400 block">Birth Weight</span>
                  <span className="font-semibold text-[#2C2723] dark:text-zinc-200">
                    {profile.birthWeight || 'Not set'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#F8F5F0] dark:bg-zinc-800/40">
                  <span className="text-[#8A7E73] dark:text-zinc-400 block">Birth Length</span>
                  <span className="font-semibold text-[#2C2723] dark:text-zinc-200">
                    {profile.birthLength || 'Not set'}
                  </span>
                </div>
              </div>

              {profile.notes && (
                <p className="text-xs italic text-[#7A6E64] dark:text-zinc-400 p-2 border-l-2 border-[#C9B8A4] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800/30">
                  "{profile.notes}"
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  Baby's Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mia Eleanor Vance"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#9E8265]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#9E8265]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                    Birth Weight
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 lbs 4 oz"
                    value={profileForm.birthWeight}
                    onChange={(e) => setProfileForm({ ...profileForm, birthWeight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#9E8265]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  Birth Length / Height
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20.5 inches"
                  value={profileForm.birthLength}
                  onChange={(e) => setProfileForm({ ...profileForm, birthLength: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#9E8265]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4D4238] dark:text-zinc-300 mb-1">
                  Keepsake Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Welcome to the world, precious angel!"
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6CABF] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#2C2723] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#9E8265]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#80664C] hover:bg-[#6D553E] text-white font-medium transition-colors shadow-sm"
              >
                Save Details
              </button>
            </form>
          )}
        </div>

        {/* 30-Day Completion Status & Timeline Preview */}
        <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
                  30-Day Milestone Progress
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  completedCount === 30
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {completedCount} of 30 Days Uploaded
                </span>
              </div>
              <p className="text-xs text-[#807469] dark:text-zinc-400 mt-1">
                {completedCount === 30
                  ? 'All 30 days are complete! Your photo keepsake is ready for studio customization.'
                  : `${30 - completedCount} days remaining to complete your first month album.`}
              </p>
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80664C] dark:text-amber-400 hover:underline"
            >
              <span>Bulk Upload & Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-[#F3EDE4] dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#C9B9A6] via-[#A88057] to-[#537557] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#8A7E73] dark:text-zinc-400 font-medium">
              <span>Day 1 (Birth)</span>
              <span>Day 15 (Halfway)</span>
              <span>Day 30 (1 Month)</span>
            </div>
          </div>

          {/* 30-Day Mini Timeline Grid */}
          <div>
            <h4 className="text-xs font-semibold text-[#5A4F44] dark:text-zinc-300 mb-2">
              Timeline Snapshot
            </h4>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const photo = photos.get(day);
                return (
                  <div
                    key={day}
                    onClick={() => onNavigate('library')}
                    title={photo ? `Day ${day}: Photo uploaded` : `Day ${day}: Missing photo`}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${
                      photo
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 hover:scale-105'
                        : 'border-dashed border-[#DFD3C4] dark:border-zinc-700 bg-[#FAF7F2] dark:bg-zinc-800/40 hover:border-amber-400'
                    }`}
                  >
                    {photo ? (
                      <div className="w-full h-full rounded-lg overflow-hidden relative">
                        <img
                          src={photo.dataUrl}
                          alt={`Day ${day}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                          {day}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-[#9E9184] dark:text-zinc-500">
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collage Projects */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#EAE3D9] dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F3EDE4] dark:bg-zinc-800 flex items-center justify-center text-[#80664C] dark:text-amber-300">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
                Recent Collage Projects
              </h3>
              <p className="text-xs text-[#807469] dark:text-zinc-400">
                Pick up right where you left off
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-[#80664C] dark:text-amber-400 hover:underline"
          >
            View All ({projects.length})
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project.id)}
                className="group p-4 rounded-xl border border-[#EAE3D9] dark:border-zinc-800 hover:border-[#C4B39F] dark:hover:border-zinc-600 bg-[#FAF7F2]/60 dark:bg-zinc-800/40 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-serif font-bold text-base text-[#2C2723] dark:text-zinc-100 group-hover:text-[#80664C] dark:group-hover:text-amber-300 transition-colors">
                    {project.title}
                  </h4>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {project.config.layout}
                  </span>
                </div>
                <p className="text-xs text-[#82756A] dark:text-zinc-400 mt-1">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[#80664C] dark:text-amber-400 font-medium pt-2 border-t border-[#EAE3D9]/60 dark:border-zinc-700/60">
                  <span>Continue Editing</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl bg-[#FAF7F2] dark:bg-zinc-800/30 border border-dashed border-[#DFD3C4] dark:border-zinc-700 space-y-3">
            <Palette className="w-8 h-8 text-[#A89889] dark:text-zinc-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#3D332B] dark:text-zinc-200">
                No saved projects yet
              </h4>
              <p className="text-xs text-[#7A6E64] dark:text-zinc-400 max-w-sm mx-auto">
                Start your first baby milestone keepsake with our studio editor. Choose between 7 layouts and 10 ready-made themes.
              </p>
            </div>
            <button
              onClick={handleStartNewCollage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Collage</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
