import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroUploader } from './components/HeroUploader';
import { StudioEditor } from './components/StudioEditor';
import { BatchStudio } from './components/BatchStudio';
import { FaqSection } from './components/FaqSection';
import { PricingModal } from './components/PricingModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Footer } from './components/Footer';
import { Language, TabType, ImageProcessingState } from './types';
import { loadImage } from './utils/canvasRenderer';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('studio');
  const [engineMode, setEngineMode] = useState<'local' | 'cloud'>('local');

  // Modals
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Active single-image studio state
  const [imageState, setImageState] = useState<ImageProcessingState>({
    originalUrl: '',
    originalImage: null,
    processedUrl: null,
    processedImage: null,
    maskCanvas: null,
    isProcessing: false,
    progress: 0,
    progressStage: '',
    width: 0,
    height: 0,
    fileSize: 0,
    fileName: '',
    fileType: ''
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleThemeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'pricing') {
      setIsPricingOpen(true);
    } else if (tab === 'privacy') {
      setIsPrivacyOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  // Image upload handler
  const handleFileSelect = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const img = await loadImage(objectUrl);

    if (!img) {
      alert('Unable to load image. Please verify file format.');
      return;
    }

    setImageState({
      originalUrl: objectUrl,
      originalImage: img,
      processedUrl: null,
      processedImage: null,
      maskCanvas: null,
      isProcessing: false,
      progress: 0,
      progressStage: '',
      width: img.naturalWidth,
      height: img.naturalHeight,
      fileSize: file.size,
      fileName: file.name,
      fileType: file.type
    });

    setCurrentTab('studio');
  };

  const handleUrlSelect = async (url: string) => {
    try {
      const img = await loadImage(url);
      if (!img) throw new Error('Could not decode image from URL');

      setImageState({
        originalUrl: url,
        originalImage: img,
        processedUrl: null,
        processedImage: null,
        maskCanvas: null,
        isProcessing: false,
        progress: 0,
        progressStage: '',
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileSize: 1024 * 500,
        fileName: 'url_image.jpg',
        fileType: 'image/jpeg'
      });

      setCurrentTab('studio');
    } catch (e: any) {
      alert(e.message || 'Error loading image from URL');
    }
  };

  const handleUpdateImageState = (updates: Partial<ImageProcessingState>) => {
    setImageState((prev) => ({ ...prev, ...updates }));
  };

  const handleBackToUpload = () => {
    if (imageState.originalUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.originalUrl);
    }
    setImageState({
      originalUrl: '',
      originalImage: null,
      processedUrl: null,
      processedImage: null,
      maskCanvas: null,
      isProcessing: false,
      progress: 0,
      progressStage: '',
      width: 0,
      height: 0,
      fileSize: 0,
      fileName: '',
      fileType: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lang={lang}
        onLangToggle={handleLangToggle}
        darkMode={darkMode}
        onThemeToggle={handleThemeToggle}
        onOpenUpload={handleBackToUpload}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'batch' ? (
          <BatchStudio lang={lang} />
        ) : imageState.originalImage ? (
          <StudioEditor
            imageState={imageState}
            onUpdateImageState={handleUpdateImageState}
            onBackToUpload={handleBackToUpload}
            lang={lang}
          />
        ) : (
          <div>
            <HeroUploader
              onFileSelect={handleFileSelect}
              onUrlSelect={handleUrlSelect}
              lang={lang}
              engineMode={engineMode}
              onEngineChange={setEngineMode}
            />
            <FaqSection lang={lang} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} onOpenTab={handleTabChange} />

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        lang={lang}
      />


      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        lang={lang}
      />

    </div>
  );
}
