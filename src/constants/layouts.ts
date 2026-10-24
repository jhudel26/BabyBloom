import type { CollageLayoutType } from '../types';

export interface LayoutMetadata {
  id: CollageLayoutType;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  iconName: string;
  featuredRatio: string;
}

export const COLLAGE_LAYOUTS: Record<CollageLayoutType, LayoutMetadata> = {
  'grid-30': {
    id: 'grid-30',
    name: '30-Day Grid',
    tagline: 'Uniform, clean & timeless',
    description: 'All 30 days presented in a balanced geometric grid (5×6 or 6×5) with equal prominence, custom day numbering, and elegant framing.',
    bestFor: 'Framed prints, nursery wall art, and complete daily progress reviews.',
    iconName: 'Grid',
    featuredRatio: 'Equal 1:1 or 4:5 cells',
  },
  'hero-timeline': {
    id: 'hero-timeline',
    name: 'Hero + Timeline',
    tagline: 'Spotlight moment with growth chronology',
    description: 'Features one prominent hero photo (e.g. Day 1 or Day 30) surrounded by a chronological timeline showing your baby’s transformation.',
    bestFor: 'Highlighting your favorite portrait while capturing the full 30-day journey.',
    iconName: 'Sparkles',
    featuredRatio: '1 Large Hero + 29 Timeline Photos',
  },
  'magazine': {
    id: 'magazine',
    name: 'Magazine Editorial',
    tagline: 'Editorial publication aesthetics',
    description: 'A sophisticated magazine-spread layout with dynamic hierarchy: hero spread, secondary feature photos, and curated daily snapshot strips.',
    bestFor: 'High-end coffee table keepsake albums and contemporary photo books.',
    iconName: 'BookOpen',
    featuredRatio: 'Dynamic multi-size editorial grid',
  },
  'heart': {
    id: 'heart',
    name: 'Heart Collage',
    tagline: 'Loving silhouette keeping photos clear',
    description: 'A poetic heart-shaped mosaic with carefully positioned slots that maintain photo clarity while crafting a sweet heart contour.',
    bestFor: 'Nursery wall accent, sentimental anniversary gifts, and grandparent gifts.',
    iconName: 'Heart',
    featuredRatio: 'Symmetric heart mosaic (30 slots)',
  },
  'calendar': {
    id: 'calendar',
    name: 'Calendar Month',
    tagline: 'Thirty days of memory calendar',
    description: 'Organized like a classic calendar month with weekday markers, crisp day numerals, and optional real calendar dates.',
    bestFor: 'Remembering the exact calendar month of baby’s arrival and first weeks.',
    iconName: 'Calendar',
    featuredRatio: 'Calendar grid with weekday header',
  },
  'milestone-poster': {
    id: 'milestone-poster',
    name: 'Milestone Poster',
    tagline: 'Baby’s name, birth statistics & 30 memories',
    description: 'A grand keepsake poster featuring baby’s name in calligraphy, birth stats (weight, length, date, time), hero portrait, and 30 milestone tiles.',
    bestFor: 'First-month milestone celebration, nursery centerpiece, and family announcement.',
    iconName: 'Award',
    featuredRatio: 'Keepsake banner + Hero + 30 Day Tiles',
  },
  'minimalist-wall': {
    id: 'minimalist-wall',
    name: 'Minimalist Photo Wall',
    tagline: 'Fine-art gallery exhibition',
    description: 'Museum-style layout with generous matting, delicate hairline borders, floating photo tiles, and subtle museum typography.',
    bestFor: 'Modern Scandinavian interiors and minimalist architectural spaces.',
    iconName: 'LayoutGrid',
    featuredRatio: 'Generous negative space gallery',
  },
};
