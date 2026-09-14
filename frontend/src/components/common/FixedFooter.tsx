import React from 'react';
import { Globe, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const FixedFooter: React.FC = () => {
  const { mode, activeNav, setActiveNav, addToast } = useAppStore();

  const handleLinkClick = (title: string, desc: string) => {
    addToast({
      title,
      description: desc,
      type: 'info'
    });
  };

  return (
    <footer className="w-full bg-[#050508]/95 border-t border-white/10 text-gray-400 text-xs py-10 px-6 sm:px-12 select-none z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top line / Hotline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
          <p className="text-gray-300 font-medium">
            Questions? Contact 24/7 Concierge:{' '}
            <span
              onClick={() => handleLinkClick('VIP Support Hotline', 'Connecting to 24/7 concierge at 1-800-ZHOOSH')}
              className="text-white hover:underline cursor-pointer font-mono font-bold"
            >
              1-800-ZHOOSH
            </span>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ultra HD 4K & Hi-Fi Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E50914]" />
              Secure Streaming
            </span>
          </div>
        </div>

        {/* 4-column directory links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[12px] text-gray-400">
          <div className="space-y-2">
            <button
              onClick={() => setActiveNav('discover')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Home & Highlights
            </button>
            <button
              onClick={() => setActiveNav('likes')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              My Zhoosh Watchlist
            </button>
            <button
              onClick={() => handleLinkClick('Audio Description', 'Dolby Atmos & Spatial Audio calibrated for your device')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Audio & Subtitles
            </button>
            <button
              onClick={() => handleLinkClick('Media Center', 'Press, media kits, and trailer downloads')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Media Center
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleLinkClick('Help Center', 'Visit support.zhoosh.ai for guides or chat with Nova')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Help Center
            </button>
            <button
              onClick={() => handleLinkClick('Investor Relations', 'SEC Filings, earnings statements, and corporate reports')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Investor Relations
            </button>
            <button
              onClick={() => handleLinkClick('Jobs at Zhoosh', 'Explore open engineering, AI research, and studio roles')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Jobs
            </button>
            <button
              onClick={() => handleLinkClick('Cookie Preferences', 'Ad choices and essential telemetry configured')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Cookie Preferences
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleLinkClick('Supported Devices', 'Smart TVs, consoles, iOS, Android, and desktop')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Supported Devices
            </button>
            <button
              onClick={() => handleLinkClick('Terms of Use', 'Standard streaming license and member agreements')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Terms of Use
            </button>
            <button
              onClick={() => handleLinkClick('Privacy Policy', 'Zero third-party tracking, localized recommender storage')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleLinkClick('Corporate Information', 'Zhoosh Entertainment Inc. Delaware registered')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Corporate Information
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleLinkClick('Speed Test', 'Optimal 4K HDR stream rate: 38 Mbps verified')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Speed Test
            </button>
            <button
              onClick={() => handleLinkClick('Legal Notices', 'DMCA compliance, trademark patents, and licensing')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Legal Notices
            </button>
            <button
              onClick={() => handleLinkClick('Only on Zhoosh', 'Exclusive cinematic originals and Hi-Fi master tracks')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              Only on Zhoosh
            </button>
            <button
              onClick={() => handleLinkClick('AI Recommender', 'Custom collaborative-filtering neural engine active')}
              className="block hover:text-white hover:underline transition-colors text-left"
            >
              AI Recommendation Engine
            </button>
          </div>
        </div>

        {/* Bottom copyright & language button */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleLinkClick('Language Selector', 'Currently selected: English (US)')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/60 border border-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#E50914]" />
              <span>English (US)</span>
            </button>
            <span>• Service Code: 894-320</span>
          </div>

          <p className="text-gray-500">
            © 2026 Zhoosh Entertainment, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
