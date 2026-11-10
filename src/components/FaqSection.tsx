import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface FaqSectionProps {
  lang: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'Are my images stored or uploaded to third-party servers?',
      qBn: 'আমার ছবিগুলো কি সার্ভারে আপলোড বা সংরক্ষণ করা হয়?',
      aEn: 'No! By default, BG Remover Fast processes 100% of your images directly inside your browser using client-side WebAssembly and Canvas Alpha Matting algorithms. Your images never leave your computer or phone.',
      aBn: 'না! বিজি রিমুভার ফাস্ট আপনার ব্রাউজারের ভেতর সম্পূর্ণ ক্লায়েন্ট-সাইডে কাজ করে। কোনো ছবি বাইরের সার্ভারে আপলোড বা সেভ করা হয় না।'
    },
    {
      qEn: 'How does it compare to remove.bg and Photoroom?',
      qBn: 'রিমুভ.বিজি বা ফটো রুমের চেয়ে এর সুবিধা কী?',
      aEn: 'Unlike other tools that downscale your free downloads to 500px preview sizes, BG Remover Fast is 100% free with full original HD resolution exports, zero watermarks, manual erase/restore brushes, and batch processing with ZIP downloads.',
      aBn: 'অন্যান্য টুলে সাধারণত ফ্রি ডাউনলোডে ছোট রেজুলেশন দেওয়া হয়, কিন্তু বিজি রিমুভার ফাস্ট-এ আপনি মূল রেজুলেশনে কোনো ওয়াটারমার্ক ছাড়াই সম্পূর্ণ ফ্রিতে ফুল এইচডি ডাউনলোড করতে পারবেন।'
    },
    {
      qEn: 'Can I create standard Passport Photos with blue or white backgrounds?',
      qBn: 'পাসপোর্ট ছবির জন্য কি নীল বা সাদা ব্যাকগ্রাউন্ড দেওয়া সম্ভব?',
      aEn: 'Yes! Simply click the "Crop & Presets" tab and choose "Passport Photo". It automatically sets the standard 2x2" framing and lets you switch between official embassy white or passport blue in one click.',
      aBn: 'হ্যাঁ! "Crop & Presets" অপশন থেকে "Passport Photo" সিলেক্ট করলেই স্বয়ংক্রিয়ভাবে ২x২ ইঞ্চি ফ্রেম এবং ১ ক্লিকে নীল বা সাদা ব্যাকগ্রাউন্ড যুক্ত হয়ে যাবে।'
    },
    {
      qEn: 'What image formats and file sizes are supported?',
      qBn: 'কোন কোন ফরম্যাট এবং কত সাইজের ছবি সাপোর্ট করে?',
      aEn: 'We support JPG, JPEG, PNG, WebP, SVG, and modern HEIC formats up to 25 MB per image.',
      aBn: 'JPG, PNG, WebP, SVG এবং HEIC ফরম্যাটের ছবি সর্বোচ্চ ২৫ মেগাবাইট পর্যন্ত সাপোর্ট করে।'
    },
    {
      qEn: 'Is commercial use allowed for e-commerce and marketing?',
      qBn: 'ব্যবসা ও ই-কমার্সের জন্য কি এটি ব্যবহার করা যাবে?',
      aEn: 'Yes, 100%! All exported transparent cutouts created with our client-side engine belong entirely to you with zero royalty or commercial restrictions.',
      aBn: 'হ্যাঁ, সম্পূর্ণভাবে অনুমোদিত! আপনি আপনার যেকোনো বাণিজ্যিক পণ্য, বিজ্ঞাপন বা ই-কমার্স সাইটে নিশ্চিন্তে ব্যবহার করতে পারেন।'
    }
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {lang === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা ও উত্তর'}
          </h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {lang === 'en'
            ? 'Everything you need to know about image privacy, quality, and commercial rights'
            : 'প্রাইভেসি, রেজুলেশন ও বাণিজ্যিক ব্যবহার সম্পর্কিত তথ্যাবলী'}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-neutral-800 dark:text-neutral-200 hover:text-blue-600 transition-colors"
              >
                <span>{lang === 'en' ? faq.qEn : faq.qBn}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                  {lang === 'en' ? faq.aEn : faq.aBn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
