import JSZip from 'jszip';
import { BatchItem, RefineSettings } from '../types';
import { removeBackgroundClient } from './bgRemover';
import { loadImage } from './canvasRenderer';

/**
 * Process a list of batch items sequentially or with concurrency
 */
export async function processBatchItems(
  items: BatchItem[],
  settings: RefineSettings,
  onItemUpdate: (id: string, updates: Partial<BatchItem>) => void
): Promise<void> {
  for (const item of items) {
    if (item.status === 'completed') continue;

    onItemUpdate(item.id, { status: 'processing', progress: 10 });

    try {
      const img = await loadImage(item.previewUrl);
      if (!img) {
        throw new Error('Could not decode image file');
      }

      onItemUpdate(item.id, { progress: 40 });

      const result = await removeBackgroundClient(img, settings, (p) => {
        onItemUpdate(item.id, { progress: Math.max(10, Math.min(95, p)) });
      });

      const resultUrl = result.outputCanvas.toDataURL('image/png');
      onItemUpdate(item.id, {
        status: 'completed',
        progress: 100,
        resultUrl,
        processedAt: Date.now()
      });
    } catch (err: any) {
      console.error(`Error processing batch item ${item.name}:`, err);
      onItemUpdate(item.id, {
        status: 'error',
        progress: 100,
        error: err.message || 'Processing failed'
      });
    }
  }
}

/**
 * Packs all completed transparent PNGs into a ZIP archive and triggers download
 */
export async function exportBatchAsZip(items: BatchItem[], zipFileName = 'BG_Remover_Fast_Cutouts.zip'): Promise<void> {
  const completedItems = items.filter((item) => item.status === 'completed' && item.resultUrl);
  if (completedItems.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('cutouts') || zip;

  for (let i = 0; i < completedItems.length; i++) {
    const item = completedItems[i];
    const base64Data = item.resultUrl!.replace(/^data:image\/png;base64,/, '');
    const cleanName = item.name.replace(/\.[^/.]+$/, '') + '_transparent.png';
    folder.file(cleanName, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
