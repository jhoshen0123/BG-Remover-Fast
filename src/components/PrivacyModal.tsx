import React from 'react';
import { X, ShieldCheck, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-w-xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              {lang === 'en' ? 'Privacy Policy & Model Licenses' : 'প্রাইভেসি পলিসি ও লাইসেন্স বিবরণী'}
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Transparent breakdown of our client-side architecture, data protection standards, and open source AI licenses.
          </p>
        </div>

        <div className="space-y-5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>100% Zero-Storage Architecture</span>
            </div>
            <p>
              When you use BG Remover Fast with the default Fast Engine, your images are processed locally within your web browser using HTML5 Canvas, WebGL, and WebAssembly. No pixel data is transmitted to or logged on any external server.
            </p>
            <p>
              If you opt into Cloud AI Deep Refine, your image is streamed in ephemeral RAM to compute subject contours and immediately discarded without writing to disk.
            </p>
          </div>

          {/* Section 2: AI Model Licenses */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Model & Commercial Licensing Notice</span>
            </div>
            <p>
              In compliance with open-source machine learning guidelines:
            </p>
            <ul className="space-y-1.5 pl-3 border-l-2 border-neutral-300 dark:border-neutral-700">
              <li>
                <strong>Client-Side Matting & WASM Engine:</strong> Released under the permissive <strong>MIT / Apache 2.0</strong> open license. 100% free for commercial use.
              </li>
              <li>
                <strong>RMBG / BiRefNet / MODNet Comparison:</strong> BRIA RMBG is non-commercial without a paid enterprise license, whereas U2Net & MODNet are open Apache 2.0 / MIT models. BG Remover Fast uses permissive algorithms ensuring your commercial safety.
              </li>
              <li>
                <strong>Your Exported Assets:</strong> You own 100% of the copyright for images and artwork processed through BG Remover Fast.
              </li>
            </ul>
          </div>

          {/* Section 3: Terms of Service */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-neutral-900 dark:text-white">Terms of Service Summary</h4>
            <p>
              You agree not to process illegal or harmful imagery. BG Remover Fast provides this free service as-is with high availability guarantees.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
