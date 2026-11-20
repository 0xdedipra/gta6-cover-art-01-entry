// panelLayouts.js — multi-panel poster layouts for Vice Panels.
// Panels are polygons in relative coordinates (0..1). Slanted dividers
// give the collage its energy; the renderer scales them to any size.

export const PANEL_LAYOUTS = {
  classic: {
    label: "Classic Five",
    description: "One tall hero panel with stacked side panels",
    panels: [
      { id: "hero", points: [[0, 0], [0.58, 0], [0.52, 1], [0, 1]] },
      { id: "side-top", points: [[0.58, 0], [1, 0], [1, 0.34], [0.545, 0.34]] },
      { id: "side-mid", points: [[0.545, 0.34], [1, 0.34], [1, 0.67], [0.535, 0.67]] },
      { id: "side-low", points: [[0.535, 0.67], [1, 0.67], [1, 1], [0.52, 1]] },
      { id: "hero-foot", points: [[0, 0.78], [0.52, 0.78], [0.52, 1], [0, 1]], hidden: true },
    ],
  },
  slash: {
    label: "Diagonal Slash",
    description: "Bold diagonal cuts across the whole cover",
    panels: [
      { id: "slash-a", points: [[0, 0], [0.72, 0], [0.38, 1], [0, 1]] },
      { id: "slash-b", points: [[0.72, 0], [1, 0], [1, 0.52], [0.56, 0.52]] },
      { id: "slash-c", points: [[0.56, 0.52], [1, 0.52], [1, 1], [0.38, 1]] },
    ],
  },
  strips: {
    label: "Vertical Strips",
    description: "Five leaning vertical strips, poster-wall style",
    panels: [
      { id: "strip-1", points: [[0, 0], [0.22, 0], [0.18, 1], [0, 1]] },
      { id: "strip-2", points: [[0.22, 0], [0.42, 0], [0.38, 1], [0.18, 1]] },
      { id: "strip-3", points: [[0.42, 0], [0.62, 0], [0.58, 1], [0.38, 1]] },
      { id: "strip-4", points: [[0.62, 0], [0.82, 0], [0.78, 1], [0.58, 1]] },
      { id: "strip-5", points: [[0.82, 0], [1, 0], [1, 1], [0.78, 1]] },
    ],
  },
  quad: {
    label: "Quad Grid",
    description: "Four quadrants split by a slanted cross",
    panels: [
      { id: "quad-tl", points: [[0, 0], [0.54, 0], [0.48, 0.5], [0, 0.5]] },
      { id: "quad-tr", points: [[0.54, 0], [1, 0], [1, 0.5], [0.48, 0.5]] },
      { id: "quad-bl", points: [[0, 0.5], [0.48, 0.5], [0.52, 1], [0, 1]] },
      { id: "quad-br", points: [[0.48, 0.5], [1, 0.5], [1, 1], [0.52, 1]] },
    ],
  },
};

export function getLayoutNames() { return Object.keys(PANEL_LAYOUTS); }
export function getLayout(name) { return PANEL_LAYOUTS[name] || PANEL_LAYOUTS.classic; }
export function visiblePanels(layout) { return layout.panels.filter((p) => !p.hidden); }
export function panelBounds(panel) {
  const xs = panel.points.map((p) => p[0]); const ys = panel.points.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
export function pointInPanel(panel, nx, ny) {
  let inside = false; const pts = panel.points;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > ny) !== (yj > ny)) && nx < ((xj - xi) * (ny - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function findPanelAt(layout, nx, ny) {
  const vis = visiblePanels(layout);
  for (let i = vis.length - 1; i >= 0; i--) if (pointInPanel(vis[i], nx, ny)) return i;
  return -1;
}
