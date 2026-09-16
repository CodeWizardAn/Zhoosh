import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const FixedFooter: React.FC = () => {
  const { setActiveNav, setMode } = useAppStore();

  return (
    <footer className="w-full bg-[#050508]/80 border-t border-white/5 text-gray-500 text-xs py-8 px-6 sm:px-12 select-none z-20">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Minimalist Brand & Navigation */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-gray-400 font-medium">
          <span className="text-[#E50914] font-black tracking-wider text-sm">ZHOOSH</span>
          <button
            onClick={() => setActiveNav('discover')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => setActiveNav('likes')}
            className="hover:text-white transition-colors"
          >
            My Zhoosh
          </button>
          <button
            onClick={() => setMode('movies')}
            className="hover:text-white transition-colors"
          >
            Movies
          </button>
          <button
            onClick={() => setMode('music')}
            className="hover:text-white transition-colors"
          >
            Music
          </button>
        </div>

        {/* Minimalist Copyright */}
        <p className="text-[11px] text-gray-600 text-center sm:text-right">
          © {new Date().getFullYear()} Zhoosh. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
