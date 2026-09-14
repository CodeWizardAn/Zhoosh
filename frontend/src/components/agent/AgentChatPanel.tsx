import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Send, Trash2, Settings, RotateCcw, Sparkles } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import { api } from '@/api/client';
import { AgentAvatar } from './AgentAvatar';
import { AgentMessage } from './AgentMessage';

const EXAMPLE_QUERIES = [
  { icon: '🎬', label: 'Top 5 trending movies' },
  { icon: '🎵', label: 'Top trending songs right now' },
  { icon: '✨', label: 'Recommend based on my taste' },
  { icon: '🔍', label: 'Is Inception available?' },
];

interface AgentChatPanelProps {
  onClose: () => void;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({ onClose }) => {
  const {
    profile,
    messages,
    isThinking,
    addMessage,
    updateLastAgentMessage,
    setThinking,
    clearHistory,
    updateAgentName,
  } = useAgentStore();

  const shouldReduceMotion = useReducedMotion();
  const agentName = profile?.name || 'Nova';

  const [input, setInput] = useState('');
  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(agentName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, shouldReduceMotion]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    setInput('');
    abortRef.current = false;

    // Add user message
    addMessage({ role: 'user', content: trimmed });

    // Add placeholder agent message
    const placeholderMsg = addMessage({ role: 'agent', content: '', isStreaming: true });

    setThinking(true);
    setAvatarState('thinking');

    let accumulated = '';

    try {
      await api.agentChat(
        trimmed,
        messages.map((m) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content })),
        agentName,
        (token) => {
          if (abortRef.current) return;
          accumulated += token;
          updateLastAgentMessage(accumulated, false);
        },
        (_intent) => {
          if (abortRef.current) return;
          updateLastAgentMessage(accumulated, true);
          setThinking(false);
          setAvatarState('responding');
          setTimeout(() => setAvatarState('idle'), 800);
        },
        () => {
          updateLastAgentMessage('Sorry, I ran into an issue. Please try again.', true);
          setThinking(false);
          setAvatarState('idle');
        }
      );
    } catch {
      updateLastAgentMessage('Sorry, something went wrong. Please try again.', true);
      setThinking(false);
      setAvatarState('idle');
    }
  }, [addMessage, agentName, isThinking, messages, setThinking, updateLastAgentMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleExampleClick = (query: string) => {
    sendMessage(query);
  };

  const handleSaveName = () => {
    if (editName.trim().length >= 2) {
      updateAgentName(editName.trim());
      setShowSettings(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
    setShowSettings(false);
  };

  const panelVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 340, damping: 28 }
    },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.18 } }
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #0B0712 0%, #070410 100%)',
        border: '1px solid rgba(157,78,221,0.25)',
        boxShadow: '0 0 0 1px rgba(255,30,86,0.08), 0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(157,78,221,0.12)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 relative"
        style={{
          background: 'linear-gradient(90deg, rgba(255,30,86,0.08) 0%, rgba(157,78,221,0.08) 100%)',
          borderBottom: '1px solid rgba(157,78,221,0.2)',
        }}
      >
        <AgentAvatar state={avatarState} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm truncate">{agentName}</span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
            />
          </div>
          <p className="text-[10px] text-[#A855F7]/70 font-mono tracking-wide">
            {isThinking ? 'Thinking...' : 'Your Zhoosh Companion'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setShowSettings(!showSettings); setEditName(agentName); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#A855F7] hover:bg-white/5 transition-colors"
            title="Agent settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden"
            style={{ borderBottom: '1px solid rgba(157,78,221,0.2)', background: 'rgba(10,5,20,0.95)' }}
          >
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Rename Agent</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    maxLength={20}
                    placeholder="Agent name..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#A855F7]/50 transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={editName.trim().length < 2}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#A855F7]/20 hover:bg-[#A855F7]/30 border border-[#A855F7]/30 disabled:opacity-40 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Conversation</span>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear History
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">Are you sure?</span>
                    <button onClick={handleClearHistory} className="text-xs px-2 py-0.5 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors">Yes</button>
                    <button onClick={() => setShowClearConfirm(false)} className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 hover:bg-white/15 transition-colors">No</button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(157,78,221,0.2) transparent' }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center pt-6 gap-6"
          >
            <AgentAvatar state="idle" size="lg" />
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-base">Say hi to {agentName}!</p>
              <p className="text-gray-500 text-xs max-w-[260px] leading-relaxed">
                I know your taste, your history, and what's trending. Ask me anything.
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((q, i) => (
                <motion.button
                  key={q.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  onClick={() => handleExampleClick(q.label)}
                  className="flex items-start gap-2 p-3 rounded-xl text-left text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(157,78,221,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(157,78,221,0.5)';
                    e.currentTarget.style.background = 'rgba(157,78,221,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(157,78,221,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <span className="text-base shrink-0">{q.icon}</span>
                  <span className="text-gray-300 leading-tight font-medium">{q.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <AgentMessage
            key={msg.id}
            message={msg}
            agentName={agentName}
            index={i}
          />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isThinking && messages[messages.length - 1]?.role !== 'agent' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex gap-2.5 items-center"
            >
              <AgentAvatar state="thinking" size="sm" />
              <div
                className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
                style={{
                  background: 'rgba(20,8,32,0.9)',
                  border: '1px solid rgba(157,78,221,0.3)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: '1px solid rgba(157,78,221,0.2)', background: 'rgba(8,4,16,0.95)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(157,78,221,0.2)',
            transition: 'border-color 0.2s',
          }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(157,78,221,0.5)'; }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(157,78,221,0.2)'; }}
        >
          <Sparkles className="w-4 h-4 text-[#A855F7]/50 shrink-0 mb-1" />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${agentName} anything...`}
            disabled={isThinking}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: '96px', overflowY: 'auto' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 96) + 'px';
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            className="p-1.5 rounded-lg text-white disabled:opacity-30 transition-all shrink-0 mb-0.5"
            style={{
              background: input.trim() && !isThinking
                ? 'linear-gradient(135deg, #FF1E56, #A855F7)'
                : 'rgba(255,255,255,0.1)',
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <p className="text-[10px] text-gray-700 text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
