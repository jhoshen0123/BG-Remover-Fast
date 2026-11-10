import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

// Generated authentic high-res samples
import samplePortrait from '../assets/images/sample_portrait_woman_1794314611583.jpg';
import sampleProduct from '../assets/images/sample_product_sneaker_1794314612540.jpg';
import samplePet from '../assets/images/sample_pet_dog_1794314611872.jpg';
import sampleFashion from '../assets/images/sample_fashion_model_1794314613706.jpg';

interface HeroUploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSelect: (url: string) => void;
  lang: Language;
  engineMode: 'local' | 'cloud';
  onEngineChange: (mode: 'local' | 'cloud') => void;
}

export const HeroUploader: React.FC<HeroUploaderProps> = ({
  onFileSelect,
  onUrlSelect,
  lang,
  engineMode,
  onEngineChange
}) => {
  const t = translations[lang];
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+V / Paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setUrlLoading(true);
    setUrlError(null);

    try {
      // Use proxy to avoid CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(urlInput.trim())}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Could not fetch image from URL');

      const blob = await res.blob();
      const file = new File([blob], 'url_image.jpg', { type: blob.type || 'image/jpeg' });
      onFileSelect(file);
    } catch (err: any) {
      setUrlError(err.message || 'Error loading image from URL');
    } finally {
      setUrlLoading(false);
    }
  };

  const loadSample = async (imageSrc: string, name: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
      onFileSelect(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  return (
    <section className="relative pt-8 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Hero Headline & Value Proposition */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight mb-4">
          {t.tagline}
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          {t.subtagline}
        </p>

        {/* Engine mode selector tabs */}
        <div className="inline-flex items-center gap-1 p-1 mt-6 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onEngineChange('local')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              engineMode === 'local'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.clientFastMode}</span>
          </button>
          <button
            type="button"
            onClick={() => onEngineChange('cloud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              engineMode === 'cloud'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.cloudAiRefine}</span>
          </button>
        </div>
      </div>

      {/* Primary Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/heic"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900/50">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1.5">
          {t.dropzoneTitle}
        </h3>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
          {t.dropzoneSubtitle}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {t.dropzoneHint}
        </p>

        {/* Keyboard shortcut hint */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs font-mono text-neutral-600 dark:text-neutral-300">
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded shadow-xs text-[11px]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded shadow-xs text-[11px]">
            V
          </kbd>
          <span className="font-sans text-xs ml-1">{t.pasteHint}</span>
        </div>
      </div>

      {/* URL Fetch Form */}
      <form onSubmit={handleFetchUrl} className="mt-4 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t.urlInputPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={urlLoading || !urlInput.trim()}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 transition-colors shrink-0"
        >
          {urlLoading ? 'Fetching...' : t.loadUrlBtn}
        </button>
      </form>
      {urlError && (
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 text-center font-medium">
          {urlError}
        </p>
      )}

      {/* Sample Images Gallery for 1-Click Testing */}
      <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center mb-4">
          {t.trySamples}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Sample 1: Portrait */}
          <button
            type="button"
            onClick={() => loadSample(samplePortrait, 'portrait_sample')}
            className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left p-2 shadow-xs"
          >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2">
              <img
                src={samplePortrait}
                alt={t.portraitSample}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {t.portraitSample}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">Portrait · Hair edges</div>
          </button>

          {/* Sample 2: Sneaker Product */}
          <button
            type="button"
            onClick={() => loadSample(sampleProduct, 'sneaker_product')}
            className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left p-2 shadow-xs"
          >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2">
              <img
                src={sampleProduct}
                alt={t.productSample}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {t.productSample}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">E-Commerce · Crisp</div>
          </button>

          {/* Sample 3: Pet Puppy Fur */}
          <button
            type="button"
            onClick={() => loadSample(samplePet, 'puppy_fur')}
            className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left p-2 shadow-xs"
          >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2">
              <img
                src={samplePet}
                alt={t.petSample}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {t.petSample}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">Animal · Soft Fur</div>
          </button>

          {/* Sample 4: Fashion Model */}
          <button
            type="button"
            onClick={() => loadSample(sampleFashion, 'fashion_model')}
            className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left p-2 shadow-xs"
          >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2">
              <img
                src={sampleFashion}
                alt={t.fashionSample}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {t.fashionSample}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">Fashion · Full Body</div>
          </button>
        </div>
      </div>

      {/* Privacy guarantee bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>100% Client-Side Private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Instant HD Processing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-blue-500" />
          <span>No Sign-up Required</span>
        </div>
      </div>
    </section>
  );
};
