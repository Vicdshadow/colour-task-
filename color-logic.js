/**
 * HSL Color Utility and Harmony Generator
 */

export function generateRandomHSL() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50; // 50-100% saturation for "flashy" colors
  const l = Math.floor(Math.random() * 40) + 30; // 30-70% lightness
  return { h, s, l };
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hslToRgb(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  const toHex = (c) => c.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function getTextColor(h, s, l) {
  const bgRgb = hslToRgb(h, s, l);
  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 };

  const whiteContrast = getContrast(bgRgb, whiteRgb);
  const blackContrast = getContrast(bgRgb, blackRgb);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

function normalizeHue(h) {
  return ((h % 360) + 360) % 360;
}

export function generateHarmony(baseHSL, type) {
  const { h, s, l } = baseHSL;
  let hues = [];

  switch (type) {
    case "analogous":
      hues = [0, 30, 60, -30, -60];
      break;
    case "monochromatic":
      // Monochromatic varies L and S, keeping H constant.
      // We return 5 variations.
      return [
        { h, s, l },
        { h, s, l: Math.max(0, l - 20) },
        { h, s, l: Math.min(100, l + 20) },
        { h, s: Math.max(0, s - 30), l: Math.min(100, l + 40) },
        { h, s, l: Math.max(0, l - 40) },
      ];
    case "triadic":
      hues = [0, 120, 240, 120, 240]; // simplified to fill 5 slots, repeating some or variations
      // Better: Base, +120, +240, then slight variations of base
      return [
        { h, s, l },
        { h: normalizeHue(h + 120), s, l },
        { h: normalizeHue(h + 240), s, l },
        { h: normalizeHue(h + 120), s, l: Math.max(0, l - 20) }, // Shade of triadic
        { h: normalizeHue(h + 240), s, l: Math.min(100, l + 20) }, // Tint of triadic
      ];
    case "complementary":
      return [
        { h, s, l },
        { h: normalizeHue(h + 180), s, l },
        { h, s, l: Math.min(100, l + 20) },
        { h: normalizeHue(h + 180), s, l: Math.max(0, l - 20) },
        { h, s: Math.max(0, s - 20), l: 90 }, // Very light version
      ];
    case "split-complementary":
      return [
        { h, s, l },
        { h: normalizeHue(h + 150), s, l },
        { h: normalizeHue(h + 210), s, l },
        { h: normalizeHue(h + 150), s, l: Math.max(0, l - 20) },
        { h: normalizeHue(h + 210), s, l: Math.min(100, l + 20) },
      ];
    case "random":
    default:
      return Array(5)
        .fill(null)
        .map(() => generateRandomHSL());
  }

  // Default return for hue-based arrays (analogous)
  return hues.map((offset) => ({
    h: normalizeHue(h + offset),
    s,
    l,
  }));
}
