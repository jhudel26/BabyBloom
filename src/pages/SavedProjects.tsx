import React, { useState } from 'react';
import {
  FolderKanban,
  Sparkles,
  Copy,
  Trash2,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import { COLLAGE_LAYOUTS } from '../constants/layouts';
import { THEMES } from '../constants/themes';
import type { NavTab } from '../components/layout/Navbar';

interface SavedProjectsProps {
  onNavigate: (tab: NavTab) => void;
}

export const SavedProjects: React.FC<SavedProjectsProps> = ({ onNavigate }) => {
  const {
    projects,
    loadProject,
    duplicateProject,
    deleteProject,
    createNewProject,
    activeProjectId,
  } = useCollage();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpen = async (id: string) => {
    await loadProject(id);
    onNavigate('studio');
  };

  const handleExport = async (id: string) => {
    await loadProject(id);
    onNavigate('export');
  };

  const handleCreateNew = () => {
    createNewProject();
    onNavigate('studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight">
            Saved Collage Projects
          </h1>
          <p className="text-sm text-[#73675C] dark:text-zinc-400 mt-1">
            Access, duplicate, and export all your custom collage compositions. Stored safely in your local browser.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-sm font-medium shadow-sm transition-all hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Collage Project</span>
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const layoutMeta = COLLAGE_LAYOUTS[project.config.layout] || COLLAGE_LAYOUTS['grid-30'];
            const theme = THEMES[project.config.themeId] || THEMES['timeless-cream'];
            const isCurrentlyActive = activeProjectId === project.id;

            return (
              <div
                key={project.id}
                className={`rounded-3xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-[#9E8265] ring-1 ring-[#9E8265]'
                    : 'border-[#E5DACD] dark:border-zinc-800'
                }`}
              >
                {/* Visual Top Preview Strip */}
                <div
                  className="h-28 p-4 flex flex-col justify-between relative overflow-hidden"
                  style={{ backgroundColor: theme.bgColor }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                      style={{
                        backgroundColor: theme.badgeBg,
                        color: theme.badgeTextColor,
                      }}
                    >
                      {layoutMeta.name}
                    </span>

                    {isCurrentlyActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active in Studio
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-serif font-bold text-lg line-clamp-1 z-10"
                    style={{ color: theme.textColor }}
                  >
                    {project.title}
                  </h3>
                </div>

                {/* Project Metadata */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-xs text-[#7A6E64] dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>Theme:</span>
                      <span className="font-semibold text-[#2C2723] dark:text-zinc-200">
                        {theme.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dimension:</span>
                      <span className="font-semibold text-[#2C2723] dark:text-zinc-200">
                        {project.config.dimensionId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Modified:</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#EAE3D9] dark:border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateProject(project.id)}
                        title="Duplicate project"
                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(project.id)}
                        title="Delete project"
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExport(project.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#D6CABF] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleOpen(project.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <span>Edit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-[#DFD3C4] dark:border-zinc-800 space-y-4 max-w-lg mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#F3EDE4] dark:bg-zinc-800 flex items-center justify-center text-[#8C7A6A] dark:text-zinc-400 mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-[#2C2723] dark:text-zinc-100">
              No Saved Projects
            </h3>
            <p className="text-xs text-[#7A6E64] dark:text-zinc-400 leading-relaxed">
              When you design collages in the Studio and click "Save", they will appear here so you can revisit, duplicate, or re-export them anytime.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Launch Collage Studio</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal for Project Deletion */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-[#EAE3D9] dark:border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2C2723] dark:text-zinc-100">
              Delete Collage Project?
            </h3>
            <p className="text-xs text-[#7A6E64] dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete this collage project? Your uploaded photos will remain safe in your library.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteProject(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
