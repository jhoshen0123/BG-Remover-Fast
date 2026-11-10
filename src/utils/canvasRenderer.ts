import { BackgroundSettings, ShadowSettings, BorderSettings, CropPreset } from '../types';

export interface RenderCanvasOptions {
  cutoutCanvas: HTMLCanvasElement;
  originalImage: HTMLImageElement | null;
  bgSettings: BackgroundSettings;
  shadowSettings: ShadowSettings;
  borderSettings: BorderSettings;
  cropPreset: CropPreset;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Composites the transparent cutout with backgrounds, shadows, borders, and crop presets
 */
export async function renderCompositedCanvas(
  options: RenderCanvasOptions
): Promise<HTMLCanvasElement> {
  const {
    cutoutCanvas,
    originalImage,
    bgSettings,
    shadowSettings,
    borderSettings,
    cropPreset
  } = options;

  const srcW = cutoutCanvas.width;
  const srcH = cutoutCanvas.height;

  // 1. Calculate destination dimensions based on Crop Preset
  let outW = srcW;
  let outH = srcH;

  switch (cropPreset) {
    case '1:1': {
      const dim = Math.max(srcW, srcH);
      outW = dim;
      outH = dim;
      break;
    }
    case '4:5': {
      // Instagram portrait
      const targetRatio = 4 / 5;
      if (srcW / srcH > targetRatio) {
        outW = srcW;
        outH = Math.round(srcW / targetRatio);
      } else {
        outH = srcH;
        outW = Math.round(srcH * targetRatio);
      }
      break;
    }
    case '16:9': {
      // YouTube thumbnail
      const targetRatio = 16 / 9;
      if (srcW / srcH > targetRatio) {
        outW = srcW;
        outH = Math.round(srcW / targetRatio);
      } else {
        outH = srcH;
        outW = Math.round(srcH * targetRatio);
      }
      break;
    }
    case '9:16': {
      // TikTok / Story
      const targetRatio = 9 / 16;
      if (srcW / srcH > targetRatio) {
        outW = srcW;
        outH = Math.round(srcW / targetRatio);
      } else {
        outH = srcH;
        outW = Math.round(srcH * targetRatio);
      }
      break;
    }
    case 'passport': {
      // Standard 2x2 inch (1:1 ratio with head-and-shoulders margin)
      const dim = Math.round(Math.max(srcW, srcH) * 1.15);
      outW = dim;
      outH = dim;
      break;
    }
    case 'ecommerce': {
      // Centered white product frame with 15% clean padding
      const maxDim = Math.max(srcW, srcH);
      const padded = Math.round(maxDim * 1.25);
      outW = padded;
      outH = padded;
      break;
    }
    case 'original':
    default:
      outW = srcW;
      outH = srcH;
      break;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  // Foreground drawing position (centered within canvas)
  const drawX = Math.round((outW - srcW) / 2);
  const drawY = Math.round((outH - srcH) / 2);

  // 2. Render Background Layer
  if (bgSettings.type === 'color') {
    ctx.fillStyle = bgSettings.color;
    ctx.fillRect(0, 0, outW, outH);
  } else if (bgSettings.type === 'gradient') {
    const gradient = createGradient(ctx, outW, outH, bgSettings.gradient);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, outW, outH);
  } else if (bgSettings.type === 'blur' && originalImage) {
    ctx.save();
    ctx.filter = `blur(${bgSettings.blurAmount}px)`;
    // Scale slightly to prevent dark edges from blur
    ctx.drawImage(originalImage, -20, -20, outW + 40, outH + 40);
    ctx.restore();
  } else if (bgSettings.type === 'custom' && bgSettings.customImage) {
    const customImg = await loadImage(bgSettings.customImage);
    if (customImg) {
      // Cover fit
      drawCoverImage(ctx, customImg, outW, outH);
    }
  } else {
    // Transparent: keep clear
    ctx.clearRect(0, 0, outW, outH);
  }

  // 3. Render 3D Ground Shadow if selected
  if (shadowSettings.enabled && shadowSettings.type === 'ground') {
    ctx.save();
    const shadowH = Math.round(srcH * 0.12);
    const shadowW = Math.round(srcW * 0.8);
    const shadowX = drawX + Math.round((srcW - shadowW) / 2);
    const shadowY = drawY + srcH - Math.round(shadowH * 0.6);

    const grad = ctx.createRadialGradient(
      shadowX + shadowW / 2, shadowY + shadowH / 2, 5,
      shadowX + shadowW / 2, shadowY + shadowH / 2, shadowW / 2
    );
    const alpha = (shadowSettings.opacity / 100) * 0.6;
    grad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    grad.addColorStop(0.6, `rgba(0, 0, 0, ${alpha * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      shadowX + shadowW / 2,
      shadowY + shadowH / 2,
      shadowW / 2,
      shadowH / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // 4. Render Drop Shadow (Behind Cutout)
  if (shadowSettings.enabled && shadowSettings.type === 'drop') {
    ctx.save();
    ctx.shadowColor = hexToRgba(shadowSettings.color, shadowSettings.opacity / 100);
    ctx.shadowBlur = shadowSettings.blur;
    ctx.shadowOffsetX = shadowSettings.offsetX;
    ctx.shadowOffsetY = shadowSettings.offsetY;
    ctx.drawImage(cutoutCanvas, drawX, drawY);
    ctx.restore();
  }

  // 5. Render Sticker Border / Outline (if enabled)
  if (borderSettings.enabled && borderSettings.width > 0) {
    renderOutlineBorder(ctx, cutoutCanvas, drawX, drawY, borderSettings.width, borderSettings.color);
  }

  // 6. Draw Primary Cutout Subject
  ctx.drawImage(cutoutCanvas, drawX, drawY);

  return canvas;
}

/**
 * Creates gradient patterns
 */
function createGradient(ctx: CanvasRenderingContext2D, width: number, height: number, preset: string) {
  let grad = ctx.createLinearGradient(0, 0, width, height);

  switch (preset) {
    case 'sunset':
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#8b5cf6');
      break;
    case 'ocean':
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
      break;
    case 'studio':
      grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#e2e8f0');
      break;
    case 'dark_luxury':
      grad = ctx.createRadialGradient(width / 2, height / 2, 30, width / 2, height / 2, Math.max(width, height) / 1.4);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d16');
      break;
    case 'pastel':
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(0.5, '#fed7aa');
      grad.addColorStop(1, '#e9d5ff');
      break;
    case 'mint':
      grad.addColorStop(0, '#a7f3d0');
      grad.addColorStop(1, '#6ee7b7');
      break;
    default:
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(1, '#cbd5e1');
  }

  return grad;
}

/**
 * Renders sticker border around transparent cutout
 */
function renderOutlineBorder(
  ctx: CanvasRenderingContext2D,
  imageCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  strokeWidth: number,
  strokeColor: string
) {
  const steps = 16;
  ctx.save();

  // Create silhouette mask canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageCanvas.width;
  tempCanvas.height = imageCanvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;

  tempCtx.drawImage(imageCanvas, 0, 0);
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.fillStyle = strokeColor;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Stamp in a circle to create uniform stroke
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const dx = Math.cos(angle) * strokeWidth;
    const dy = Math.sin(angle) * strokeWidth;
    ctx.drawImage(tempCanvas, x + dx, y + dy);
  }

  ctx.restore();
}

/**
 * Helper to draw image using object-cover strategy
 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetW / targetH;

  let renderW = targetW;
  let renderH = targetH;
  let renderX = 0;
  let renderY = 0;

  if (imgRatio > targetRatio) {
    renderW = targetH * imgRatio;
    renderX = (targetW - renderW) / 2;
  } else {
    renderH = targetW / imgRatio;
    renderY = (targetH - renderH) / 2;
  }

  ctx.drawImage(img, renderX, renderY, renderW, renderH);
}

/**
 * Async image loader
 */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Converts Hex to RGBA string
 */
function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
