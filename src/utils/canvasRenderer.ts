import type { BabyProfile, CollageConfig, CollageTheme, DayPhoto } from '../types';
import { THEMES } from '../constants/themes';
import { computeCollageLayout, type LayoutSlot } from './layoutEngine';
import { calculateSourceCrop } from './imageUtils';

export interface RenderCanvasOptions {
  canvas: HTMLCanvasElement;
  config: CollageConfig;
  photos: Map<number, DayPhoto>;
  profile: BabyProfile;
  imageElements: Map<number, HTMLImageElement>;
  showGuides?: boolean;
  scale?: number; // Zoom scale factor for preview canvas
}

export async function renderCollageToCanvas(options: RenderCanvasOptions): Promise<void> {
  const { canvas, config, photos, profile, imageElements, showGuides = false } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const theme: CollageTheme = THEMES[config.themeId] || THEMES['timeless-cream'];

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw Background
  drawBackground(ctx, width, height, theme);

  // 2. Draw Decorative Theme Elements
  if (config.showDecorations) {
    drawThemeDecorations(ctx, width, height, theme);
  }

  // 3. Compute Layout
  const computed = computeCollageLayout(config, width, height);

  // 4. Draw Header
  drawHeader(ctx, computed.headerRect, config, theme, profile);

  // 5. Draw Photo Slots
  for (const slot of computed.slots) {
    await drawSlot(ctx, slot, config, theme, photos.get(slot.dayNumber), imageElements.get(slot.dayNumber));
  }

  // 6. Draw Footer
  drawFooter(ctx, computed.footerRect, config, theme);

  // 7. Optional Safe Margins / Guides
  if (showGuides) {
    drawPrintGuides(ctx, width, height);
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: CollageTheme
): void {
  // Base background fill (solid or subtle gradient)
  if (theme.bgSecondaryColor) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, theme.bgColor);
    grad.addColorStop(1, theme.bgSecondaryColor);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = theme.bgColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Background Pattern
  if (theme.bgPattern === 'dots') {
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.035;
    const spacing = Math.round(width * 0.02);
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  } else if (theme.bgPattern === 'stars') {
    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.08;
    const starCount = Math.round((width * height) / 100000);
    for (let i = 0; i < starCount; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 249.7) % height);
      drawSmallStar(ctx, sx, sy, 3);
    }
    ctx.globalAlpha = 1.0;
  } else if (theme.bgPattern === 'linen' || theme.bgPattern === 'vintage-grain') {
    ctx.strokeStyle = theme.textColor;
    ctx.globalAlpha = 0.015;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }
}

function drawThemeDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: CollageTheme
): void {
  const margin = Math.round(width * 0.025);
  const ornamentSize = Math.round(width * 0.04);

  ctx.save();
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;

  if (theme.cornerOrnament === 'delicate-corner') {
    // 4 Corner flourishes
    const corners = [
      { x: margin, y: margin, dx: 1, dy: 1 },
      { x: width - margin, y: margin, dx: -1, dy: 1 },
      { x: margin, y: height - margin, dx: 1, dy: -1 },
      { x: width - margin, y: height - margin, dx: -1, dy: -1 },
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * ornamentSize);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * ornamentSize, c.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(c.x + c.dx * (ornamentSize * 0.3), c.y + c.dy * (ornamentSize * 0.3), 2, 0, Math.PI * 2);
      ctx.fillStyle = theme.accentColor;
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number } | undefined,
  config: CollageConfig,
  theme: CollageTheme,
  profile: BabyProfile
): void {
  if (!rect || rect.height < 30) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  // Title: Baby's name or custom title
  const babyDisplayName = (config.showBabyInfo && profile.name.trim()) ? profile.name.trim() : (config.title || "Our Baby's First 30 Days");
  const subtitleText = config.subtitle || "Thirty days of little moments, endless love.";

  const titleFontSize = Math.round(Math.min(rect.height * 0.45, rect.width * 0.045));
  const subFontSize = Math.round(Math.max(14, titleFontSize * 0.38));

  // Title
  ctx.fillStyle = theme.textColor;
  ctx.font = `600 ${titleFontSize}px ${theme.fontHeading}`;
  ctx.fillText(babyDisplayName, centerX, centerY - titleFontSize * 0.35);

  // Subtitle
  ctx.fillStyle = theme.subtitleColor;
  ctx.font = `normal ${subFontSize}px ${theme.fontBody}`;
  ctx.fillText(subtitleText, centerX, centerY + titleFontSize * 0.45);

  // If Milestone Poster layout, display birth stats
  if (config.layout === 'milestone-poster' && profile.birthDate) {
    const statsFontSize = Math.round(subFontSize * 0.85);
    ctx.font = `500 ${statsFontSize}px ${theme.fontBody}`;
    ctx.fillStyle = theme.accentColor;

    const statsParts = [];
    if (profile.birthDate) statsParts.push(`Born: ${profile.birthDate}`);
    if (profile.birthWeight) statsParts.push(`Weight: ${profile.birthWeight}`);
    if (profile.birthLength) statsParts.push(`Length: ${profile.birthLength}`);
    if (profile.birthTime) statsParts.push(`Time: ${profile.birthTime}`);

    const statsLine = statsParts.join('  •  ');
    if (statsLine) {
      ctx.fillText(statsLine, centerX, centerY + titleFontSize * 0.95);
    }
  }

  // Thin decorative line
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  const lineWidth = Math.min(rect.width * 0.3, 300);
  ctx.beginPath();
  ctx.moveTo(centerX - lineWidth / 2, rect.y + rect.height - 2);
  ctx.lineTo(centerX + lineWidth / 2, rect.y + rect.height - 2);
  ctx.stroke();

  ctx.restore();
}

