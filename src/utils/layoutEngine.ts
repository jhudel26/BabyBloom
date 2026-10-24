import type { CollageConfig } from '../types';

export interface LayoutSlot {
  dayNumber: number; // 1 to 30
  x: number;
  y: number;
  width: number;
  height: number;
  isHero?: boolean;
  shape?: 'rect' | 'rounded' | 'circle';
  tag?: string;
}

export interface ComputedLayout {
  canvasWidth: number;
  canvasHeight: number;
  slots: LayoutSlot[];
  headerRect?: { x: number; y: number; width: number; height: number };
  footerRect?: { x: number; y: number; width: number; height: number };
  extraDecorations?: Array<{ type: string; x: number; y: number; width: number; height: number }>;
}

export function computeCollageLayout(
  config: CollageConfig,
  canvasWidth: number,
  canvasHeight: number
): ComputedLayout {
  const { layout, spacing, outerPadding, heroDay } = config;
  const padding = Math.max(16, outerPadding);
  const gap = Math.max(2, spacing);

  // Reserve space for header and footer based on layout
  let headerHeight = 0;
  let footerHeight = 0;

  if (layout === 'milestone-poster') {
    headerHeight = Math.round(canvasHeight * 0.16);
    footerHeight = Math.round(canvasHeight * 0.05);
  } else if (layout === 'magazine') {
    headerHeight = Math.round(canvasHeight * 0.12);
    footerHeight = Math.round(canvasHeight * 0.045);
  } else if (layout === 'calendar') {
    headerHeight = Math.round(canvasHeight * 0.11);
    footerHeight = Math.round(canvasHeight * 0.04);
  } else {
    // grid-30, hero-timeline, heart, minimalist-wall
    headerHeight = Math.round(canvasHeight * 0.09);
    footerHeight = Math.round(canvasHeight * 0.04);
  }

  const contentX = padding;
  const contentY = padding + headerHeight;
  const contentWidth = canvasWidth - padding * 2;
  const contentHeight = canvasHeight - padding * 2 - headerHeight - footerHeight;

  let slots: LayoutSlot[] = [];

  switch (layout) {
    case 'grid-30':
      slots = computeGrid30(contentX, contentY, contentWidth, contentHeight, gap);
      break;

    case 'hero-timeline':
      slots = computeHeroTimeline(contentX, contentY, contentWidth, contentHeight, gap, heroDay);
      break;

    case 'magazine':
      slots = computeMagazine(contentX, contentY, contentWidth, contentHeight, gap, heroDay);
      break;

    case 'heart':
      slots = computeHeartCollage(contentX, contentY, contentWidth, contentHeight, gap);
      break;

    case 'calendar':
      slots = computeCalendar(contentX, contentY, contentWidth, contentHeight, gap);
      break;

    case 'milestone-poster':
      slots = computeMilestonePoster(contentX, contentY, contentWidth, contentHeight, gap, heroDay);
      break;

    case 'minimalist-wall':
      slots = computeMinimalistWall(contentX, contentY, contentWidth, contentHeight, gap);
      break;

    default:
      slots = computeGrid30(contentX, contentY, contentWidth, contentHeight, gap);
  }

  return {
    canvasWidth,
    canvasHeight,
    slots,
    headerRect: { x: padding, y: padding, width: canvasWidth - padding * 2, height: headerHeight },
    footerRect: { x: padding, y: canvasHeight - padding - footerHeight, width: canvasWidth - padding * 2, height: footerHeight },
  };
}

