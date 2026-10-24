# BabyBloom — 30 Days of My Baby 👶🌱
### Milestone Photo Album Designer & Studio

**BabyBloom** is a premium, client-side web application designed to transform parents' real daily photographs from **Day 1 through Day 30** into a professional, studio-grade keepsake memory collage ready to print, frame, and cherish forever.

---

## 🔒 Critical Photo Preservation & Privacy Guarantee

- **Authentic Identity Preservation:** Your actual uploaded photographs are used without altering your baby's identity, facial features, skin tone, body proportions, expressions, or clothing.
- **Zero Generative Replacement:** No AI is used to regenerate, redraw, age, de-age, or replace the baby. Missing days display elegant themed placeholders rather than hallucinated baby imagery.
- **Non-Destructive Cropping:** All panning, zooming, and positioning adjustments apply only to rendering coordinates. The original high-resolution photo file is preserved untouched.
- **100% Client-Side Private Storage:** All photographs, baby milestones, and project configurations are stored exclusively in your browser's local **IndexedDB** using Dexie.js. Zero images or personal data are ever transmitted to external servers or AI services.
- **Offline Capable:** Works offline with full data export/import capabilities.

---

## ✨ Features & Capabilities

### 1. 📊 Interactive Milestone Dashboard
- **Welcome Milestone Card:** Baby's name, birth date, birth weight, birth length, and personal notes.
- **30-Day Completion Ring & Timeline:** Visual status of completed days out of 30, with instant one-click jump to missing day slots.
- **Recent Projects:** Instant resumption of saved collage compositions with timestamps and layout tags.
- **1-Click Demo Showcase:** Option to populate 30 sample milestone photos to test every layout and theme instantly.

### 2. 📷 Day 1–Day 30 Photo Library
- **30 Labeled Daily Slots:** Individual upload buttons, thumbnails, and date metadata tags for each day.
- **Bulk Upload & Auto-Assignment:** Drag and drop dozens of images; dates are extracted and organized chronologically with a review modal for manual day reassignment.
- **Multiple Photos Per Day:** Upload alternative shots for any day and choose which is the primary photo for the collage.
- **Non-Destructive Focal Crop Modal:** Interactive zoom slider (1.0x to 2.5x) and 2D focal point positioning (X, Y) preserving original aspect ratios.

### 3. 🎨 Live Collage Studio Editor
- **Real-Time Canvas Rendering:** High-performance HTML5 canvas engine rendering layouts in real-time.
- **Interactive Viewport:** Zoom In, Zoom Out, Fit to Screen, and responsive canvas scaling.
- **Undo / Redo Stack:** Complete history tracking for effortless design experimentation.
- **Print Safe Margins Overlay:** Toggle 0.25" safe bleed guides to guarantee text and faces are never clipped during physical framing.
- **Missing Photo Warnings:** Clear non-intrusive warnings alerting parents if any of the 30 days are missing.
- **Project Saving & Duplication:** Save work in progress under custom titles or duplicate to compare alternate styles.

### 4. 📐 7 Genuinely Distinct Collage Layouts
Each layout is mathematically computed with unique geometry, proportions, and typographic balance:
1. **30-Day Grid:** All 30 days presented in a balanced geometric grid with equal prominence, custom day numbering, and elegant framing. Ideal for nursery framing.
2. **Hero + Timeline:** Features one prominent hero photo surrounded by a chronological timeline showing the baby's transformation over the month.
3. **Magazine Editorial:** A multi-span editorial spread with cover-story hero, mid-month feature spreads, and curated daily snapshot strips.
4. **Heart Collage:** A symmetric 30-slot mosaic forming an aesthetic heart contour while preserving clear rectangular photo cards.
5. **Calendar Month:** Organized like a luxury photo calendar with weekday markers, crisp day numerals, and optional real calendar dates.
6. **Milestone Poster:** Grand keepsake poster with calligraphy name, birth statistics (weight, length, date, time), hero portrait, and 30 milestone tiles.
7. **Minimalist Photo Wall:** Museum gallery exhibition with generous matting, hairline borders, and floating tiles.

### 5. 🎨 10 Ready-Made Themes
Bespoke color harmonies, patterns, borders, and typography:
1. **Timeless Cream:** Warm ivory hues, linen background, delicate warm gray borders, Cormorant Garamond typography.
2. **Soft Blue:** Powder blue tones, whisper-soft baby blue cards, starlight accents, silver borders.
3. **Sage Garden:** Earthy calming sage greens, botanical warmth, Playfair Display headings.
4. **Teddy Bear Neutral:** Cozy cashmere honey tones, warm nursery shades, cuddly aesthetic.
5. **Minimalist Studio:** Ultra-clean white matting, hairline borders, pure architectural balance.
6. **Pastel Dream:** Soft blush pink, pale peach, gentle morning lavender nuances.
7. **Elegant White:** Crisp fine-art paper, pure embossing lines, timeless gallery presentation.
8. **Warm Vintage:** Sepia paper tones, heirloom album aesthetic, vintage grain background.
9. **Celestial Night:** Deep midnight navy with starlight gold accents for a magical nursery dream.
10. **Luxury Editorial:** Champagne gold, dark charcoal, and high-end coffee table book aesthetics.

