import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { AgentAvatar } from './AgentAvatar';
import { AgentChatPanel } from './AgentChatPanel';

/*
 * Layout reference (all fixed, from viewport bottom):
 *   PlayerBar  h-20 → 80px  (only visible in music mode)
 *   Gap                8px
 *   Bubble bubble    56px   ← sits at bottom: 96px (80 + 8 + extra 8)
 *   Gap                8px
 *   Label chip      ~26px
 *
 * Chat panel anchors:
 *   right : 24px  (matches bubble right edge)
 *   bottom: 168px (96 bubble-bottom + 56 bubble height + 8 gap + 8 extra)
 *   top   : 76px  (64px TopBar + 12px gap)
 *
 * This means the panel NEVER:
 *   - Clips under TopBar
 *   - Overlaps the bubble
 *   - Goes off-screen bottom
 */
const RIGHT_OFFSET = 24;
const BUBBLE_BOTTOM = 96;       // px from viewport bottom (above playerbar)
const BUBBLE_SIZE = 56;         // w-14 h-14
const PANEL_BOTTOM = BUBBLE_BOTTOM + BUBBLE_SIZE + 12; // 164px
const PANEL_TOP = 76;           // below TopBar (64px) + gap

export const AgentCompanion: React.FC = () => {
  const { profile, isOpen, toggleOpen, closeChat, isThinking, loadFromStorage } = useAgentStore();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const agentName = profile?.name || 'Nova';
  const avatarState = isThinking ? 'thinking' : 'idle';

  return (
    <>
      {/* ══════════════════════════════════════
          CHAT PANEL — independent fixed element
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="agent-panel"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed z-[45]"
            style={{
              right: RIGHT_OFFSET,
              bottom: PANEL_BOTTOM,
              top: PANEL_TOP,
              width: 420,
              maxWidth: `calc(100vw - ${RIGHT_OFFSET * 2}px)`,
              // overflow-y handled inside AgentChatPanel
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AgentChatPanel onClose={closeChat} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          FLOATING BUBBLE — independent fixed element
          ══════════════════════════════════════ */}
      <div
        className="fixed z-[46] flex flex-col items-end gap-2 select-none"
        style={{ right: RIGHT_OFFSET, bottom: BUBBLE_BOTTOM }}
      >
        {/* Agent name label — only when panel is closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold pointer-events-none"
              style={{
                background: 'rgba(10,5,20,0.92)',
                border: '1px solid rgba(157,78,221,0.35)',
                backdropFilter: 'blur(10px)',
                color: 'rgba(230,210,255,0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(157,78,221,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              <motion.div
                animate={shouldReduceMotion ? {} : { scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
              />
              {agentName}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Orb Bubble Button */}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
          style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
          title={isOpen ? `Close ${agentName}` : `Chat with ${agentName}`}
          aria-label={isOpen ? `Close ${agentName} chat` : `Open ${agentName} chat`}
        >
          {/* Pulse rings — only when closed */}
          {!isOpen && !shouldReduceMotion && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ scale: [1, 1.6, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.4) 0%, transparent 70%)' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                style={{ background: 'radial-gradient(circle, rgba(255,30,86,0.2) 0%, transparent 70%)' }}
              />
            </>
          )}

          {/* Avatar / Close icon */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ scale: 0.6, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.18 }}
                className="w-14 h-14 rounded-full bg-[#0F0A18] border border-[#A855F7]/50 flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}
              >
                <MessageCircle className="w-6 h-6 text-[#A855F7]" />
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <AgentAvatar state={avatarState} size="lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};