// 1. Grid 30: 5 columns x 6 rows (or 6 cols x 5 rows for landscape/square)
function computeGrid30(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number
): LayoutSlot[] {
  const isTaller = height >= width;
  const cols = isTaller ? 5 : 6;
  const rows = isTaller ? 6 : 5;

  const totalGapW = gap * (cols - 1);
  const totalGapH = gap * (rows - 1);

  const slotW = (width - totalGapW) / cols;
  const slotH = (height - totalGapH) / rows;

  const slots: LayoutSlot[] = [];
  let day = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (day <= 30) {
        slots.push({
          dayNumber: day,
          x: Math.round(x + c * (slotW + gap)),
          y: Math.round(y + r * (slotH + gap)),
          width: Math.round(slotW),
          height: Math.round(slotH),
          tag: day === 1 ? 'Hello World' : day === 30 ? '1 Month Old' : undefined,
        });
        day++;
      }
    }
  }

  return slots;
}

// 2. Hero + Timeline: One large hero, remaining 29 surrounding or cascading
function computeHeroTimeline(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number,
  heroDay = 1
): LayoutSlot[] {
  const slots: LayoutSlot[] = [];

  const topHeight = (height - gap) * 0.42;
  const bottomHeight = height - gap - topHeight;

  // Top Section: Left Hero (spans ~55% width), Right 4 photos in 2x2 grid (spans 45% width)
  const heroWidth = (width - gap) * 0.58;
  const sideWidth = width - gap - heroWidth;
  const sideItemW = (sideWidth - gap) / 2;
  const sideItemH = (topHeight - gap) / 2;

  // Hero Slot
  slots.push({
    dayNumber: heroDay,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(heroWidth),
    height: Math.round(topHeight),
    isHero: true,
    tag: 'Favorite Moment',
  });

  // Days list without heroDay
  const otherDays: number[] = [];
  for (let d = 1; d <= 30; d++) {
    if (d !== heroDay) otherDays.push(d);
  }

  // 4 Side slots (e.g. early days)
  let dayIdx = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + heroWidth + gap + c * (sideItemW + gap)),
          y: Math.round(y + r * (sideItemH + gap)),
          width: Math.round(sideItemW),
          height: Math.round(sideItemH),
        });
        dayIdx++;
      }
    }
  }

  // Bottom section: 25 days arranged in 5 cols x 5 rows
  const bCols = 5;
  const bRows = 5;
  const bSlotW = (width - gap * (bCols - 1)) / bCols;
  const bSlotH = (bottomHeight - gap * (bRows - 1)) / bRows;
  const bY = y + topHeight + gap;

  for (let r = 0; r < bRows; r++) {
    for (let c = 0; c < bCols; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + c * (bSlotW + gap)),
          y: Math.round(bY + r * (bSlotH + gap)),
          width: Math.round(bSlotW),
          height: Math.round(bSlotH),
          tag: otherDays[dayIdx] === 30 ? '1 Month' : undefined,
        });
        dayIdx++;
      }
    }
  }

  return slots;
}

