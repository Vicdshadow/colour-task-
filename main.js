/**
 * CSS Random Color Generator
 * Combined Logic for Simple Deployment
 */

// --- Color Utilities ---

function generateRandomHSL() {
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

function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  const toHex = (c) => c.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function hexToHsl(hex) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

function getTextColor(h, s, l) {
  const bgRgb = hslToRgb(h, s, l);
  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 }; // #000000

  const whiteContrast = getContrast(bgRgb, whiteRgb);
  const blackContrast = getContrast(bgRgb, blackRgb);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

function normalizeHue(h) {
  return ((h % 360) + 360) % 360;
}

function generateHarmony(baseHSL, type) {
  const { h, s, l } = baseHSL;
  let hues = [];

  switch (type) {
    case "analogous":
      hues = [0, 30, 60, -30, -60];
      break;
    case "monochromatic":
      return [
        { h, s, l },
        { h, s, l: Math.max(0, l - 20) },
        { h, s, l: Math.min(100, l + 20) },
        { h, s: Math.max(0, s - 30), l: Math.min(100, l + 40) },
        { h, s, l: Math.max(0, l - 40) },
      ];
    case "triadic":
      return [
        { h, s, l },
        { h: normalizeHue(h + 120), s, l },
        { h: normalizeHue(h + 240), s, l },
        { h: normalizeHue(h + 120), s, l: Math.max(0, l - 20) },
        { h: normalizeHue(h + 240), s, l: Math.min(100, l + 20) },
      ];
    case "complementary":
      return [
        { h, s, l },
        { h: normalizeHue(h + 180), s, l },
        { h, s, l: Math.min(100, l + 20) },
        { h: normalizeHue(h + 180), s, l: Math.max(0, l - 20) },
        { h, s: Math.max(0, s - 20), l: 90 },
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

  return hues.map((offset) => ({
    h: normalizeHue(h + offset),
    s,
    l,
  }));
}

function detectHarmony(hslParams) {
  // Sort by Hue to analyze intervals
  const colors = [...hslParams].sort((a, b) => a.h - b.h);
  const hues = colors.map((c) => c.h);

  // Check for Monochromatic (Hue spread very low)
  const hueRange = Math.max(...hues) - Math.min(...hues);
  if (hueRange <= 10) return "Monochromatic"; // Allow small drift

  // Helper: Check if all consecutive diffs match a target within tolerance
  const diffs = [];
  for (let i = 0; i < hues.length - 1; i++) {
    let diff = hues[i + 1] - hues[i];
    diffs.push(diff);
  }
  // Check wrap-around diff
  diffs.push(hues[0] + 360 - hues[hues.length - 1]);

  // Analogous: All colors within a small range (e.g. 90deg total)
  // Actually, analogous logic: often 30-40deg steps. 5 colors * 30 = 120deg max spread.
  // Let's stick to total range check for simplicity + circular check.
  // If largest gap is > 270 (meaning the rest are clustered within 90deg), it's Analogous.
  const maxGap = Math.max(...diffs);
  if (maxGap > 270) return "Analogous";

  // Complementary check (2 clusters, 180 apart)
  // Hard with 5 colors. Usually 2 main hues.
  // Let's implement a simplified "nearest standard harmony" check
  // by comparing current hues against generated harmonies from the first color.

  // Actually, simpler heuristic for 5 colors:
  // 1. Monochromatic: Hues very close.
  // 2. Analogous: All hues fit in 90deg arc.
  // 3. Otherwise: Check specific geometric patterns.

  return "Custom / Mixed";
}

// --- Main App Logic ---

class ChromaApp {
  constructor() {
    this.cols = 5;
    this.palette = [];
    this.lockedIds = new Set();
    this.container = document.getElementById("palette-container");
    this.harmonySelect = document.getElementById("harmony");

    this.init();
  }

  init() {
    this.generatePalette();

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.generatePalette();
      }
    });

    document.getElementById("generate-btn").addEventListener("click", () => {
      this.generatePalette();
    });

    this.harmonySelect.addEventListener("change", () => {
      this.generatePalette();
    });

    // Toast
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.id = "toast";
      document.body.appendChild(toast);
    }
  }

  generatePalette() {
    const harmonyType = this.harmonySelect.value;
    let newColors = [];

    if (harmonyType === "random") {
      newColors = Array(this.cols)
        .fill(null)
        .map(() => generateRandomHSL());
    } else {
      const base = generateRandomHSL();
      newColors = generateHarmony(base, harmonyType);
    }

    if (this.palette.length === 0) {
      this.palette = newColors.map((color, index) => ({
        color,
        id: index,
        locked: false,
      }));
    } else {
      this.palette = this.palette.map((col, index) => {
        if (this.lockedIds.has(index)) {
          return col;
        }
        return {
          ...col,
          color: newColors[index] || generateRandomHSL(),
        };
      });
    }

    this.render();
  }

  render() {
    this.container.innerHTML = "";

    this.palette.forEach((item, index) => {
      const { color } = item;
      const hex = hslToHex(color.h, color.s, color.l);
      const textColor = getTextColor(color.h, color.s, color.l);

      const colDiv = document.createElement("div");
      colDiv.className = "color-col";
      colDiv.style.backgroundColor = hex;
      colDiv.style.color = textColor;

      // Updated HTML structure for centered cards effect?
      // The user asked for containers in the middle, not full screen.
      // I will update CSS to handle this, but the structure remains similar.

      colDiv.innerHTML = `
                <div class="col-content">
                    <h2 class="hex-code" onclick="app.copyToClipboard('${hex}')">${hex}</h2>
                    <div class="toolbar">
                        <label class="tool-btn">
                            <i class="fa-solid fa-eye-dropper"></i>
                            <input type="color" class="color-input" value="${hex}" 
                                oninput="app.updateColor(${index}, this.value)" 
                                onclick="event.stopPropagation()">
                        </label>
                        <button class="tool-btn" onclick="app.toggleLock(${index})">
                            <i class="fa-solid ${
                              this.lockedIds.has(index)
                                ? "fa-lock"
                                : "fa-lock-open"
                            }"></i>
                        </button>
                        <button class="tool-btn" onclick="app.copyToClipboard('${hex}')">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;

      this.container.appendChild(colDiv);
    });

    this.updateHarmonyBadge();
  }

  updateColor(index, hex) {
    const hsl = hexToHsl(hex);
    this.palette[index] = {
      ...this.palette[index],
      color: hsl,
      locked: true, // Auto-lock manually picked colors? User might want that.
    };
    this.lockedIds.add(index); // Ensure it stays

    // Update local DOM to avoid full re-render flicker if desired, but render() is safe enough
    this.render();
  }

  updateHarmonyBadge() {
    const paletteHSL = this.palette.map((p) => p.color);
    const harmonyName = detectHarmony(paletteHSL);

    let badge = document.getElementById("harmony-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "harmony-badge";
      badge.className = "harmony-badge";
      // Insert after controls
      document.querySelector(".controls").appendChild(badge);
    }
    badge.innerText = `Detected: ${harmonyName}`;
  }

  toggleLock(index) {
    if (this.lockedIds.has(index)) {
      this.lockedIds.delete(index);
    } else {
      this.lockedIds.add(index);
    }
    this.render();
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Color ${text} copied!`);
    });
  }

  showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }
}

// Initialize
window.app = new ChromaApp();
