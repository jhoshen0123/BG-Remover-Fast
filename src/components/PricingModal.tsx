import React from 'react';
import { X, Check, ShieldCheck, Zap, Heart, Share2, Sparkles, Download, Layers } from 'lucide-react';
import { Language } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert(lang === 'en' ? 'Link copied! Share it with your friends.' : 'ওয়েবসাইটের লিঙ্ক কপি করা হয়েছে! সবার সাথে শেয়ার করুন।');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'en' ? '100% Free Forever' : 'সবার জন্য আজীবন সম্পূর্ণ ফ্রি'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            {lang === 'en' ? 'BG Remover Fast is 100% Free' : 'বিজি রিমুভার ফাস্ট সম্পূর্ণ ফ্রি'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
            {lang === 'en'
              ? 'No subscriptions, no credits, no paywalls, and no forced account creation. High-resolution AI background removal accessible to everyone.'
              : 'কোনো টাকা লাগবে না, কোনো ক্রেডিট কাটার ঝামেলা নেই। ছাত্র, ফ্রিল্যান্সার, ডিজাইনার এবং ই-কমার্স সেলারদের জন্য সম্পূর্ণ বিনামূল্যে উন্মুক্ত।'}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                {lang === 'en' ? 'Original Full HD Export' : 'ফুল এইচডি অরিজিনাল কোয়ালিটি'}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {lang === 'en'
                  ? 'Unlike other tools that force 500px downscaled previews, download at your full camera resolution with zero watermarks.'
                  : 'অন্যান্য সাইটের মতো ছোট সাইজ নয়, আপনার ক্যামেরার আসল রেজুলেশনে কোনো ওয়াটারমার্ক ছাড়া ডাউনলোড করুন।'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                {lang === 'en' ? 'Unlimited Batch Processing' : 'আনলিমিটেড ব্যাচ প্রসেসিং'}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {lang === 'en'
                  ? 'Upload multiple photos at once. Process in parallel and download all cutouts as a single ZIP file for free.'
                  : 'একসাথে একাধিক ছবি আপলোড করুন এবং এক ক্লিকে সব ZIP ফাইল হিসেবে ডাউনলোড করুন।'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                {lang === 'en' ? '100% Client-Side Privacy' : '১০০% প্রাইভেট ও নিরাপদ'}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {lang === 'en'
                  ? 'Your images never leave your computer or phone. Processed directly in your browser using WebAssembly.'
                  : 'আপনার ছবি আপনার ফোনেই প্রসেস হয়। কোনো সার্ভারে ছবি পাঠানো বা সেভ করা হয় না।'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                {lang === 'en' ? 'Passport & Product Presets' : 'পাসপোর্ট ও ই-কমার্স প্রিসেট'}
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {lang === 'en'
                  ? 'Passport photos with blue/white background, YouTube thumbnail stickers, and e-commerce studio white frames.'
                  : 'অফিসিয়াল পাসপোর্ট সাইজ ছবি, ইউটিউব স্টিকার বর্ডার এবং অনলাইন শপের প্রোডাক্ট ইমেজ তৈরি করুন সহজে।'}
              </p>
            </div>
          </div>

        </div>

        {/* Why is it free explanation card */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 mb-6 text-xs text-neutral-600 dark:text-neutral-300 space-y-2">
          <h4 className="font-bold text-neutral-900 dark:text-white text-xs">
            {lang === 'en' ? 'How is BG Remover Fast able to be 100% Free?' : 'এটি কীভাবে সম্পূর্ণ ফ্রি রাখা সম্ভব হচ্ছে?'}
          </h4>
          <p className="leading-relaxed">
            {lang === 'en'
              ? 'Traditional background remover services spend thousands of dollars hosting expensive GPU servers in the cloud, forcing them to charge subscriptions. BG Remover Fast runs modern computer vision algorithms directly on your device via HTML5 Canvas and WebAssembly. Since your device powers the computation, we have near-zero server overhead—allowing us to keep this tool 100% free for everyone forever!'
              : 'অন্যান্য কোম্পানি বড় ক্লাউড জিপিইউ সার্ভার ভাড়া করতে প্রচুর খরচ করে, তাই তারা টাকা দাবি করে। কিন্তু বিজি রিমুভার ফাস্ট আপনার ডিভাইসের প্রসেসর ও ব্রাউজারের শক্তি ব্যবহার করে কাজ করে। ফলে সার্ভারের খরচ না থাকায় আমরা এটি সবার জন্য চিরকাল বিনামূল্যে উন্মুক্ত রাখতে পারছি!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={copyShareLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Share Website With Friends' : 'বন্ধুদের সাথে শেয়ার করুন'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
          >
            {lang === 'en' ? 'Start Using For Free' : 'ফ্রিতে ব্যাকগ্রাউন্ড সরান'}
          </button>
        </div>

      </div>
    </div>
  );
};