// 3. Magazine Layout: Dynamic multi-span editorial grid
function computeMagazine(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number,
  heroDay = 1
): LayoutSlot[] {
  // 6 columns grid x 7 rows grid (42 units)
  // Featured Hero: 3 cols x 3 rows (9 units)
  // Secondary Feature 1: 2 cols x 2 rows (4 units)
  // Secondary Feature 2: 2 cols x 2 rows (4 units)
  // 27 other single-cell slots (27 units)
  // 9 + 4 + 4 + 27 = 44 (close to 42).
  // Let's create an editorial split:
  // Row 1 & 2: Large Hero (spans 3 cols x 2 rows) + 3 single cells on right top + 3 single cells underneath
  // Let's do structured editorial blocks:
  // Top Block (35% height):
  //   Left: Hero (width 50%)
  //   Right: 6 slots (2 cols x 3 rows, or 3 cols x 2 rows)
  // Mid Block (30% height):
  //   Left: Feature A (spans 2 cols, width 33%)
  //   Center: 6 slots (2 cols x 3 rows or 3 cols x 2 rows, width 34%)
  //   Right: Feature B (spans 2 cols, width 33%)
  // Bottom Block (35% height):
  //   15 slots (5 cols x 3 rows)
  // Let's count slots:
  // Top: 1 (hero) + 6 = 7
  // Mid: 1 (feature A) + 6 (center) + 1 (feature B) = 8
  // Bottom: 15
  // Total = 7 + 8 + 15 = 30 slots exactly!
  const slots: LayoutSlot[] = [];

  const topH = (height - gap * 2) * 0.36;
  const midH = (height - gap * 2) * 0.30;
  const botH = height - gap * 2 - topH - midH;

  const otherDays: number[] = [];
  for (let d = 1; d <= 30; d++) {
    if (d !== heroDay) otherDays.push(d);
  }

  // --- TOP BLOCK ---
  // Hero (left 50%)
  const topHeroW = (width - gap) * 0.52;
  const topGridW = width - gap - topHeroW;
  slots.push({
    dayNumber: heroDay,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(topHeroW),
    height: Math.round(topH),
    isHero: true,
    tag: 'Cover Story',
  });

  // Top 6 slots (3 cols x 2 rows)
  const tCols = 3;
  const tRows = 2;
  const tSlotW = (topGridW - gap * (tCols - 1)) / tCols;
  const tSlotH = (topH - gap * (tRows - 1)) / tRows;
  let dayIdx = 0;

  for (let r = 0; r < tRows; r++) {
    for (let c = 0; c < tCols; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + topHeroW + gap + c * (tSlotW + gap)),
          y: Math.round(y + r * (tSlotH + gap)),
          width: Math.round(tSlotW),
          height: Math.round(tSlotH),
        });
        dayIdx++;
      }
    }
  }

  // --- MID BLOCK ---
  const midY = y + topH + gap;
  const midFeatW = (width - gap * 2) * 0.32;
  const midCenterW = width - gap * 2 - midFeatW * 2;

  // Feature A (Left)
  if (dayIdx < otherDays.length) {
    slots.push({
      dayNumber: otherDays[dayIdx],
      x: Math.round(x),
      y: Math.round(midY),
      width: Math.round(midFeatW),
      height: Math.round(midH),
      tag: 'Mid-Month',
    });
    dayIdx++;
  }

  // Center 6 slots (3 cols x 2 rows)
  const mCols = 3;
  const mRows = 2;
  const mSlotW = (midCenterW - gap * (mCols - 1)) / mCols;
  const mSlotH = (midH - gap * (mRows - 1)) / mRows;

  for (let r = 0; r < mRows; r++) {
    for (let c = 0; c < mCols; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + midFeatW + gap + c * (mSlotW + gap)),
          y: Math.round(midY + r * (mSlotH + gap)),
          width: Math.round(mSlotW),
          height: Math.round(mSlotH),
        });
        dayIdx++;
      }
    }
  }

  // Feature B (Right)
  if (dayIdx < otherDays.length) {
    slots.push({
      dayNumber: otherDays[dayIdx],
      x: Math.round(x + midFeatW + gap + midCenterW + gap),
      y: Math.round(midY),
      width: Math.round(midFeatW),
      height: Math.round(midH),
      tag: 'Special Feature',
    });
    dayIdx++;
  }

  // --- BOTTOM BLOCK ---
  // 15 slots (5 cols x 3 rows)
  const botY = midY + midH + gap;
  const bCols = 5;
  const bRows = 3;
  const bSlotW = (width - gap * (bCols - 1)) / bCols;
  const bSlotH = (botH - gap * (bRows - 1)) / bRows;

  for (let r = 0; r < bRows; r++) {
    for (let c = 0; c < bCols; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + c * (bSlotW + gap)),
          y: Math.round(botY + r * (bSlotH + gap)),
          width: Math.round(bSlotW),
          height: Math.round(bSlotH),
        });
        dayIdx++;
      }
    }
  }

  return slots;
}

