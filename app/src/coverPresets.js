// coverPresets.js — curated one-click looks pairing layouts with grades.
// Each preset is an original combination designed for a different mood.

export const COVER_PRESETS = [
  { id: "sunset-hero", label: "Sunset Hero", layoutName: "classic", gradeName: "viceSunset", badgeText: "NEW COVER", halftone: true, vignette: true, showStars: true },
  { id: "midnight-drive", label: "Midnight Drive", layoutName: "slash", gradeName: "midnightTeal", badgeText: "NIGHT RUN", halftone: false, vignette: true, showStars: true },
  { id: "neon-strip", label: "Neon Strip", layoutName: "strips", gradeName: "neonNights", badgeText: "TOP RATED", halftone: true, vignette: false, showStars: true },
  { id: "golden-quad", label: "Golden Quad", layoutName: "quad", gradeName: "goldenHour", badgeText: "GOLD EDITION", halftone: false, vignette: true, showStars: false },
];

export function getPreset(id) { return COVER_PRESETS.find((p) => p.id === id) || COVER_PRESETS[0]; }
export function listPresetLabels() { return COVER_PRESETS.map((p) => p.label); }
export function applyPresetToState(state, preset) {
  state.layoutName = preset.layoutName; state.gradeName = preset.gradeName;
  state.badgeText = preset.badgeText; state.halftone = preset.halftone;
  state.vignette = preset.vignette; state.showStars = preset.showStars;
  return state;
}
