import React from 'react';
import { ShieldCheck, Lock, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#E8DFC8] dark:border-zinc-800 bg-[#F4EFEB] dark:bg-[#141416] py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Privacy Guarantee */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#2C2723] dark:text-zinc-200">
                100% Client-Side Privacy
              </h4>
              <p className="text-xs text-[#6E645B] dark:text-zinc-400 mt-1 leading-relaxed">
                Your baby’s photographs are stored exclusively in your local browser’s IndexedDB. No images are ever uploaded to cloud servers or third-party AI services.
              </p>
            </div>
          </div>

          {/* Authentic Photo Rule */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#2C2723] dark:text-zinc-200">
                True Milestone Preservation
              </h4>
              <p className="text-xs text-[#6E645B] dark:text-zinc-400 mt-1 leading-relaxed">
                We never distort, alter, or use AI to modify your baby’s facial features or body. Every layout uses your genuine original memories with non-destructive cropping.
              </p>
            </div>
          </div>

          {/* High-Resolution Output */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#2C2723] dark:text-zinc-200">
                Studio-Grade Print Quality
              </h4>
              <p className="text-xs text-[#6E645B] dark:text-zinc-400 mt-1 leading-relaxed">
                Direct canvas vector & raster rendering up to 300 DPI for crystal clear nursery wall prints, A4/A3 framing, and keepsake memory books.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E8DFC8]/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#82786F] dark:text-zinc-500 gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} BabyBloom — 30 Days of My Baby.</p>
            <span className="hidden sm:inline">•</span>
            <p>
              Developed by{' '}
              <a
                href="https://jhudel.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#80664C] dark:text-amber-400 hover:underline transition-colors"
              >
                jhudel
              </a>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Offline Capable
            </span>
            <span>•</span>
            <span>Local IndexedDB Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