// 4. Heart Collage: 30 slots arranged in an aesthetic heart mosaic
function computeHeartCollage(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number
): LayoutSlot[] {
  // Symmetric heart silhouette with 7 rows:
  // Row 0 (top lobes): 2 left + 2 right = 4 slots (centers at x-offsets)
  // Row 1: 6 slots across
  // Row 2: 6 slots across
  // Row 3: 6 slots across
  // Row 4: 4 slots tapering
  // Row 5: 2 slots tapering
  // Row 6: 2 slots at heart tip
  // Total = 4 + 6 + 6 + 6 + 4 + 2 + 2 = 30 slots!
  const slots: LayoutSlot[] = [];

  const rowCounts = [4, 6, 6, 6, 4, 2, 2];
  const numRows = rowCounts.length;
  const maxCols = 6;

  const slotW = (width - gap * (maxCols - 1)) / maxCols;
  const slotH = (height - gap * (numRows - 1)) / numRows;

  let currentDay = 1;

  for (let r = 0; r < numRows; r++) {
    const rowY = y + r * (slotH + gap);

    if (r === 0) {
      // Top lobes: 2 on left, 2 on right with gap in center
      // Left lobe cols: 0, 1. Right lobe cols: 4, 5. (or 1, 2 and 3, 4)
      const lobeColIndices = [0.8, 1.8, 3.2, 4.2];
      for (const colPos of lobeColIndices) {
        if (currentDay <= 30) {
          slots.push({
            dayNumber: currentDay,
            x: Math.round(x + colPos * (slotW + gap)),
            y: Math.round(rowY),
            width: Math.round(slotW),
            height: Math.round(slotH),
          });
          currentDay++;
        }
      }
    } else {
      const count = rowCounts[r];
      // Center the count slots horizontally
      const rowWidth = count * slotW + (count - 1) * gap;
      const startX = x + (width - rowWidth) / 2;

      for (let c = 0; c < count; c++) {
        if (currentDay <= 30) {
          slots.push({
            dayNumber: currentDay,
            x: Math.round(startX + c * (slotW + gap)),
            y: Math.round(rowY),
            width: Math.round(slotW),
            height: Math.round(slotH),
            tag: currentDay === 30 ? 'With Love' : undefined,
          });
          currentDay++;
        }
      }
    }
  }

  return slots;
}

// 5. Calendar Layout: 7 columns (Sunday-Saturday or Mon-Sun), Day 1 to 30 cells
function computeCalendar(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number
): LayoutSlot[] {
  // 5 rows x 7 columns = 35 cells.
  // 30 days of baby photos + 5 milestone/accent cards or start offset
  // We can place all 30 days in rows 0-4 (5 rows of 6 cols, or 7 cols: 4 rows x 7 = 28 + row 5 has 2 photos + 5 notes)
  // Or even better: 6 columns x 5 rows = 30 days exactly!
  // To give it a calendar feel, 7 cols with 30 days starting at day 1:
  const cols = 7;
  const rows = 5; // 35 cells total
  const slotW = (width - gap * (cols - 1)) / cols;
  const slotH = (height - gap * (rows - 1)) / rows;

  const slots: LayoutSlot[] = [];
  let day = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (day <= 30) {
        slots.push({
          dayNumber: day,
          x: Math.round(x + c * (slotW + gap)),
          y: Math.round(y + r * (slotH + gap)),
          width: Math.round(slotW),
          height: Math.round(slotH),
          tag: `Day ${day}`,
        });
        day++;
      }
    }
  }

  return slots;
}

