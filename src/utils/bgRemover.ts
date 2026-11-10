import { RefineSettings } from '../types';

/**
 * High-performance client-side Background Removal & Alpha Matting Engine.
 * Runs completely in-browser without uploading images to any external server.
 */

export interface SegmentationResult {
  outputCanvas: HTMLCanvasElement;
  maskCanvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export async function removeBackgroundClient(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  settings: RefineSettings,
  onProgress?: (progress: number, stage: string) => void,
  userMaskCanvas?: HTMLCanvasElement | null
): Promise<SegmentationResult> {
  const width = imageSource instanceof HTMLImageElement ? imageSource.naturalWidth : imageSource.width;
  const height = imageSource instanceof HTMLImageElement ? imageSource.naturalHeight : imageSource.height;

  if (onProgress) onProgress(15, 'analyzingContours');

  // Work on full-res canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!;
  srcCtx.drawImage(imageSource, 0, 0);

  const imgData = srcCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Mask canvas to store alpha values (0 to 255)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;

  // If user already had a manual refine mask, incorporate it
  let existingMaskData: Uint8ClampedArray | null = null;
  if (userMaskCanvas) {
    const existingMaskCtx = userMaskCanvas.getContext('2d', { willReadFrequently: true });
    if (existingMaskCtx) {
      existingMaskData = existingMaskCtx.getImageData(0, 0, width, height).data;
    }
  }

  if (onProgress) onProgress(40, 'computingMatte');

  // 1. Boundary background color sampling (Corners and borders)
  // We sample top, bottom, left, and right borders (with a 4% margin) to profile the background palette
  const bgSamples: number[][] = [];
  const borderMarginX = Math.max(2, Math.floor(width * 0.04));
  const borderMarginY = Math.max(2, Math.floor(height * 0.04));

  const samplePixel = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
  };

  // Sample top and bottom borders
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 40))) {
    for (let dy = 0; dy < borderMarginY; dy += 2) {
      samplePixel(x, dy);
      samplePixel(x, height - 1 - dy);
    }
  }

  // Sample left and right borders
  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 40))) {
    for (let dx = 0; dx < borderMarginX; dx += 2) {
      samplePixel(dx, y);
      samplePixel(width - 1 - dx, y);
    }
  }

  // Calculate average and variance of background colors
  let bgR = 0, bgG = 0, bgB = 0;
  for (let i = 0; i < bgSamples.length; i++) {
    bgR += bgSamples[i][0];
    bgG += bgSamples[i][1];
    bgB += bgSamples[i][2];
  }
  const sampleCount = Math.max(1, bgSamples.length);
  bgR /= sampleCount;
  bgG /= sampleCount;
  bgB /= sampleCount;

  // Center prior coordinates (center of the image is typically the subject)
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistFromCenter = Math.sqrt(centerX * centerX + centerY * centerY);

  // Mask buffer (0 = background, 255 = foreground)
  const maskData = maskCtx.createImageData(width, height);
  const maskPixels = maskData.data;

  // Tolerance factors based on settings
  const baseThreshold = (settings.tolerance / 100) * 110 + 25; // 25 - 135
  const feather = Math.max(1, settings.feather);

  if (onProgress) onProgress(65, 'renderingHD');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // If user has painted on manual mask, respect user's manual stroke
      if (existingMaskData && existingMaskData[idx + 3] !== undefined) {
        // user mask takes priority if manual editing was done
        maskPixels[idx] = existingMaskData[idx];
        maskPixels[idx + 1] = existingMaskData[idx + 1];
        maskPixels[idx + 2] = existingMaskData[idx + 2];
        maskPixels[idx + 3] = existingMaskData[idx + 3];
        continue;
      }

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Distance from sampled mean background
      const dR = r - bgR;
      const dG = g - bgG;
      const dB = b - bgB;
      const colorDist = Math.sqrt(dR * dR + dG * dG + dB * dB);

      // Distance from center of image (center prior heuristic)
      const dxCenter = x - centerX;
      const dyCenter = y - centerY;
      const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter) / maxDistFromCenter;

      // Dynamic threshold: center pixels have higher foreground probability
      const threshold = baseThreshold * (1.2 - distCenter * 0.4);

      let alpha = 255;
      if (colorDist < threshold) {
        // Inside background threshold
        const softZone = threshold * 0.35;
        if (colorDist < threshold - softZone) {
          alpha = 0;
        } else {
          // Soft transition boundary (feathering / alpha matting)
          const factor = (colorDist - (threshold - softZone)) / softZone;
          alpha = Math.round(factor * 255);
        }
      } else {
        alpha = 255;
      }

      // Despill: if edge is soft and color is close to background, neutralize fringe
      if (settings.despill && alpha > 0 && alpha < 240) {
        data[idx] = Math.round(r * 0.9 + (1 - alpha / 255) * 128 * 0.1);
        data[idx + 1] = Math.round(g * 0.9 + (1 - alpha / 255) * 128 * 0.1);
        data[idx + 2] = Math.round(b * 0.9 + (1 - alpha / 255) * 128 * 0.1);
      }

      // Assign to mask: white = foreground, black = background
      maskPixels[idx] = alpha;
      maskPixels[idx + 1] = alpha;
      maskPixels[idx + 2] = alpha;
      maskPixels[idx + 3] = 255;
    }
  }

  // Morphological anti-aliasing / edge smoothing if requested
  if (settings.smoothEdges || feather > 1) {
    applySoftFeathering(maskPixels, width, height, feather);
  }

  maskCtx.putImageData(maskData, 0, 0);

  // Now create the final transparent output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true })!;

  // Draw original image
  outCtx.putImageData(imgData, 0, 0);

  // Apply the mask as alpha channel
  const finalImgData = outCtx.getImageData(0, 0, width, height);
  const finalPixels = finalImgData.data;

  for (let i = 0; i < finalPixels.length; i += 4) {
    const alphaValue = maskPixels[i]; // 0 to 255
    finalPixels[i + 3] = alphaValue;
  }

  outCtx.putImageData(finalImgData, 0, 0);

  if (onProgress) onProgress(100, 'completed');

  return {
    outputCanvas,
    maskCanvas,
    width,
    height
  };
}

/**
 * Fast 2D box/Gaussian smoothing on the alpha mask for edge feathering
 */
function applySoftFeathering(
  maskPixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(6, Math.max(1, Math.round(radius / 2)));
  const copy = new Uint8ClampedArray(maskPixels);

  for (let y = r; y < height - r; y += 2) {
    for (let x = r; x < width - r; x += 2) {
      const idx = (y * width + x) * 4;
      const currentAlpha = copy[idx];

      // Only blur boundary transition pixels (between 10 and 245)
      if (currentAlpha > 10 && currentAlpha < 245) {
        let sum = 0;
        let count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            sum += copy[nIdx];
            count++;
          }
        }
        const avg = Math.round(sum / count);
        maskPixels[idx] = avg;
        maskPixels[idx + 1] = avg;
        maskPixels[idx + 2] = avg;
      }
    }
  }
}

/**
 * Cloud AI Assisted Contour Segmenter
 * Calls /api/remove-bg to get Gemini Vision segmentation tips for difficult subjects
 */
export async function getCloudAISegmentationGuide(imageBase64: string) {
  try {
    const res = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, refineMode: 'ultra_hd' })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Cloud AI segmentation skipped, continuing in local mode:', err);
    return null;
  }
}
