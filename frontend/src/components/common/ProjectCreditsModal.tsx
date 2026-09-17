import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GraduationCap,
  Award,
  Scale,
  Code2,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ACADEMIC_PROJECT_INFO,
  LEGAL_TEAM_MEMBERS,
  DEVELOPER_TEAM_MEMBERS,
  TeamMember
} from '@/data/teamMembers';

interface ProjectCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'developer' | 'academic' | 'legal';
}

export const ProjectCreditsModal: React.FC<ProjectCreditsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'developer'
}) => {
  const [activeTab, setActiveTab] = useState<'developer' | 'academic' | 'legal'>(defaultTab);

  if (!isOpen) return null;

  const triggerCelebrate = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E50914', '#9D4EDD', '#FFFFFF', '#FFAA00']
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0D0D14] border border-white/10 shadow-2xl overflow-hidden z-10"
        >
          {/* Subtle Top Red Accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E50914]" />

          {/* Modal Header */}
          <div className="relative px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A24] border border-white/10 flex items-center justify-center text-[#E50914] shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    {ACADEMIC_PROJECT_INFO.university}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {ACADEMIC_PROJECT_INFO.batch}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-[11px] text-[#E50914] font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {ACADEMIC_PROJECT_INFO.competition}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mt-0.5 tracking-tight">
                  Project Creators & Team
                </h2>
                <p className="text-xs text-gray-400">
                  {ACADEMIC_PROJECT_INFO.college} • 12-Member Group Project
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerCelebrate}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                Celebrate 🎉
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/5 bg-[#09090E]">
            <button
              onClick={() => setActiveTab('developer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'developer'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Developer Team</span>
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI Competition Details</span>
            </button>

            <button
              onClick={() => setActiveTab('legal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'legal'
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Team</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[55vh] custom-scrollbar">
            {/* DEVELOPER TEAM TAB */}
            {activeTab === 'developer' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 pb-1 border-b border-white/5">
                  <span>12 Student Engineering Slots</span>
                  <span className="text-[11px] text-gray-500">Edit in frontend/src/data/teamMembers.ts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEVELOPER_TEAM_MEMBERS.map((member: TeamMember) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1F1E2A] text-gray-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {member.id.toString().padStart(2, '0')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-white truncate">
                            {member.name.replace(' (Add Student Name)', '')}
                          </p>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400 shrink-0">
                            {member.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI PROJECT COMPETITION & ACADEMIC TAB */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center gap-2.5 text-[#E50914]">
                    <Award className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-white">
                      {ACADEMIC_PROJECT_INFO.competition}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                      <span className="text-gray-500 text-[10px] uppercase font-bold">University</span>
                      <p className="text-white font-medium">{ACADEMIC_PROJECT_INFO.university}</p>
                      <p className="text-gray-400 text-[11px]">{ACADEMIC_PROJECT_INFO.college}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                      <span className="text-gray-500 text-[10px] uppercase font-bold">Batch & Cohort</span>
                      <p className="text-white font-medium">{ACADEMIC_PROJECT_INFO.batch}</p>
                      <p className="text-gray-400 text-[11px]">12-Member Group Project</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                      <span className="text-gray-500 text-[10px] uppercase font-bold">Project Title</span>
                      <p className="text-white font-medium">Zhoosh</p>
                      <p className="text-gray-400 text-[11px]">Unified AI Cinema & Music Platform</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                      <span className="text-gray-500 text-[10px] uppercase font-bold">Year</span>
                      <p className="text-white font-medium">{ACADEMIC_PROJECT_INFO.academicYear}</p>
                      <p className="text-gray-400 text-[11px]">Academic Capstone Entry</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed pt-1">
                    {ACADEMIC_PROJECT_INFO.guideNote}.
                  </p>
                </div>
              </div>
            )}

            {/* LEGAL TEAM TAB */}
            {activeTab === 'legal' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 pb-1 border-b border-white/5">
                  <span>12 Legal & Compliance Members</span>
                  <span className="text-[11px] text-gray-500">IP & Entertainment Law</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LEGAL_TEAM_MEMBERS.map((member: TeamMember) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1A1A24] text-gray-300 flex items-center justify-center text-xs font-bold shrink-0">
                        L{member.id.toString().padStart(2, '0')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-white truncate">
                            {member.name}
                          </p>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400 shrink-0">
                            {member.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-[#08080C] flex items-center justify-between text-xs text-gray-400">
            <span className="text-[11px] text-gray-500">
              Pillai University • Batch A2
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