// 6. Milestone Poster: Grand keepsake with hero + 30 chronological mini-tiles
function computeMilestonePoster(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number,
  heroDay = 1
): LayoutSlot[] {
  // Top: Hero portrait in center (height ~46%), flanked by 4 milestone tiles on left and 4 on right
  // Bottom: 22 milestone tiles in 2 rows (11 cols x 2 rows)
  // Total: 1 hero + 4 + 4 + 22 = 31... Wait, we need exactly 30 days!
  // Let's do:
  // Top middle: Large Hero photo (representing heroDay, e.g. Day 1 or Day 30)
  // Left side of hero: 3 days in vertical column (Days 1, 2, 3)
  // Right side of hero: 3 days in vertical column (Days 4, 5, 6)
  // Top slots total: 1 hero + 6 days = 7 days
  // Bottom gallery: 23 days (Wait: 30 days total - 1 hero = 29 remaining)
  // If top has 1 hero + 2 left + 2 right = 5 days total.
  // Bottom gallery has 25 days arranged in 5 cols x 5 rows.
  // 5 + 25 = 30 days exactly!
  const slots: LayoutSlot[] = [];

  const topH = (height - gap) * 0.45;
  const botH = height - gap - topH;

  const sideW = (width - gap * 2) * 0.22;
  const heroW = width - gap * 2 - sideW * 2;

  // Hero center
  slots.push({
    dayNumber: heroDay,
    x: Math.round(x + sideW + gap),
    y: Math.round(y),
    width: Math.round(heroW),
    height: Math.round(topH),
    isHero: true,
    tag: 'First Month Milestone',
  });

  const otherDays: number[] = [];
  for (let d = 1; d <= 30; d++) {
    if (d !== heroDay) otherDays.push(d);
  }

  // Left 2 items (stacked vertically)
  const sideItemH = (topH - gap) / 2;
  let dayIdx = 0;

  for (let r = 0; r < 2; r++) {
    if (dayIdx < otherDays.length) {
      slots.push({
        dayNumber: otherDays[dayIdx],
        x: Math.round(x),
        y: Math.round(y + r * (sideItemH + gap)),
        width: Math.round(sideW),
        height: Math.round(sideItemH),
      });
      dayIdx++;
    }
  }

  // Right 2 items (stacked vertically)
  for (let r = 0; r < 2; r++) {
    if (dayIdx < otherDays.length) {
      slots.push({
        dayNumber: otherDays[dayIdx],
        x: Math.round(x + sideW + gap + heroW + gap),
        y: Math.round(y + r * (sideItemH + gap)),
        width: Math.round(sideW),
        height: Math.round(sideItemH),
      });
      dayIdx++;
    }
  }

  // Bottom 25 items in 5 cols x 5 rows
  const botY = y + topH + gap;
  const bCols = 5;
  const bRows = 5;
  const bSlotW = (width - gap * (bCols - 1)) / bCols;
  const bSlotH = (botH - gap * (bRows - 1)) / bRows;

  for (let r = 0; r < bRows; r++) {
    for (let c = 0; c < bCols; c++) {
      if (dayIdx < otherDays.length) {
        slots.push({
          dayNumber: otherDays[dayIdx],
          x: Math.round(x + c * (bSlotW + gap)),
          y: Math.round(botY + r * (bSlotH + gap)),
          width: Math.round(bSlotW),
          height: Math.round(bSlotH),
        });
        dayIdx++;
      }
    }
  }

  return slots;
}

// 7. Minimalist Photo Wall: Generous museum matting and floating gallery tiles
function computeMinimalistWall(
  x: number,
  y: number,
  width: number,
  height: number,
  gap: number
): LayoutSlot[] {
  // Generous gallery spacing (larger gaps)
  const wallGap = Math.max(gap, 8);
  const cols = 5;
  const rows = 6;

  const totalGapW = wallGap * (cols - 1);
  const totalGapH = wallGap * (rows - 1);

  const slotW = (width - totalGapW) / cols;
  const slotH = (height - totalGapH) / rows;

  const slots: LayoutSlot[] = [];
  let day = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (day <= 30) {
        slots.push({
          dayNumber: day,
          x: Math.round(x + c * (slotW + wallGap)),
          y: Math.round(y + r * (slotH + wallGap)),
          width: Math.round(slotW),
          height: Math.round(slotH),
        });
        day++;
      }
    }
  }

  return slots;
}
