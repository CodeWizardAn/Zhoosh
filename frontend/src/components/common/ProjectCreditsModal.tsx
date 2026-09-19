import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ACADEMIC_PROJECT_INFO,
  DEVELOPER_TEAM_MEMBERS,
  TeamMember
} from '@/data/teamMembers';

interface ProjectCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export const ProjectCreditsModal: React.FC<ProjectCreditsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const triggerCelebrate = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#E50914', '#FFAA00', '#FFFFFF', '#9D4EDD', '#8B0000']
    });
  };

  // Helper to extract clean initials (e.g. "Advaith Nair" -> "AN")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Deep Backdrop with subtle blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#0B0B13] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(229,9,20,0.15)] overflow-hidden z-10"
        >
          {/* Top Gradient Glow Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B0000] via-[#E50914] to-[#FFAA00]" />

          {/* Ambient Background Radial Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E50914]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#9D4EDD]/10 blur-3xl pointer-events-none" />

          {/* Modal Header with College Logo at Top Left */}
          <div className="relative px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4 bg-gradient-to-b from-white/[0.04] to-transparent">
            <div className="flex items-center gap-4 min-w-0">
              {/* College Logo in Crisp Premium Shield Card at Top Left */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#E50914] opacity-40 blur-sm group-hover:opacity-75 transition duration-300" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-2xl border border-white/30 flex items-center justify-center overflow-hidden">
                  <img
                    src="/pillai_logo.png"
                    alt="Pillai University Logo"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Institution & Batch Information */}
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Pillai University
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#E50914] tracking-wide mt-0.5">
                  Batch A2
                </p>
              </div>
            </div>

            {/* Action Buttons: Celebrate & Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerCelebrate}
                title="Celebrate"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E50914]/20 to-[#FFAA00]/20 hover:from-[#E50914]/30 hover:to-[#FFAA00]/30 text-white text-xs font-semibold border border-[#E50914]/30 hover:border-[#E50914]/50 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
                <span className="hidden sm:inline">Celebrate</span> 🎉
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center border border-white/10 hover:border-white/25 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Developer Names List (All 11 names in identical attractive cards, names only, no tags) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 max-h-[62vh] custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEVELOPER_TEAM_MEMBERS.map((member: TeamMember, idx: number) => {
                const memberNumber = idx + 1;
                return (
                  <div
                    key={member.id}
                    className="group relative flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.035] hover:bg-white/[0.075] border border-white/[0.08] hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50"
                  >
                    {/* Number Badge */}
                    <div className="w-8 h-8 rounded-lg bg-[#181824] text-gray-300 group-hover:text-white group-hover:bg-[#222232] flex items-center justify-center text-xs font-mono font-bold shrink-0 border border-white/10 transition-colors">
                      {String(memberNumber).padStart(2, '0')}
                    </div>

                    {/* Initials Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-300 tracking-wider shrink-0">
                      {getInitials(member.name)}
                    </div>

                    {/* Name Only (Strictly equal styling and no tags/roles) */}
                    <p className="text-sm sm:text-[15px] font-semibold text-white tracking-wide truncate group-hover:text-red-200 transition-colors">
                      {member.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#07070B] flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] text-gray-400 font-medium">
                11 Developers • {ACADEMIC_PROJECT_INFO.batch}
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
