import React, { useState, useRef } from 'react';
import { Upload, Play, Download, Trash2, CheckCircle2, AlertCircle, RefreshCw, FileArchive, Layers } from 'lucide-react';
import { BatchItem, Language, RefineSettings } from '../types';
import { translations } from '../i18n/translations';
import { processBatchItems, exportBatchAsZip } from '../utils/batchProcessor';

interface BatchStudioProps {
  lang: Language;
}

export const BatchStudio: React.FC<BatchStudioProps> = ({ lang }) => {
  const t = translations[lang];
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultSettings: RefineSettings = {
    tolerance: 50,
    feather: 3,
    smoothEdges: true,
    mattingRadius: 4,
    despill: true,
    contrast: 50
  };

  const handleFiles = (files: FileList | File[]) => {
    const newItems: BatchItem[] = [];
    const maxFiles = 20;

    for (let i = 0; i < files.length && items.length + newItems.length < maxFiles; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: `batch_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          previewUrl,
          resultUrl: null,
          status: 'pending',
          progress: 0
        });
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const updateItem = (id: string, updates: Partial<BatchItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleStartBatch = async () => {
    if (isProcessing || items.length === 0) return;
    setIsProcessing(true);

    try {
      await processBatchItems(items, defaultSettings, updateItem);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await exportBatchAsZip(items);
    } finally {
      setIsZipping(false);
    }
  };

  const handleClear = () => {
    // Revoke object URLs
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const completedCount = items.filter((it) => it.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t.batchTitle}
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
            {t.batchSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleClear}
                disabled={isProcessing}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearQueue}</span>
              </button>

              <button
                onClick={handleStartBatch}
                disabled={isProcessing || items.every((i) => i.status === 'completed')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{t.processAll}</span>
              </button>
            </>
          )}

          {completedCount > 0 && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Archiving...' : t.downloadAllZip}</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/40 hover:border-neutral-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
          Upload up to 20 images for batch processing
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Drag & drop multiple files, or click to browse · All files process concurrently
        </p>
      </div>

      {/* Queue Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-xs">
          {t.queueEmpty}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              Queue: {items.length} images · {completedCount} completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs flex flex-col"
              >
                {/* Image Display */}
                <div className="aspect-square w-full relative bg-transparency-grid overflow-hidden">
                  <img
                    src={item.resultUrl || item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />

                  {/* Status Overlay */}
                  {item.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-3 text-white">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="text-xs font-mono font-medium">{item.progress}%</span>
                      <div className="w-3/4 bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-400 h-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <div className="absolute top-2 right-2 p-1 bg-emerald-600 text-white rounded-full shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Info & Individual Download */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {(item.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  {item.resultUrl && (
                    <a
                      href={item.resultUrl}
                      download={`${item.name.replace(/\.[^/.]+$/, '')}_cutout.png`}
                      className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 shrink-0"
                      title="Download individual PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