### 6. 🖨️ High-Resolution Export & Printing
- **Format Options:**
  - **PNG (Lossless):** Maximum crystal clarity, uncompressed pixels for archival and professional photo printing.
  - **JPEG (High-Quality):** Optimized size with selectable quality compression slider (80% to 100%).
  - **Print-Ready PDF:** Native multi-page vector-scale document generated with jsPDF at 300 DPI.
- **Standard Dimensions & Aspect Ratios:**
  - 1:1 Square (2400 × 2400 px)
  - 4:5 Portrait (2400 × 3000 px) — Ideal for 8×10" and 16×20" frames
  - 3:4 Portrait (2400 × 3200 px) — Ideal for 9×12" and 18×24" frames
  - 2:3 Poster (2400 × 3600 px) — Ideal for 12×18" and 20×30" prints
  - A4 Document (2480 × 3508 px at 300 DPI)
  - A3 Keepsake (3508 × 4960 px at 300 DPI)
  - Custom user-specified dimensions
- **Celebration:** Joyful confetti burst on download completion.

### 7. ⚙️ Storage & Backup Controls
- **IndexedDB Metrics:** Live readout of total photos stored, completed days, and storage space in Megabytes.
- **Portable JSON Backup:** Download all photos and project configurations into a portable `.json` backup file.
- **Backup Restore:** 1-click restore from JSON backup file.
- **Danger Zone Wipe:** Clear all stored data with modal safety confirmation.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 (with custom `@theme` typography and palettes)
- **Local Database:** Dexie.js (IndexedDB wrapper)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF
- **Celebratory Effects:** Canvas Confetti

---

## 🚀 Installation & Local Development

### 1. Prerequisites
- Node.js (v18 or higher; tested on Node v24.12.0)
- npm (v9 or higher)

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be created in the `dist/` directory.

### 4. Preview the Production Build
```bash
npm run preview
```
Serves the production build locally at `http://localhost:4173`.

---

## 📁 Project Directory Structure

```text
photocollage/
├── dist/                      # Production build output
├── node_modules/              # Dependencies
├── public/                    # Static assets & icons
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx     # Navigation header with badges & dark mode toggle
│   │       └── Footer.tsx     # Footer with privacy & photo preservation notice
│   ├── constants/
│   │   ├── dimensions.ts      # Canvas aspect ratio & print presets (1:1, 4:5, 3:4, A4, A3)
│   │   ├── layouts.ts         # Metadata for the 7 distinct collage layouts
│   │   └── themes.ts          # 10 ready-made color harmonies, fonts & patterns
│   ├── context/
│   │   └── CollageContext.tsx # Central state management, undo/redo & IndexedDB sync
│   ├── db/
│   │   └── index.ts           # Dexie IndexedDB database tables & storage helpers
│   ├── pages/
│   │   ├── Dashboard.tsx      # Welcome overview, baby profile, 30-day timeline & recent projects
│   │   ├── PhotoLibrary.tsx   # 30-day upload slots, bulk sorter & focal crop modal
│   │   ├── CollageStudio.tsx  # Central interactive canvas editor, controls & layout switcher
│   │   ├── Templates.tsx      # Visual template gallery with 1-click apply
│   │   ├── SavedProjects.tsx  # Saved projects manager, duplication & export
│   │   ├── ExportPreview.tsx  # Proof preview, dimension specs & PNG/JPEG/PDF download
│   │   └── Settings.tsx       # Storage metrics, JSON backup/restore & wipe data
│   ├── types/
│   │   └── index.ts           # Full TypeScript data models and interfaces
│   ├── utils/
│   │   ├── canvasRenderer.ts  # HTML5 Canvas renderer for artwork, backgrounds & badges
│   │   ├── exportUtils.ts     # High-resolution rendering, jsPDF export & confetti
│   │   ├── imageUtils.ts      # Image validation, non-destructive cropping & EXIF date helper
│   │   └── layoutEngine.ts    # Mathematical geometry computation for 7 distinct layouts
│   ├── App.tsx                # Main application component & tab router
│   ├── index.css              # Tailwind CSS v4 setup & custom Google typography
│   └── main.tsx               # React application entry point
├── index.html                 # HTML shell with Google Fonts & metadata
├── package.json               # Dependencies & build scripts
├── tsconfig.json              # TypeScript root configuration
├── tsconfig.app.json          # Application compiler settings
└── vite.config.ts             # Vite configuration with Tailwind CSS v4 plugin
```
