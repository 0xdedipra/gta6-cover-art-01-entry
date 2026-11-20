// coverRenderer.js — draws a complete Vice Panels cover to any canvas.
// Handles panel clipping, cover-fit photo placement, grades, borders,
// halftone and vignette overlays, stacked title lettering, subtitle,
// sticker badge and the five-star row. Pure canvas, fully offline.

import { getLayout, visiblePanels, panelBounds } from "./panelLayouts.js";
import { getGrade, applyGradeOverlays } from "./colorGrades.js";
import { drawPrintGrain, drawSunburstRays } from "./artEffects.js";

export const TITLE_FONT_STACK = '"Arial Black","Arial Narrow Bold",Arial,sans-serif';
export const BODY_FONT_STACK = '"Arial Narrow Bold",Arial,sans-serif';

export function createPanelState(photoIndex) {
  return { photoIndex: photoIndex || 0, panX: 0.5, panY: 0.5, zoom: 1 };
}

export function tracePanelPath(ctx, panel, w, h) {
  ctx.beginPath();
  panel.points.forEach(([nx, ny], i) => {
    if (i === 0) ctx.moveTo(nx * w, ny * h); else ctx.lineTo(nx * w, ny * h);
  });
  ctx.closePath();
}

export function drawPhotoCoverFitted(ctx, image, panel, state, w, h) {
  if (!image || !image.width) { drawPlaceholderPanel(ctx, panel, w, h); return; }
  const b = panelBounds(panel);
  const bw = b.w * w, bh = b.h * h;
  const zoom = Math.max(1, state.zoom || 1);
  const scale = Math.max(bw / image.width, bh / image.height) * zoom;
  const dw = image.width * scale, dh = image.height * scale;
  const cx = b.x * w + bw / 2, cy = b.y * h + bh / 2;
  const maxShiftX = Math.max(0, (dw - bw) / 2), maxShiftY = Math.max(0, (dh - bh) / 2);
  const dx = cx - dw / 2 + (0.5 - (state.panX ?? 0.5)) * 2 * maxShiftX;
  const dy = cy - dh / 2 + (0.5 - (state.panY ?? 0.5)) * 2 * maxShiftY;
  ctx.drawImage(image, dx, dy, dw, dh);
}