async function drawSlot(
  ctx: CanvasRenderingContext2D,
  slot: LayoutSlot,
  config: CollageConfig,
  theme: CollageTheme,
  photo?: DayPhoto,
  imgElement?: HTMLImageElement
): Promise<void> {
  const { x, y, width, height, dayNumber, isHero, tag } = slot;
  const radius = Math.max(0, Math.min(width / 4, config.borderRadius ?? theme.borderRadius));
  const borderWidth = Math.max(0, config.borderWidth ?? theme.borderWidth);
  const borderColor = config.borderColor || theme.borderColor;

  ctx.save();

  // Draw shadow if enabled
  if (config.shadowEnabled) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = Math.round(width * 0.04);
    ctx.shadowOffsetY = Math.round(width * 0.02);
  }

  // Clip rounded rectangle for photo / card
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, radius);

  if (photo && imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
    // Fill card background first
    ctx.fillStyle = theme.cardBg;
    ctx.fill();

    // Clip to rounded rect
    ctx.save();
    ctx.clip();

    // Reset shadow for inner image
    ctx.shadowColor = 'transparent';

    // Calculate crop parameters
    const cropParams = calculateSourceCrop(
      imgElement.naturalWidth,
      imgElement.naturalHeight,
      width,
      height,
      photo.crop
    );

    // Draw image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      imgElement,
      cropParams.sx,
      cropParams.sy,
      cropParams.sWidth,
      cropParams.sHeight,
      x,
      y,
      width,
      height
    );

    ctx.restore();
  } else {
    // Missing / Empty Slot: Gentle, elegant placeholder (NO AI fakes!)
    ctx.fillStyle = theme.cardBg;
    ctx.fill();

    // Subtle dashed frame indicating empty slot
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Soft day numeral & empty icon
    ctx.fillStyle = theme.subtitleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emptyFontSize = Math.round(Math.min(width * 0.16, 24));
    ctx.font = `italic ${emptyFontSize}px ${theme.fontHeading}`;
    ctx.fillText(`Day ${dayNumber}`, x + width / 2, y + height / 2 - emptyFontSize * 0.3);

    ctx.font = `normal ${Math.max(10, emptyFontSize * 0.55)}px ${theme.fontBody}`;
    ctx.fillStyle = theme.subtitleColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText('No photo yet', x + width / 2, y + height / 2 + emptyFontSize * 0.7);
    ctx.globalAlpha = 1.0;
  }

  // Draw Card Border
  if (borderWidth > 0) {
    ctx.beginPath();
    roundRect(ctx, x, y, width, height, radius);
    ctx.strokeStyle = isHero ? theme.accentColor : borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }

  // Draw Day Badge if enabled
  if (config.showDayNumbers) {
    drawDayBadge(ctx, slot, config, theme, photo);
  }

  // Draw Tag (e.g. "Hello World", "Favorite Moment")
  if (tag && width > 120) {
    drawSlotTag(ctx, slot, tag, theme);
  }

  ctx.restore();
}

