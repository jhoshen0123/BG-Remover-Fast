import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  RotateCcw,
  Undo2,
  Redo2,
  Paintbrush,
  Eraser,
  Sliders,
  Sparkles,
  Layers,
  Crop,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  Image as ImageIcon,
  Check,
  Palette,
  Eye,
  RefreshCw,
  Sun
} from 'lucide-react';
import {
  Language,
  ImageProcessingState,
  RefineSettings,
  BackgroundSettings,
  ShadowSettings,
  BorderSettings,
  CropPreset,
  BrushMode
} from '../types';
import { translations } from '../i18n/translations';
import { renderCompositedCanvas, loadImage } from '../utils/canvasRenderer';
import { removeBackgroundClient } from '../utils/bgRemover';

interface StudioEditorProps {
  imageState: ImageProcessingState;
  onUpdateImageState: (updates: Partial<ImageProcessingState>) => void;
  onBackToUpload: () => void;
  lang: Language;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  imageState,
  onUpdateImageState,
  onBackToUpload,
  lang
}) => {
  const t = translations[lang];

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'refine' | 'brush' | 'background' | 'shadow' | 'crop'>('background');

  // Slider view vs Composited view
  const [viewMode, setViewMode] = useState<'split' | 'composite'>('composite');
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const isDraggingSlider = useRef(false);

  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Refinement settings
  const [refineSettings, setRefineSettings] = useState<RefineSettings>({
    tolerance: 50,
    feather: 3,
    smoothEdges: true,
    mattingRadius: 4,
    despill: true,
    contrast: 50
  });

  // Background settings
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'transparent',
    color: '#ffffff',
    gradient: 'studio',
    blurAmount: 18,
    customImage: null
  });

  // Shadow settings
  const [shadowSettings, setShadowSettings] = useState<ShadowSettings>({
    enabled: false,
    blur: 20,
    opacity: 35,
    offsetX: 0,
    offsetY: 12,
    color: '#000000',
    type: 'drop'
  });

  // Border / Sticker settings
  const [borderSettings, setBorderSettings] = useState<BorderSettings>({
    enabled: false,
    width: 6,
    color: '#ffffff'
  });

  // Crop preset
  const [cropPreset, setCropPreset] = useState<CropPreset>('original');

  // Brush settings
  const [brushMode, setBrushMode] = useState<BrushMode>('erase');
  const [brushSize, setBrushSize] = useState(24);
  const [brushSoftness, setBrushSoftness] = useState(15);
  const [brushHistory, setBrushHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isPainting = useRef(false);

  // Export format & quality
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState(95);
  const [isExporting, setIsExporting] = useState(false);

  // References
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Initial background removal trigger if not yet completed
  useEffect(() => {
    if (imageState.originalImage && !imageState.processedUrl && !imageState.isProcessing) {
      reprocessImage();
    }
  }, [imageState.originalImage]);

  // Function to run segmentation
  const reprocessImage = async () => {
    if (!imageState.originalImage) return;

    onUpdateImageState({ isProcessing: true, progress: 10, progressStage: 'analyzingContours' });

    try {
      const result = await removeBackgroundClient(
        imageState.originalImage,
        refineSettings,
        (progress, stage) => {
          onUpdateImageState({ progress, progressStage: stage });
        },
        imageState.maskCanvas
      );

      const processedUrl = result.outputCanvas.toDataURL('image/png');
      const processedImg = await loadImage(processedUrl);

      onUpdateImageState({
        processedUrl,
        processedImage: processedImg,
        maskCanvas: result.maskCanvas,
        isProcessing: false,
        progress: 100,
        progressStage: 'completed'
      });
    } catch (err) {
      console.error('Error during image processing:', err);
      onUpdateImageState({ isProcessing: false, progress: 0 });
    }
  };

  // 2. Render composited preview canvas whenever settings change
  const updateCompositedPreview = useCallback(async () => {
    if (!previewCanvasRef.current || !imageState.processedImage) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Source cutout canvas
    const cutoutCanvas = document.createElement('canvas');
    cutoutCanvas.width = imageState.processedImage.naturalWidth;
    cutoutCanvas.height = imageState.processedImage.naturalHeight;
    const cutoutCtx = cutoutCanvas.getContext('2d')!;
    cutoutCtx.drawImage(imageState.processedImage, 0, 0);

    const composited = await renderCompositedCanvas({
      cutoutCanvas,
      originalImage: imageState.originalImage,
      bgSettings,
      shadowSettings,
      borderSettings,
      cropPreset
    });

    canvas.width = composited.width;
    canvas.height = composited.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(composited, 0, 0);
  }, [
    imageState.processedImage,
    imageState.originalImage,
    bgSettings,
    shadowSettings,
    borderSettings,
    cropPreset
  ]);

  useEffect(() => {
    updateCompositedPreview();
  }, [updateCompositedPreview]);

  // 3. Handle Split-Screen Slider Dragging
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSlider.current = true;
    window.addEventListener('mousemove', handleSliderMouseMove);
    window.addEventListener('mouseup', handleSliderMouseUp);
  };

  const handleSliderMouseMove = (e: MouseEvent) => {
    if (!isDraggingSlider.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  const handleSliderMouseUp = () => {
    isDraggingSlider.current = false;
    window.removeEventListener('mousemove', handleSliderMouseMove);
    window.removeEventListener('mouseup', handleSliderMouseUp);
  };

  // 4. Manual Brush Canvas handlers (Erase / Restore)
  const startBrushPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'brush' || !brushCanvasRef.current || !imageState.maskCanvas) return;
    isPainting.current = true;

    // Save history state
    const maskCtx = imageState.maskCanvas.getContext('2d', { willReadFrequently: true });
    if (maskCtx) {
      const snap = maskCtx.getImageData(0, 0, imageState.maskCanvas.width, imageState.maskCanvas.height);
      const newHist = brushHistory.slice(0, historyIndex + 1);
      newHist.push(snap);
      setBrushHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }

    paintStroke(e);
  };

  const paintStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting.current || !brushCanvasRef.current || !imageState.maskCanvas) return;
    const canvas = brushCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = imageState.maskCanvas.width / rect.width;
    const scaleY = imageState.maskCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const maskCtx = imageState.maskCanvas.getContext('2d', { willReadFrequently: true })!;

    maskCtx.save();
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize * scaleX * 0.5, 0, Math.PI * 2);

    if (brushMode === 'erase') {
      // White mask = foreground, black mask = erased background
      maskCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    } else {
      maskCtx.fillStyle = 'rgba(255, 255, 255, 1)';
    }
    maskCtx.fill();
    maskCtx.restore();

    // Reapply mask to cutout canvas
    applyCurrentMaskToCutout();
  };

  const stopBrushPaint = () => {
    isPainting.current = false;
  };

  const applyCurrentMaskToCutout = async () => {
    if (!imageState.originalImage || !imageState.maskCanvas) return;

    const w = imageState.width;
    const h = imageState.height;

    const workCanvas = document.createElement('canvas');
    workCanvas.width = w;
    workCanvas.height = h;
    const workCtx = workCanvas.getContext('2d', { willReadFrequently: true })!;

    workCtx.drawImage(imageState.originalImage, 0, 0);
    const imgData = workCtx.getImageData(0, 0, w, h);

    const maskCtx = imageState.maskCanvas.getContext('2d', { willReadFrequently: true })!;
    const maskData = maskCtx.getImageData(0, 0, w, h).data;

    for (let i = 0; i < imgData.data.length; i += 4) {
      // mask red channel represents alpha
      imgData.data[i + 3] = maskData[i];
    }
    workCtx.putImageData(imgData, 0, 0);

    const newUrl = workCanvas.toDataURL('image/png');
    const newImg = await loadImage(newUrl);

    onUpdateImageState({
      processedUrl: newUrl,
      processedImage: newImg
    });
  };

  const handleUndo = () => {
    if (historyIndex <= 0 || !imageState.maskCanvas) return;
    const prevIndex = historyIndex - 1;
    const prevState = brushHistory[prevIndex];
    const maskCtx = imageState.maskCanvas.getContext('2d', { willReadFrequently: true })!;
    maskCtx.putImageData(prevState, 0, 0);
    setHistoryIndex(prevIndex);
    applyCurrentMaskToCutout();
  };

  const handleRedo = () => {
    if (historyIndex >= brushHistory.length - 1 || !imageState.maskCanvas) return;
    const nextIndex = historyIndex + 1;
    const nextState = brushHistory[nextIndex];
    const maskCtx = imageState.maskCanvas.getContext('2d', { willReadFrequently: true })!;
    maskCtx.putImageData(nextState, 0, 0);
    setHistoryIndex(nextIndex);
    applyCurrentMaskToCutout();
  };

  // 5. Download Export Handler
  const handleDownload = async () => {
    if (!imageState.processedImage) return;
    setIsExporting(true);

    try {
      const cutoutCanvas = document.createElement('canvas');
      cutoutCanvas.width = imageState.processedImage.naturalWidth;
      cutoutCanvas.height = imageState.processedImage.naturalHeight;
      const cutoutCtx = cutoutCanvas.getContext('2d')!;
      cutoutCtx.drawImage(imageState.processedImage, 0, 0);

      const finalCanvas = await renderCompositedCanvas({
        cutoutCanvas,
        originalImage: imageState.originalImage,
        bgSettings,
        shadowSettings,
        borderSettings,
        cropPreset
      });

      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
      const extension = exportFormat === 'jpg' ? 'jpg' : exportFormat === 'webp' ? 'webp' : 'png';
      const qualityRatio = exportQuality / 100;

      const dataUrl = finalCanvas.toDataURL(mimeType, qualityRatio);

      const link = document.createElement('a');
      const baseName = imageState.fileName.replace(/\.[^/.]+$/, '');
      link.download = `${baseName}_cutout.${extension}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Custom background image upload
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgSettings((prev) => ({
          ...prev,
          type: 'custom',
          customImage: event.target?.result as string
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden">
      
      {/* Central Viewport Workspace */}
      <div className="flex-1 flex flex-col bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
        
        {/* Workspace Top Toolbar */}
        <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs px-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToUpload}
              className="flex items-center gap-1 font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.newImage}</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">
              {imageState.width} × {imageState.height} px
            </span>
          </div>

          {/* Mode Switcher: Before/After vs Final Composited */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('composite')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'composite'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.removed}
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t.beforeAfter}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.2, +(z - 0.15).toFixed(2)))}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              title={t.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] w-12 text-center text-neutral-600 dark:text-neutral-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              title={t.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              title={t.zoomFit}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-transparency-grid select-none"
        >
          {imageState.isProcessing ? (
            /* Processing Skeleton Indicator */
            <div className="flex flex-col items-center justify-center gap-3 p-8 bg-white/90 dark:bg-neutral-900/90 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg backdrop-blur-sm max-w-sm w-full">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                {t.processing}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                {imageState.progressStage === 'analyzingContours'
                  ? t.analyzingContours
                  : imageState.progressStage === 'computingMatte'
                  ? t.computingMatte
                  : t.renderingHD}
              </p>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${imageState.progress}%` }}
                />
              </div>
            </div>
          ) : viewMode === 'split' && imageState.originalUrl && imageState.processedUrl ? (
            /* Interactive Before / After Split Slider */
            <div
              className="relative max-h-full max-w-full rounded-lg overflow-hidden shadow-md"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* After (Processed Cutout) Layer */}
              <canvas ref={previewCanvasRef} className="max-h-[70vh] max-w-full block" />

              {/* Before (Original Image) Layer with clipPath */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                }}
              >
                <img
                  src={imageState.originalUrl}
                  alt={t.original}
                  className="w-full h-full object-contain block"
                />
              </div>

              {/* Draggable Slider Bar & Handle */}
              <div
                onMouseDown={handleSliderMouseDown}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-neutral-800 shadow-md border border-neutral-300 flex items-center justify-center font-bold text-[10px]">
                  ↔
                </div>
              </div>

              {/* Before/After Labels */}
              <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white rounded text-[11px] font-medium backdrop-blur-xs pointer-events-none">
                {t.original}
              </span>
              <span className="absolute top-3 right-3 px-2 py-1 bg-blue-600/80 text-white rounded text-[11px] font-medium backdrop-blur-xs pointer-events-none">
                {t.removed}
              </span>
            </div>
          ) : (
            /* Standard Composited Canvas or Brush Canvas */
            <div
              className="relative max-h-full max-w-full rounded-lg overflow-hidden shadow-md"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <canvas ref={previewCanvasRef} className="max-h-[72vh] max-w-full block" />

              {/* Overlay brush painting layer when in Brush Mode */}
              {activeTab === 'brush' && (
                <canvas
                  ref={brushCanvasRef}
                  onMouseDown={startBrushPaint}
                  onMouseMove={paintStroke}
                  onMouseUp={stopBrushPaint}
                  onMouseLeave={stopBrushPaint}
                  className={`absolute inset-0 w-full h-full cursor-${brushMode === 'erase' ? 'crosshair' : 'cell'}`}
                />
              )}
            </div>
          )}
        </div>

        {/* Brush Floating Sub-toolbar when Brush Tab is Active */}
        {activeTab === 'brush' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl rounded-xl p-2.5 flex items-center gap-3 z-30 text-xs">
            <div className="flex items-center gap-1 border-r border-neutral-200 dark:border-neutral-800 pr-3">
              <button
                onClick={() => setBrushMode('erase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  brushMode === 'erase'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{t.erase}</span>
              </button>
              <button
                onClick={() => setBrushMode('restore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  brushMode === 'restore'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>{t.restore}</span>
              </button>
            </div>

            {/* Brush Size Slider */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[11px] font-medium">{t.brushSize}:</span>
              <input
                type="range"
                min="4"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(+e.target.value)}
                className="w-20 accent-blue-600"
              />
              <span className="font-mono text-[11px] w-6">{brushSize}px</span>
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                title={t.undo}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= brushHistory.length - 1}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                title={t.redo}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Control & Editing Panel */}
      <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 flex flex-col h-full border-t lg:border-t-0 overflow-y-auto">
        
        {/* Editor Category Tabs */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-3 pt-2 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'background'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.backgroundTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('brush')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'brush'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>{t.manualBrush}</span>
          </button>

          <button
            onClick={() => setActiveTab('shadow')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'shadow'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.effectsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('crop')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'crop'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>{t.cropTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('refine')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'refine'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.refineTab}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto text-xs">
          
          {/* TAB 1: BACKGROUND */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-2">
                  {t.backgroundTab}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBgSettings((s) => ({ ...s, type: 'transparent' }))}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      bgSettings.type === 'transparent'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-transparency-grid border border-neutral-300 dark:border-neutral-700 shrink-0" />
                    <span>{t.bgTransparent}</span>
                  </button>

                  <button
                    onClick={() => setBgSettings((s) => ({ ...s, type: 'color' }))}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      bgSettings.type === 'color'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded border border-neutral-300 shrink-0"
                      style={{ backgroundColor: bgSettings.color }}
                    />
                    <span>{t.bgColor}</span>
                  </button>

                  <button
                    onClick={() => setBgSettings((s) => ({ ...s, type: 'gradient' }))}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      bgSettings.type === 'gradient'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600 shrink-0" />
                    <span>{t.bgGradient}</span>
                  </button>

                  <button
                    onClick={() => setBgSettings((s) => ({ ...s, type: 'blur' }))}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      bgSettings.type === 'blur'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-neutral-300 dark:bg-neutral-700 blur-[1px] shrink-0" />
                    <span>{t.bgBlur}</span>
                  </button>
                </div>
              </div>

              {/* Solid Color Palette Presets */}
              {bgSettings.type === 'color' && (
                <div className="space-y-3 pt-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                    Color Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'White', hex: '#ffffff' },
                      { name: 'Off-White', hex: '#f8f9fa' },
                      { name: 'Passport Blue', hex: '#2563eb' },
                      { name: 'Studio Grey', hex: '#e2e8f0' },
                      { name: 'Deep Black', hex: '#0f172a' },
                      { name: 'Vibrant Yellow', hex: '#facc15' },
                      { name: 'Warm Peach', hex: '#fed7aa' },
                      { name: 'Emerald', hex: '#10b981' },
                      { name: 'Soft Lilac', hex: '#e9d5ff' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setBgSettings((s) => ({ ...s, color: c.hex }))}
                        className={`w-7 h-7 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs transition-transform ${
                          bgSettings.color.toLowerCase() === c.hex.toLowerCase()
                            ? 'scale-110 ring-2 ring-blue-500'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}

                    {/* Native Hex Color Picker Input */}
                    <label className="w-7 h-7 rounded-full border border-dashed border-neutral-400 flex items-center justify-center cursor-pointer hover:border-blue-500">
                      <input
                        type="color"
                        value={bgSettings.color}
                        onChange={(e) => setBgSettings((s) => ({ ...s, color: e.target.value }))}
                        className="opacity-0 w-0 h-0"
                      />
                      <Palette className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                    </label>
                  </div>
                </div>
              )}

              {/* Gradient Presets */}
              {bgSettings.type === 'gradient' && (
                <div className="space-y-3 pt-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                    Gradient Style:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'studio', label: 'Studio Light', preview: 'from-white to-slate-200' },
                      { id: 'sunset', label: 'Sunset Glow', preview: 'from-orange-500 to-purple-600' },
                      { id: 'ocean', label: 'Clean Ocean', preview: 'from-sky-500 to-blue-600' },
                      { id: 'dark_luxury', label: 'Dark Slate', preview: 'from-slate-800 to-slate-950' },
                      { id: 'pastel', label: 'Pastel Dream', preview: 'from-pink-200 to-purple-200' },
                      { id: 'mint', label: 'Fresh Mint', preview: 'from-emerald-200 to-teal-300' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setBgSettings((s) => ({ ...s, gradient: g.id }))}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 ${
                          bgSettings.gradient === g.id
                            ? 'border-blue-600 ring-1 ring-blue-500 font-semibold'
                            : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${g.preview} shrink-0`} />
                        <span className="text-[11px] truncate">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blur Intensity Slider */}
              {bgSettings.type === 'blur' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>{t.blurIntensity}</span>
                    <span className="font-mono">{bgSettings.blurAmount}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={bgSettings.blurAmount}
                    onChange={(e) => setBgSettings((s) => ({ ...s, blurAmount: +e.target.value }))}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}

              {/* Custom Image Upload */}
              <div className="pt-2">
                <label className="w-full py-2.5 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-blue-500 transition-colors font-medium text-neutral-700 dark:text-neutral-300">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>{t.uploadCustomBg}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL BRUSH */}
          {activeTab === 'brush' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl space-y-2 border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  {t.manualBrush}
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                  Paint directly on the image to erase stubborn background remnants or restore accidentally clipped details.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-medium">
                  <span>{t.brushSize}</span>
                  <span className="font-mono">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(+e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={reprocessImage}
                  className="flex-1 py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {t.resetMask}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SHADOWS & STICKER EFFECTS */}
          {activeTab === 'shadow' && (
            <div className="space-y-5">
              {/* Drop Shadow Switch */}
              <div className="space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 dark:text-white">
                    {t.dropShadow}
                  </label>
                  <input
                    type="checkbox"
                    checked={shadowSettings.enabled}
                    onChange={(e) =>
                      setShadowSettings((s) => ({ ...s, enabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>

                {shadowSettings.enabled && (
                  <div className="space-y-3 pt-2">
                    {/* Shadow Type: Drop vs 3D Ground Shadow */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShadowSettings((s) => ({ ...s, type: 'drop' }))}
                        className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center border ${
                          shadowSettings.type === 'drop'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {t.dropShadow}
                      </button>
                      <button
                        onClick={() => setShadowSettings((s) => ({ ...s, type: 'ground' }))}
                        className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center border ${
                          shadowSettings.type === 'ground'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {t.groundShadow}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{t.shadowOpacity}</span>
                        <span className="font-mono">{shadowSettings.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={shadowSettings.opacity}
                        onChange={(e) =>
                          setShadowSettings((s) => ({ ...s, opacity: +e.target.value }))
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{t.shadowBlur}</span>
                        <span className="font-mono">{shadowSettings.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={shadowSettings.blur}
                        onChange={(e) =>
                          setShadowSettings((s) => ({ ...s, blur: +e.target.value }))
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sticker Border Outline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 dark:text-white">
                    {t.stickerBorder}
                  </label>
                  <input
                    type="checkbox"
                    checked={borderSettings.enabled}
                    onChange={(e) =>
                      setBorderSettings((b) => ({ ...b, enabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>

                {borderSettings.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{t.borderWidth}</span>
                        <span className="font-mono">{borderSettings.width}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="24"
                        value={borderSettings.width}
                        onChange={(e) =>
                          setBorderSettings((b) => ({ ...b, width: +e.target.value }))
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.borderColor}:</span>
                      {['#ffffff', '#facc15', '#ef4444', '#000000', '#3b82f6'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBorderSettings((b) => ({ ...b, color }))}
                          className={`w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs ${
                            borderSettings.color === color ? 'ring-2 ring-blue-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CROP & PRESETS */}
          {activeTab === 'crop' && (
            <div className="space-y-3">
              <span className="font-bold text-neutral-900 dark:text-white block mb-1">
                {t.cropTab}
              </span>
              <p className="text-[11px] text-neutral-500 mb-2">
                Resize the canvas to common social, e-commerce, and passport standards without cropping your subject.
              </p>

              <div className="space-y-2">
                {[
                  { id: 'original', label: t.presets.original },
                  { id: '1:1', label: t.presets.square },
                  { id: '4:5', label: t.presets.portrait },
                  { id: '16:9', label: t.presets.landscape },
                  { id: '9:16', label: t.presets.story },
                  { id: 'passport', label: t.presets.passport },
                  { id: 'ecommerce', label: t.presets.ecommerce }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCropPreset(preset.id as CropPreset);
                      if (preset.id === 'passport') {
                        setBgSettings((s) => ({ ...s, type: 'color', color: '#2563eb' }));
                      } else if (preset.id === 'ecommerce') {
                        setBgSettings((s) => ({ ...s, type: 'color', color: '#ffffff' }));
                      }
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg border text-left font-medium flex items-center justify-between transition-colors ${
                      cropPreset === preset.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {cropPreset === preset.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FINE TUNING */}
          {activeTab === 'refine' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{t.tolerance}</span>
                  <span className="font-mono">{refineSettings.tolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={refineSettings.tolerance}
                  onChange={(e) =>
                    setRefineSettings((r) => ({ ...r, tolerance: +e.target.value }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{t.featherRadius}</span>
                  <span className="font-mono">{refineSettings.feather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={refineSettings.feather}
                  onChange={(e) => setRefineSettings((r) => ({ ...r, feather: +e.target.value }))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-medium">{t.despillColor}</span>
                <input
                  type="checkbox"
                  checked={refineSettings.despill}
                  onChange={(e) =>
                    setRefineSettings((r) => ({ ...r, despill: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">{t.smoothBorders}</span>
                <input
                  type="checkbox"
                  checked={refineSettings.smoothEdges}
                  onChange={(e) =>
                    setRefineSettings((r) => ({ ...r, smoothEdges: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <button
                onClick={reprocessImage}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-compute Matting</span>
              </button>
            </div>
          )}

        </div>

        {/* Bottom Download & Export Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            {/* Format Selector */}
            <div className="flex items-center gap-1">
              {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-2.5 py-1 uppercase rounded text-[11px] font-bold transition-colors ${
                    exportFormat === fmt
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Quality badge */}
            {exportFormat !== 'png' && (
              <span className="font-mono text-neutral-500 text-[11px]">
                {exportQuality}% quality
              </span>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting
                ? 'Exporting...'
                : exportFormat === 'png'
                ? t.downloadPng
                : exportFormat === 'jpg'
                ? t.downloadJpg
                : t.downloadWebp}
            </span>
          </button>
        </div>

      </div>

    </div>
  );
};