function drawPlaceholderPanel(ctx, panel, w, h) {
  const b = panelBounds(panel);
  const g = ctx.createLinearGradient(b.x * w, b.y * h, (b.x + b.w) * w, (b.y + b.h) * h);
  g.addColorStop(0, "#3a1c5c"); g.addColorStop(1, "#0e2a3a");
  ctx.fillStyle = g; ctx.fillRect(b.x * w, b.y * h, b.w * w, b.h * h);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `700 ${Math.round(h * 0.03)}px ${BODY_FONT_STACK}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("ADD A PHOTO", (b.x + b.w / 2) * w, (b.y + b.h / 2) * h);
}

export function drawPanelBorders(ctx, layout, grade, w, h, selectedIndex) {
  const vis = visiblePanels(layout);
  vis.forEach((panel, i) => {
    tracePanelPath(ctx, panel, w, h);
    const isSel = i === selectedIndex;
    ctx.save();
    ctx.shadowColor = isSel ? "#ffffff" : grade.glow;
    ctx.shadowBlur = isSel ? h * 0.02 : h * 0.012;
    ctx.strokeStyle = isSel ? "#ffffff" : grade.border;
    ctx.lineWidth = Math.max(2, h * (isSel ? 0.008 : 0.005));
    ctx.stroke(); ctx.restore();
    tracePanelPath(ctx, panel, w, h);
    ctx.strokeStyle = "rgba(10,6,20,0.9)"; ctx.lineWidth = Math.max(1, h * 0.002); ctx.stroke();
  });
}

export function drawHalftoneOverlay(ctx, w, h) {
  const step = Math.max(10, Math.round(w / 72)); const r = step * 0.16;
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.13)";
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawVignetteOverlay(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(5,2,15,0.55)");
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
}
export function drawStarShape(ctx, cx, cy, radius, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = "rgba(10,6,20,0.85)"; ctx.lineWidth = radius * 0.12; ctx.stroke();
}

export function drawStarRow(ctx, w, h, atTop) {
  const r = h * 0.022, gap = r * 2.7, total = gap * 4;
  const cy = atTop ? h * 0.055 : h * 0.945;
  for (let i = 0; i < 5; i++) drawStarShape(ctx, w / 2 - total / 2 + i * gap, cy, r, "#ffd60a");
}

export function drawStickerBadge(ctx, text, w, h, grade) {
  if (!text) return;
  const cx = w * 0.865, cy = h * 0.16, r = Math.min(w, h) * 0.095;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22);
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = r * 0.3; ctx.shadowOffsetY = r * 0.08;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = "#ffd60a"; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = r * 0.07; ctx.strokeStyle = "#14102a"; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.035; ctx.setLineDash([r * 0.14, r * 0.1]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#14102a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
  const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [words[0] || ""];
  ctx.font = `900 ${Math.round(r * (lines.length > 1 ? 0.34 : 0.4))}px ${TITLE_FONT_STACK}`;
  lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * r * 0.42));
  ctx.restore();
}

export function drawCoverTitle(ctx, state, grade, w, h) {
  const atTop = state.titlePosition !== "bottom";
  const lines = [state.titleLine1, state.titleLine2].map((s) => String(s || "").toUpperCase()).filter(Boolean);
  if (!lines.length) return;
  let size = h * 0.13;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const setFont = (s) => { ctx.font = `italic 900 ${Math.round(s)}px ${TITLE_FONT_STACK}`; };
  setFont(size);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  if (widest > w * 0.92) { size *= (w * 0.92) / widest; setFont(size); }
  const lineH = size * 0.92;
  const blockH = lineH * lines.length;
  const startY = atTop ? h * 0.06 + blockH / 2 : h * 0.94 - blockH / 2;
  ctx.transform(1, 0, -0.06, 1, 0, 0);
  lines.forEach((line, i) => {
    const y = startY + (i - (lines.length - 1) / 2) * lineH;
    const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    g.addColorStop(0, grade.titleTop); g.addColorStop(1, grade.titleBottom);
    ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = size * 0.12; ctx.shadowOffsetY = size * 0.07;
    ctx.lineJoin = "round"; ctx.strokeStyle = "#12081f"; ctx.lineWidth = size * 0.16;
    ctx.strokeText(line, w / 2, y);
    ctx.shadowColor = "transparent"; ctx.fillStyle = g; ctx.fillText(line, w / 2, y);
  });
  ctx.restore();
  if (state.subtitle) {
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let sSize = h * 0.032; ctx.font = `700 ${Math.round(sSize)}px ${BODY_FONT_STACK}`;
    const txt = String(state.subtitle).toUpperCase();
    const tw = ctx.measureText(txt).width;
    if (tw > w * 0.8) { sSize *= (w * 0.8) / tw; ctx.font = `700 ${Math.round(sSize)}px ${BODY_FONT_STACK}`; }
    const y = atTop ? h * 0.06 + blockH + sSize * 1.1 : h * 0.94 - blockH - sSize * 1.1;
    const pad = sSize * 0.7, bw2 = ctx.measureText(txt).width + pad * 2;
    ctx.fillStyle = "rgba(10,6,24,0.78)"; ctx.fillRect(w / 2 - bw2 / 2, y - sSize * 0.85, bw2, sSize * 1.7);
    ctx.fillStyle = "#ffffff"; ctx.fillText(txt, w / 2, y); ctx.restore();
  }
}

// renderCoverToCanvas draws the entire cover described by state.
// state: { layoutName, gradeName, photos[], panels[], titleLine1,
// titleLine2, subtitle, badgeText, titlePosition, halftone, vignette,
// showStars, selectedIndex (-1 for clean exports) }
export function renderCoverToCanvas(canvas, width, height, state) {
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  const layout = getLayout(state.layoutName); const grade = getGrade(state.gradeName);
  ctx.fillStyle = "#0b0716"; ctx.fillRect(0, 0, width, height);
  const vis = visiblePanels(layout);
  vis.forEach((panel, i) => {
    const ps = (state.panels && state.panels[i]) || createPanelState(i % Math.max(1, state.photos.length));
    const photo = state.photos[ps.photoIndex] || state.photos[0] || null;
    ctx.save(); tracePanelPath(ctx, panel, width, height); ctx.clip();
    try { ctx.filter = grade.filter; } catch (e) { /* older canvas */ }
    drawPhotoCoverFitted(ctx, photo, panel, ps, width, height);
    try { ctx.filter = "none"; } catch (e) { /* noop */ }
    applyGradeOverlays(ctx, grade, width, height);
    ctx.restore();
  });
  drawSunburstRays(ctx, width, height, grade.titleTop);
  if (state.halftone) drawHalftoneOverlay(ctx, width, height);
  drawPrintGrain(ctx, width, height, 0.05);
  if (state.vignette) drawVignetteOverlay(ctx, width, height);
  // Legibility scrim behind the lettering zone keeps type clean over busy photos.
  const scrimH = height * 0.34; const atTop = state.titlePosition !== "bottom";
  const scrim = atTop ? ctx.createLinearGradient(0, 0, 0, scrimH) : ctx.createLinearGradient(0, height, 0, height - scrimH);
  scrim.addColorStop(0, "rgba(8,3,18,0.62)"); scrim.addColorStop(1, "rgba(8,3,18,0)");
  ctx.fillStyle = scrim; ctx.fillRect(0, atTop ? 0 : height - scrimH, width, scrimH);
  drawPanelBorders(ctx, layout, grade, width, height, state.selectedIndex ?? -1);
  if (state.showStars) drawStarRow(ctx, width, height, state.titlePosition !== "bottom");
  drawCoverTitle(ctx, state, grade, width, height);
  drawStickerBadge(ctx, state.badgeText, width, height, grade);
  return canvas;
}
