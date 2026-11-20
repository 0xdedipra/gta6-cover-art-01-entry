// editorControls.js — Vice Panels editor wiring.
// Loads sample photos, handles uploads and drag-and-drop, panel
// selection and panning, all control bindings, live preview and
// one-click PNG exports. Exposes window.vicePanels for automation.

import { getLayoutNames, getLayout, visiblePanels, findPanelAt } from "./panelLayouts.js";
import { getGradeNames, getGrade } from "./colorGrades.js";
import { renderCoverToCanvas, createPanelState } from "./coverRenderer.js";

const SAMPLE_PHOTOS = [
  { name: "Boulevard", src: "samples/boulevard.jpg" },
  { name: "Pier", src: "samples/pier.jpg" },
];
const EXPORT_SIZES = [
  { id: "square", label: "Square 1080 × 1080", w: 1080, h: 1080 },
  { id: "portrait", label: "Portrait 1080 × 1350", w: 1080, h: 1350 },
  { id: "landscape", label: "Landscape 1920 × 1080", w: 1920, h: 1080 },
];

export const editorState = {
  layoutName: "classic", gradeName: "viceSunset",
  titleLine1: "VICE", titleLine2: "PANELS",
  subtitle: "COVER ART STUDIO", badgeText: "NEW COVER",
  titlePosition: "top", halftone: true, vignette: true, showStars: true,
  photos: [], photoNames: [], panels: [], selectedIndex: 0,
};

function rebuildPanelStates(keep) {
  const count = visiblePanels(getLayout(editorState.layoutName)).length;
  const next = [];
  for (let i = 0; i < count; i++) {
    const old = keep && editorState.panels[i];
    next.push(old ? { ...old } : createPanelState(editorState.photos.length ? i % editorState.photos.length : 0));
  }
  editorState.panels = next;
  if (editorState.selectedIndex >= count) editorState.selectedIndex = 0;
}

function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = reject; img.src = src;
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = reject; img.src = url;
  });
}

export function snapshotState(forExport) {
  return {
    layoutName: editorState.layoutName, gradeName: editorState.gradeName,
    titleLine1: editorState.titleLine1, titleLine2: editorState.titleLine2,
    subtitle: editorState.subtitle, badgeText: editorState.badgeText,
    titlePosition: editorState.titlePosition, halftone: editorState.halftone,
    vignette: editorState.vignette, showStars: editorState.showStars,
    photos: editorState.photos, panels: editorState.panels.map((p) => ({ ...p })),
    selectedIndex: forExport ? -1 : editorState.selectedIndex,
  };
}

