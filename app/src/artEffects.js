// artEffects.js — finishing effects for Vice Panels covers.
// Deterministic pseudo-random grain (seeded, so exports are stable),
// a subtle print texture, and a chromatic edge fringe for neon energy.

export function createSeededRandom(seed) {
  let s = (seed >>> 0) || 123456789;
  return function nextRandom() {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function drawPrintGrain(ctx, w, h, amount) {
  const strength = amount == null ? 0.05 : amount;
  if (strength <= 0) return;
  const rand = createSeededRandom(987654321);
  const dots = Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < dots; i++) {
    const v = rand();
    ctx.fillStyle = v > 0.5 ? "rgba(255,255,255," + (strength * rand()).toFixed(3) + ")" : "rgba(0,0,0," + (strength * rand()).toFixed(3) + ")";
    ctx.fillRect(rand() * w, rand() * h, 1.4, 1.4);
  }
  ctx.restore();
}

export function drawSunburstRays(ctx, w, h, color) {
  const cx = w * 0.82, cy = h * 0.08;
  ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = color || "#ffe259";
  for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2, a2 = a1 + 0.16, r = Math.max(w, h);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawBottomBar(ctx, w, h, color) {
  ctx.save(); ctx.fillStyle = color || "#12081f"; ctx.globalAlpha = 0.92;
  ctx.fillRect(0, h * 0.965, w, h * 0.035); ctx.restore();
}

export function describeEffects(state) {
  const parts = [];
  if (state.halftone) parts.push("halftone dots");
  if (state.vignette) parts.push("vignette");
  if (state.showStars) parts.push("five-star row");
  parts.push("print grain");
  return parts.join(", ");
}