function drawDayBadge(
  ctx: CanvasRenderingContext2D,
  slot: LayoutSlot,
  config: CollageConfig,
  theme: CollageTheme,
  photo?: DayPhoto
): void {
  const { x, y, width, height, dayNumber } = slot;
  let text = `Day ${dayNumber}`;
  if (config.dayNumberFormat === '#X') text = `#${dayNumber}`;
  if (config.dayNumberFormat === 'X') text = `${dayNumber}`;

  const badgeFontSize = Math.round(Math.max(11, Math.min(width * 0.11, 20)));
  ctx.font = `600 ${badgeFontSize}px ${theme.fontBody}`;

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const paddingX = Math.round(badgeFontSize * 0.6);
  const paddingY = Math.round(badgeFontSize * 0.35);

  const badgeW = textWidth + paddingX * 2;
  const badgeH = badgeFontSize + paddingY * 2;

  // Position at top-left of the slot with gentle offset
  const badgeX = x + Math.round(width * 0.04);
  const badgeY = y + Math.round(height * 0.04);
  const badgeRadius = Math.round(badgeH / 2);

  // Background pill
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeRadius);
  ctx.fillStyle = theme.badgeBg;
  ctx.globalAlpha = 0.92;
  ctx.fill();

  if (theme.badgeBorderColor) {
    ctx.strokeStyle = theme.badgeBorderColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Badge text
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = theme.badgeTextColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, badgeX + badgeW / 2, badgeY + badgeH / 2);

  // Optional date taken underneath badge if enabled & available
  if (config.showDates && photo?.dateTaken && height > 160) {
    ctx.font = `normal ${Math.max(9, badgeFontSize * 0.65)}px ${theme.fontBody}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(photo.dateTaken, badgeX + badgeW / 2, badgeY + badgeH + 12);
  }

  ctx.restore();
}

function drawSlotTag(
  ctx: CanvasRenderingContext2D,
  slot: LayoutSlot,
  tag: string,
  theme: CollageTheme
): void {
  const { x, y, width, height } = slot;
  const tagFontSize = Math.round(Math.max(10, Math.min(width * 0.09, 14)));
  ctx.font = `italic 600 ${tagFontSize}px ${theme.fontHeading}`;

  const metrics = ctx.measureText(tag);
  const tagW = metrics.width + 16;
  const tagH = tagFontSize + 8;
  const tagX = x + width - tagW - Math.round(width * 0.04);
  const tagY = y + height - tagH - Math.round(height * 0.04);

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, tagX, tagY, tagW, tagH, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, tagX + tagW / 2, tagY + tagH / 2);
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number } | undefined,
  config: CollageConfig,
  theme: CollageTheme
): void {
  if (!rect || rect.height < 15) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  // Scale font size proportionally to the canvas resolution so it is clearly readable
  // both in screen preview and in 300 DPI high-resolution exports.
  let footerFontSize = Math.round(Math.max(16, Math.min(rect.height * 0.42, rect.width * 0.024)));

  const milestoneMsg = config.milestoneText || 'BabyBloom Keepsake • Thirty Days of Love & Wonder';

  // Ensure long custom dedication messages fit comfortably without clipping off the edges
  ctx.font = `500 ${footerFontSize}px ${theme.fontBody}`;
  const textWidth = ctx.measureText(milestoneMsg).width;
  const maxAllowedWidth = rect.width * 0.88;
  if (textWidth > maxAllowedWidth && textWidth > 0) {
    footerFontSize = Math.max(14, Math.round(footerFontSize * (maxAllowedWidth / textWidth)));
  }

  // Draw delicate accent line above the footer text
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = Math.max(1, Math.round(rect.width * 0.00075));
  ctx.globalAlpha = 0.45;
  const dividerWidth = Math.min(rect.width * 0.32, Math.max(160, textWidth * 0.75));
  ctx.beginPath();
  ctx.moveTo(centerX - dividerWidth / 2, rect.y + 4);
  ctx.lineTo(centerX + dividerWidth / 2, rect.y + 4);
  ctx.stroke();

  // Draw milestone dedication text with crisp contrast and readable scale
  ctx.font = `500 ${footerFontSize}px ${theme.fontBody}`;
  ctx.fillStyle = theme.subtitleColor;
  ctx.globalAlpha = 0.92;
  ctx.fillText(milestoneMsg, centerX, centerY + 3);

  ctx.restore();
}

function drawPrintGuides(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const margin = Math.round(Math.min(width, height) * 0.035); // ~0.25 inch safe zone

  ctx.save();
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Label
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#3B82F6';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Print Safe Margin (0.25")', margin + 6, margin + 6);
  ctx.restore();
}

function drawSmallStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes = 4): void {
  const outerRadius = 4;
  const innerRadius = 1.5;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, width, height, radius);
    return;
  }
  // Fallback for older browsers
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
