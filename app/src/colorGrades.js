// colorGrades.js — named cinematic colour grades for Vice Panels.
// Each grade combines a canvas filter string with layered gradient
// overlays drawn in specific composite modes.

export const COLOR_GRADES = {
  viceSunset: {
    label: "Vice Sunset",
    filter: "saturate(1.35) contrast(1.08) brightness(1.02)",
    overlays: [
      { mode: "overlay", alpha: 0.55, stops: [[0, "#ff2e88"], [0.5, "#ff7a18"], [1, "#1a2a6c"]] },
      { mode: "soft-light", alpha: 0.5, stops: [[0, "#ffd76a"], [1, "#7b2ff7"]] },
    ],
    border: "#ff2e88", glow: "#ff9a3d", titleTop: "#ffe259", titleBottom: "#ff2e88",
  },
  neonNights: {
    label: "Neon Nights",
    filter: "saturate(1.5) contrast(1.18) brightness(0.96)",
    overlays: [
      { mode: "overlay", alpha: 0.6, stops: [[0, "#00f5d4"], [0.55, "#4361ee"], [1, "#f72585"]] },
      { mode: "soft-light", alpha: 0.45, stops: [[0, "#0b0c2a"], [1, "#00bbf9"]] },
    ],
    border: "#00f5d4", glow: "#f72585", titleTop: "#a8fff3", titleBottom: "#00bbf9",
  },
  goldenHour: {
    label: "Golden Hour",
    filter: "saturate(1.2) contrast(1.05) brightness(1.08) sepia(0.22)",
    overlays: [
      { mode: "overlay", alpha: 0.45, stops: [[0, "#f7971e"], [0.6, "#ffd200"], [1, "#7a3b06"]] },
      { mode: "soft-light", alpha: 0.4, stops: [[0, "#fff3b0"], [1, "#e85d04"]] },
    ],
    border: "#ffd200", glow: "#f7971e", titleTop: "#fff3b0", titleBottom: "#ff7b00",
  },
  midnightTeal: {
    label: "Midnight Teal",
    filter: "saturate(1.15) contrast(1.22) brightness(0.9)",
    overlays: [
      { mode: "overlay", alpha: 0.55, stops: [[0, "#0f2027"], [0.5, "#203a43"], [1, "#2c5364"]] },
      { mode: "soft-light", alpha: 0.5, stops: [[0, "#64dfdf"], [1, "#080c2e"]] },
    ],
    border: "#64dfdf", glow: "#2c5364", titleTop: "#caf0f8", titleBottom: "#48cae4",
  },
};

export function getGradeNames() { return Object.keys(COLOR_GRADES); }
export function getGrade(name) { return COLOR_GRADES[name] || COLOR_GRADES.viceSunset; }

export function applyGradeOverlays(ctx, grade, w, h) {
  for (const ov of grade.overlays) {
    const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
    for (const [pos, col] of ov.stops) g.addColorStop(pos, col);
    ctx.save(); ctx.globalCompositeOperation = ov.mode; ctx.globalAlpha = ov.alpha;
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore();
  }
}
