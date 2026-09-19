import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useAgentStore } from '@/store/useAgentStore';
import { TopBar } from './TopBar';
import { MobileBottomBar } from './MobileBottomBar';
import { TopProgress } from '../common/TopProgress';
import { PlayerBar } from '../player/PlayerBar';
import { VoiceSearchBar } from '../voice/VoiceSearchBar';
import { PlaylistPopover } from '../playlist/PlaylistPopover';
import { AuthModal } from '../auth/AuthModal';
import { MovieDetailsModal } from '../movies/MovieDetailsModal';
import { ToastContainer } from '../common/Toast';
import { MoviesView } from '../movies/MoviesView';
import { MusicView } from '../music/MusicView';
import { PlaylistPage } from '../playlist/PlaylistPage';
import { RecommendationsView } from '../recommendations/RecommendationsView';
import { LikesView } from '../likes/LikesView';
import { SearchResultsView } from '../search/SearchResultsView';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { FadedGridBackdrop } from '../common/FadedGridBackdrop';
import { AIChatView } from '../agent/AIChatView';
import { FixedFooter } from '../common/FixedFooter';
import { NavThemeTransition } from '../common/NavThemeTransition';
import { DEFAULT_AVATAR } from '@/utils/avatars';

export const AppShell: React.FC = () => {
  const { mode, activeNav, currentTrack, isOnboardingOpen, closeOnboarding, setUser, addToast } = useAppStore();
  const { profile: agentProfile, setProfile: setAgentProfile, loadFromStorage } = useAgentStore();
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavTransitioning, setIsNavTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState('');
  const prevNavRef = React.useRef(activeNav);

  // Trigger cinematic theme loading transition when switching between Home and My Zhoosh (Watchlist)
  useEffect(() => {
    if (prevNavRef.current !== activeNav) {
      const isSwitchingHomeOrLikes =
        (prevNavRef.current === 'discover' && activeNav === 'likes') ||
        (prevNavRef.current === 'likes' && activeNav === 'discover');

      if (isSwitchingHomeOrLikes && !shouldReduceMotion) {
        setTransitionTarget(activeNav);
        setIsNavTransitioning(true);
        const timer = setTimeout(() => {
          setIsNavTransitioning(false);
        }, 550);
        prevNavRef.current = activeNav;
        return () => clearTimeout(timer);
      }
      prevNavRef.current = activeNav;
    }
  }, [activeNav, shouldReduceMotion]);

  // Ensure agent profile is initialized for users who bypass onboarding
  useEffect(() => {
    loadFromStorage();
    // If no profile in storage, set a default
    if (!agentProfile) {
      setAgentProfile({
        name: 'Nova',
        avatarUrl: '/agent-avatar.jpg',
        createdAt: new Date().toISOString(),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderActiveView = () => {
    if (searchQuery.trim().length > 0) {
      return <SearchResultsView key="search" query={searchQuery} onClear={() => setSearchQuery('')} />;
    }

    switch (activeNav) {
      case 'agent-ai':
        return <AIChatView key="ai-chat-view" />;
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
    <div className={`min-h-screen bg-[#07070b] text-white flex flex-col relative font-sans ${activeNav === 'agent-ai' ? 'h-screen overflow-hidden' : 'overflow-x-clip'}`}>
      {/* 1. Global Clean Background */}
      <FadedGridBackdrop intensity="subtle" showPosters={false} />

      {/* Top background query progress line */}
      <TopProgress />

      {/* 2. Fixed Full-Width Top Navigation Bar (No Sidebar) */}
      <TopBar onSearchChange={setSearchQuery} searchValue={searchQuery} />

      {/* 3. Main Full-Width Streaming Experience */}
      <div className={`flex-1 w-full pt-14 sm:pt-16 flex flex-col z-10 ${activeNav === 'agent-ai' ? 'h-full max-h-screen overflow-hidden' : ''}`}>
        <main
          className={`flex-1 w-full flex flex-col ${
            activeNav === 'agent-ai'
              ? `h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden ${
                  mode === 'music' && currentTrack
                    ? 'pb-28 md:pb-24'
                    : 'pb-16 md:pb-0'
                }`
              : mode === 'music' && currentTrack
              ? 'pb-36 md:pb-24 min-h-[calc(100vh-64px)]'
              : 'pb-20 md:pb-0 min-h-[calc(100vh-64px)]'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${activeNav}-${searchQuery ? 'searching' : 'content'}`}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full ${activeNav === 'agent-ai' ? 'h-full flex-1 flex flex-col overflow-hidden' : ''}`}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Fixed Directory Footer (hidden in full-screen AI chat and on mobile) */}
        {activeNav !== 'agent-ai' && (
          <div className="hidden md:block">
            <FixedFooter />
          </div>
        )}
      </div>

      {/* Bottom Player for Audio */}
      <PlayerBar />

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomBar />

      {/* Overlays & Modals */}
      <VoiceSearchBar />
      <PlaylistPopover />
      <AuthModal />
      <MovieDetailsModal />
      <ToastContainer />

      {/* Cinematic Theme Loading Transition between Home and My Zhoosh */}
      <AnimatePresence>
        {isNavTransitioning && (
          <NavThemeTransition targetNav={transitionTarget} />
        )}
      </AnimatePresence>

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
                  avatar: DEFAULT_AVATAR,
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