export function initEditor() {
  const preview = document.getElementById("previewCanvas");
  const els = {
    layout: document.getElementById("layoutSelect"), grade: document.getElementById("gradeSelect"),
    title1: document.getElementById("titleLine1"), title2: document.getElementById("titleLine2"),
    subtitle: document.getElementById("subtitleInput"), badge: document.getElementById("badgeInput"),
    zoom: document.getElementById("zoomSlider"), size: document.getElementById("sizeSelect"),
    file: document.getElementById("photoUpload"), slots: document.getElementById("photoSlots"),
    status: document.getElementById("statusLine"), selected: document.getElementById("selectedLabel"),
  };
  for (const n of getLayoutNames()) { const o = document.createElement("option"); o.value = n; o.textContent = getLayout(n).label; els.layout.appendChild(o); }
  for (const n of getGradeNames()) { const o = document.createElement("option"); o.value = n; o.textContent = getGrade(n).label; els.grade.appendChild(o); }
  for (const s of EXPORT_SIZES) { const o = document.createElement("option"); o.value = s.id; o.textContent = s.label; els.size.appendChild(o); }
  els.layout.value = editorState.layoutName; els.grade.value = editorState.gradeName;
  els.title1.value = editorState.titleLine1; els.title2.value = editorState.titleLine2;
  els.subtitle.value = editorState.subtitle; els.badge.value = editorState.badgeText;

  function renderPreview() {
    const rect = preview.getBoundingClientRect();
    const w = Math.max(480, Math.round(rect.width || 720));
    const size = EXPORT_SIZES.find((s) => s.id === els.size.value) || EXPORT_SIZES[0];
    const h = Math.round((w * size.h) / size.w);
    renderCoverToCanvas(preview, w, h, snapshotState(false));
    const sel = editorState.panels[editorState.selectedIndex];
    els.selected.textContent = "Panel " + (editorState.selectedIndex + 1) + " selected";
    if (sel) els.zoom.value = String(sel.zoom || 1);
    renderPhotoSlots();
  }
  function renderPhotoSlots() {
    els.slots.innerHTML = "";
    editorState.photoNames.forEach((name, i) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "slot-btn";
      b.textContent = (i + 1) + " · " + name;
      if (editorState.panels[editorState.selectedIndex]?.photoIndex === i) b.classList.add("active");
      b.addEventListener("click", () => { const p = editorState.panels[editorState.selectedIndex]; if (p) { p.photoIndex = i; renderPreview(); } });
      els.slots.appendChild(b);
    });
  }
  async function addFiles(files) {
    for (const f of files) {
      if (editorState.photos.length >= 3) { els.status.textContent = "Maximum of 3 photos reached."; break; }
      try { const img = await loadImageFromFile(f); editorState.photos.push(img); editorState.photoNames.push(f.name.slice(0, 18)); } catch (e) { /* skip bad file */ }
    }
    rebuildPanelStates(true); renderPreview();
  }
  els.file.addEventListener("change", () => { addFiles([...els.file.files]); els.file.value = ""; });
  preview.addEventListener("dragover", (e) => e.preventDefault());
  preview.addEventListener("drop", (e) => { e.preventDefault(); addFiles([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"))); });
  let dragging = null;
  function canvasPoint(e) { const r = preview.getBoundingClientRect(); return { nx: (e.clientX - r.left) / r.width, ny: (e.clientY - r.top) / r.height }; }
  preview.addEventListener("pointerdown", (e) => {
    const { nx, ny } = canvasPoint(e);
    const idx = findPanelAt(getLayout(editorState.layoutName), nx, ny);
    if (idx >= 0) editorState.selectedIndex = idx;
    dragging = { x: e.clientX, y: e.clientY }; preview.setPointerCapture(e.pointerId); renderPreview();
  });
  preview.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = editorState.panels[editorState.selectedIndex]; if (!p) return;
    const r = preview.getBoundingClientRect();
    p.panX = Math.min(1, Math.max(0, (p.panX ?? 0.5) - (e.clientX - dragging.x) / r.width));
    p.panY = Math.min(1, Math.max(0, (p.panY ?? 0.5) - (e.clientY - dragging.y) / r.height));
    dragging = { x: e.clientX, y: e.clientY }; renderPreview();
  });
  preview.addEventListener("pointerup", () => { dragging = null; });
  els.layout.addEventListener("change", () => { editorState.layoutName = els.layout.value; rebuildPanelStates(false); renderPreview(); });
  els.grade.addEventListener("change", () => { editorState.gradeName = els.grade.value; renderPreview(); });
  els.size.addEventListener("change", renderPreview);
  els.zoom.addEventListener("input", () => { const p = editorState.panels[editorState.selectedIndex]; if (p) { p.zoom = parseFloat(els.zoom.value); renderPreview(); } });
  const bindText = (el, key) => el.addEventListener("input", () => { editorState[key] = el.value; renderPreview(); });
  bindText(els.title1, "titleLine1"); bindText(els.title2, "titleLine2");
  bindText(els.subtitle, "subtitle"); bindText(els.badge, "badgeText");
  const bindCheck = (id, key) => { const c = document.getElementById(id); c.checked = editorState[key]; c.addEventListener("change", () => { editorState[key] = c.checked; renderPreview(); }); };
  bindCheck("halftoneToggle", "halftone"); bindCheck("vignetteToggle", "vignette"); bindCheck("starsToggle", "showStars");
  document.getElementById("titlePosSelect").addEventListener("change", (e) => { editorState.titlePosition = e.target.value; renderPreview(); });
  document.getElementById("exportButton").addEventListener("click", () => {
    const size = EXPORT_SIZES.find((s) => s.id === els.size.value) || EXPORT_SIZES[0];
    const off = document.createElement("canvas");
    renderCoverToCanvas(off, size.w, size.h, snapshotState(true));
    const a = document.createElement("a"); a.download = "vice-panels-cover.png"; a.href = off.toDataURL("image/png"); a.click();
    els.status.textContent = "Exported " + size.w + " × " + size.h + " PNG.";
  });
  window.addEventListener("resize", renderPreview);

  window.vicePanels = {
    renderCover(canvas, w, h) { return renderCoverToCanvas(canvas, w, h, snapshotState(true)); },
    setLayout(name) { editorState.layoutName = name; els.layout.value = name; rebuildPanelStates(false); renderPreview(); },
    setGrade(name) { editorState.gradeName = name; els.grade.value = name; renderPreview(); },
    setTitle(a, b) { editorState.titleLine1 = a; editorState.titleLine2 = b; els.title1.value = a; els.title2.value = b; renderPreview(); },
    getState() { return JSON.parse(JSON.stringify({ ...editorState, photos: undefined, photoNames: editorState.photoNames })); },
  };

  (async () => {
    for (const s of SAMPLE_PHOTOS) {
      try { editorState.photos.push(await loadImageFromSrc(s.src)); editorState.photoNames.push(s.name); } catch (e) { /* sample missing */ }
      if (editorState.photos.length >= 2) break;
    }
    rebuildPanelStates(false); renderPreview();
    els.status.textContent = editorState.photos.length ? "Sample photos loaded — click a panel, drag to pan, export when ready." : "Add a photo to begin.";
  })();
  rebuildPanelStates(false); renderPreview();
  return { renderPreview };
}
