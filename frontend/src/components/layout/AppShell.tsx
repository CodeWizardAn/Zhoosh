import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { TopBar } from './TopBar';
import { TopProgress } from '../common/TopProgress';
import { PlayerBar } from '../player/PlayerBar';
import { VoiceSearchBar } from '../voice/VoiceSearchBar';
import { PlaylistPopover } from '../playlist/PlaylistPopover';
import { AuthModal } from '../auth/AuthModal';
import { ToastContainer } from '../common/Toast';
import { MoviesView } from '../movies/MoviesView';
import { MusicView } from '../music/MusicView';
import { PlaylistPage } from '../playlist/PlaylistPage';
import { RecommendationsView } from '../recommendations/RecommendationsView';
import { LikesView } from '../likes/LikesView';
import { SearchResultsView } from '../search/SearchResultsView';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { FadedGridBackdrop } from '../common/FadedGridBackdrop';

export const AppShell: React.FC = () => {
  const { mode, activeNav, isOnboardingOpen, closeOnboarding, setUser, addToast } = useAppStore();
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');

  const renderActiveView = () => {
    if (searchQuery.trim().length > 0) {
      return <SearchResultsView key="search" query={searchQuery} />;
    }

    switch (activeNav) {
      case 'agent-ai':
        return <RecommendationsView key="recommendations" />;
      case 'playlists':
        return <PlaylistPage key="playlists" />;
      case 'likes':
        return <LikesView key="likes" />;
      case 'trending':
      case 'discover':
      default:
        return mode === 'movies' ? (
          <MoviesView key="movies-view" />
        ) : (
          <MusicView key="music-view" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col relative overflow-x-hidden font-sans">
      {/* 1. Global Faded Grid Background matching the Black-Red-Purple theme */}
      <FadedGridBackdrop intensity="medium" showPosters={true} />

      {/* Top background query progress line */}
      <TopProgress />

      {/* 2. Fixed Full-Width Top Navigation Bar (No Sidebar) */}
      <TopBar onSearchChange={setSearchQuery} searchValue={searchQuery} />

      {/* 3. Main Full-Width Streaming Experience */}
      <div className="flex-1 w-full pt-16 flex flex-col z-10">
        <main className="flex-1 min-h-[calc(100vh-64px)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${activeNav}-${searchQuery ? 'searching' : 'content'}`}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Player for Audio */}
      <PlayerBar />

      {/* Overlays & Modals */}
      <VoiceSearchBar />
      <PlaylistPopover />
      <AuthModal />
      <ToastContainer />

      {/* Premium Streaming Onboarding Flow Modal Overlay */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#050508]"
          >
            <OnboardingFlow
              onComplete={(data) => {
                setUser({
                  id: 'u-user-custom',
                  name: data.name,
                  email: data.email,
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  role: `${data.selectedPlan?.name || 'Standard'} Member`
                });
                closeOnboarding();
                addToast({
                  title: `Welcome to Zhoosh, ${data.name}!`,
                  description: `${data.selectedPreferences.length} preferences calibrated for your ${data.selectedPlan?.name} tier`,
                  type: 'success'
                });
              }}
              onInstantBypass={closeOnboarding}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
