import React from 'react';
import {
  LayoutDashboard,
  Images,
  Palette,
  LayoutTemplate,
  FolderKanban,
  Download,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useCollage } from '../../context/CollageContext';

export type NavTab = 'dashboard' | 'library' | 'studio' | 'templates' | 'projects' | 'export' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { photos, projects, darkMode, toggleDarkMode, profile } = useCollage();
  const completedDays = photos.size;

  // Primary 5 tabs in the center pill
  const primaryTabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'library' as NavTab,
      label: 'Photos',
      icon: Images,
      badge: `${completedDays}/30`,
      badgeColor: completedDays === 30 ? 'bg-emerald-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
    },
    { id: 'studio' as NavTab, label: 'Studio', icon: Palette, highlight: true },
    { id: 'templates' as NavTab, label: 'Templates', icon: LayoutTemplate },
    {
      id: 'projects' as NavTab,
      label: 'Projects',
      icon: FolderKanban,
      badge: projects.length > 0 ? `${projects.length}` : undefined,
    },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-200 backdrop-blur-xl ${
      darkMode
        ? 'bg-[#141416]/90 border-zinc-800 text-zinc-100 shadow-sm'
        : 'bg-[#FAF7F2]/90 border-[#EAE3D9] text-[#2C2723] shadow-[0_1px_3px_rgba(44,39,35,0.03)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LEFT: Refined Brand Mark */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8DEC8] to-[#C9B9A6] dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center shadow-xs text-lg group-hover:scale-105 transition-all duration-200 border border-[#D8C7B5] dark:border-zinc-700">
              <span role="img" aria-label="sprout">🌱</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2723] dark:text-zinc-50 group-hover:text-[#80664C] dark:group-hover:text-amber-300 transition-colors">
                  BabyBloom
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                  <span className={`w-1.5 h-1.5 rounded-full ${completedDays === 30 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  {completedDays}/30 Days
                </span>
              </div>
              <p className="text-[11px] text-[#7A6F65] dark:text-zinc-400 font-sans hidden lg:block -mt-0.5">
                {profile.name ? `${profile.name}’s Keepsake` : "30 Days of My Baby"}
              </p>
            </div>
          </div>

          {/* CENTER: Spacious Floating Capsule Segmented Navigation */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#EFE8DE]/70 dark:bg-zinc-800/60 border border-[#E2D8CC] dark:border-zinc-700/60 shadow-xs">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? darkMode
                        ? 'bg-zinc-900 text-amber-300 shadow-sm'
                        : 'bg-white text-[#2C2723] shadow-xs'
                      : darkMode
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      : 'text-[#6E6359] hover:text-[#2C2723] hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#80664C] dark:text-amber-400' : 'opacity-70'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor || 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Utility & Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Settings button */}
            <button
              onClick={() => onTabChange('settings')}
              title="Settings & Privacy"
              className={`p-2 rounded-xl border transition-colors ${
                currentTab === 'settings'
                  ? 'border-[#9E8265] bg-[#EFE8DE] text-[#2C2723] dark:bg-zinc-800 dark:text-zinc-100'
                  : 'border-transparent hover:border-[#DED5C7] dark:hover:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 rounded-xl border border-transparent hover:border-[#DED5C7] dark:hover:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            {currentTab === 'studio' ? (
              <button
                onClick={() => onTabChange('export')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#537557] hover:bg-[#436247] text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Keepsake</span>
              </button>
            ) : (
              <button
                onClick={() => onTabChange('studio')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM / INLINE STREAMLINED NAVIGATION */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#EAE3D9] dark:border-zinc-800/80">
          {[
            { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'library' as NavTab, label: 'Photos', icon: Images, badge: `${completedDays}` },
            { id: 'studio' as NavTab, label: 'Studio', icon: Palette, highlight: true },
            { id: 'templates' as NavTab, label: 'Templates', icon: LayoutTemplate },
            { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-[#80664C] dark:text-amber-400 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4 mb-0.5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 text-[9px] bg-emerald-600 text-white px-1 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
