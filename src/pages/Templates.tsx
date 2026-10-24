import React, { useState } from 'react';
import { Sparkles, ArrowRight, Palette } from 'lucide-react';
import { useCollage } from '../context/CollageContext';
import { COLLAGE_LAYOUTS } from '../constants/layouts';
import { THEMES } from '../constants/themes';
import type { CollageLayoutType, ThemeId } from '../types';
import type { NavTab } from '../components/layout/Navbar';

interface TemplatesProps {
  onNavigate: (tab: NavTab) => void;
}

interface TemplatePreset {
  id: string;
  name: string;
  layout: CollageLayoutType;
  theme: ThemeId;
  tagline: string;
  category: 'Classic' | 'Modern' | 'Pastel' | 'Warm' | 'Luxury';
  description: string;
  bestFor: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'preset-timeless-grid',
    name: 'The Timeless Nursery Grid',
    layout: 'grid-30',
    theme: 'timeless-cream',
    tagline: 'Warm Ivory & Balanced Geometry',
    category: 'Classic',
    description: 'A classic 30-day gallery with soft ivory matting and elegant serif numerals. Perfect for traditional nursery framing.',
    bestFor: 'Framed prints & keepsake memory boxes',
  },
  {
    id: 'preset-hero-blue',
    name: 'Little Prince Spotlight',
    layout: 'hero-timeline',
    theme: 'soft-blue',
    tagline: 'Powder Blue Hero + Growth Timeline',
    category: 'Pastel',
    description: 'Spotlights your absolute favorite portrait accompanied by a chronological 29-day growth journey in soft powder blue.',
    bestFor: 'Nursery wall accent & milestone comparison',
  },
  {
    id: 'preset-sage-garden',
    name: 'Sage Botanical Milestone',
    layout: 'milestone-poster',
    theme: 'sage-garden',
    tagline: 'Earthy Greenery & Birth Statistics',
    category: 'Modern',
    description: "An heirloom milestone poster featuring baby's birth details, hero photo, and thirty mini-moments framed in calming sage green.",
    bestFor: 'First-month milestone celebration & announcements',
  },
  {
    id: 'preset-teddy-bear',
    name: 'Teddy Bear Hearth',
    layout: 'heart',
    theme: 'teddy-bear',
    tagline: 'Cozy Cashmere Honey Heart Mosaic',
    category: 'Warm',
    description: 'All 30 daily photos arranged in a sweet heart silhouette with cozy honey-beige borders and warm typography.',
    bestFor: 'Grandparent gifts & nursery focal point',
  },
  {
    id: 'preset-minimalist-gallery',
    name: 'Architectural Fine Art Wall',
    layout: 'minimalist-wall',
    theme: 'minimalist-studio',
    tagline: 'Pure Whitespace & Hairline Frames',
    category: 'Modern',
    description: 'Pristine gallery exhibition spacing with hairline borders and uncluttered negative space for modern interior lovers.',
    bestFor: 'Contemporary living spaces & Scandinavian decor',
  },
  {
    id: 'preset-pastel-dream',
    name: 'Blush & Petal Calendar',
    layout: 'calendar',
    theme: 'pastel-dream',
    tagline: 'Month Calendar in Rosy Nuances',
    category: 'Pastel',
    description: 'Every day of the month organized into a clean calendar spread with subtle blush pink backgrounds and delicate starlight accents.',
    bestFor: 'Memory book inclusion & scrapbook pages',
  },
  {
    id: 'preset-luxury-editorial',
    name: 'Vogue Baby Coffee-Table Spread',
    layout: 'magazine',
    theme: 'luxury-editorial',
    tagline: 'Dynamic Editorial Multi-Span Spread',
    category: 'Luxury',
    description: 'High-end coffee table book composition with prominent cover hero, mid-month feature spreads, and champagne accents.',
    bestFor: 'Luxury hardcover albums & art collectors',
  },
  {
    id: 'preset-celestial-night',
    name: 'Midnight Starlight Keepsake',
    layout: 'milestone-poster',
    theme: 'celestial-night',
    tagline: 'Deep Navy & Gilded Starlight',
    category: 'Luxury',
    description: 'Dramatic midnight navy backdrop with starlight gold accents and deep contrast for enchanting nursery dreamers.',
    bestFor: 'Gold-framed wall art & magical nursery displays',
  },
];

export const Templates: React.FC<TemplatesProps> = ({ onNavigate }) => {
  const { updateConfig } = useCollage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Classic', 'Modern', 'Pastel', 'Warm', 'Luxury'];

  const filtered = selectedCategory === 'All'
    ? TEMPLATE_PRESETS
    : TEMPLATE_PRESETS.filter((p) => p.category === selectedCategory);

  const handleApplyPreset = (preset: TemplatePreset) => {
    updateConfig({
      layout: preset.layout,
      themeId: preset.theme,
      name: preset.name,
    });
    onNavigate('studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2C2723] dark:text-zinc-50 tracking-tight">
            Curated Templates &amp; Layouts
          </h1>
          <p className="text-sm text-[#73675C] dark:text-zinc-400 mt-1">
            Handcrafted combinations of our 7 distinct milestone layouts and 10 ready-made themes. Ready to customize in one click.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#80664C] text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-[#EFE8DE] dark:hover:bg-zinc-700 border border-[#EAE3D9] dark:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((preset) => {
          const theme = THEMES[preset.theme];
          const layoutMeta = COLLAGE_LAYOUTS[preset.layout];

          return (
            <div
              key={preset.id}
              className="group rounded-3xl border border-[#E5DACD] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C9B9A6] dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Preview Banner */}
              <div
                className="h-44 p-6 flex flex-col justify-between relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: theme.bgColor,
                  backgroundImage: theme.bgSecondaryColor
                    ? `linear-gradient(to bottom, ${theme.bgColor}, ${theme.bgSecondaryColor})`
                    : undefined,
                }}
              >
                {/* Theme Palette Dots */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeTextColor,
                    }}
                  >
                    {preset.category} • {layoutMeta.name}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-semibold text-zinc-700 dark:text-zinc-200">
                    <Palette className="w-3 h-3" />
                    <span>{theme.name}</span>
                  </div>
                </div>

                {/* Decorative Visual Silhouette Simulation */}
                <div className="z-10 text-center space-y-1">
                  <h3
                    className="font-serif font-bold text-xl line-clamp-1"
                    style={{ color: theme.textColor }}
                  >
                    {preset.name}
                  </h3>
                  <p
                    className="text-xs italic line-clamp-1"
                    style={{ color: theme.subtitleColor }}
                  >
                    {preset.tagline}
                  </p>
                </div>

                {/* Subtle bottom line */}
                <div
                  className="h-1 w-20 mx-auto rounded-full z-10"
                  style={{ backgroundColor: theme.accentColor }}
                />
              </div>

              {/* Body Details */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-[#6E6359] dark:text-zinc-400 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-zinc-800/50 border border-[#EFE8DD] dark:border-zinc-800 text-[11px] text-[#7A6E64] dark:text-zinc-400">
                    <span className="font-semibold text-[#3D332B] dark:text-zinc-200 block mb-0.5">
                      Ideal for:
                    </span>
                    {preset.bestFor}
                  </div>
                </div>

                {/* CTA Action */}
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#80664C] hover:bg-[#6D553E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
