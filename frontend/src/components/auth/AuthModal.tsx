import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/api/client';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';
import { zhooshAudio } from '@/utils/cinematicSound';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuth, authMode, openAuth, setUser, mode, addToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const newUser = await api.signup(name || 'Zhoosh VIP', email);
        setUser(newUser);
        zhooshAudio.playSuccessFanfare();
        addToast({ title: 'Welcome to Zhoosh!', description: 'Account created successfully', type: 'success' });
      } else {
        const loggedIn = await api.login(email);
        setUser(loggedIn);
        zhooshAudio.playSubImpact();
        addToast({ title: `Welcome back, ${loggedIn.name}`, type: 'success' });
      }
      closeAuth();
    } catch {
      addToast({ title: 'Authentication failed', description: 'Please check your details', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-[#08060D] border border-[#2D1B45] shadow-[0_0_50px_rgba(168,85,247,0.15)] p-6 sm:p-8 overflow-hidden"
        >
          {/* Ambient background aura */}
          <div
            className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none ${
              mode === 'movies' ? 'bg-[#FF1E56]' : 'bg-[#A855F7]'
            }`}
          />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-15 bg-[#FF1E56] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeAuth}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <ZhooshLogo size="sm" showWordmark={true} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Welcome Back to Zhoosh' : 'Join the Zhoosh Universe'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              One neural pass for blockbuster cinema and studio beats
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-[#120D1A] border border-[#2B193D] mb-6 relative">
            <button
              onClick={() => {
                zhooshAudio.playSubImpact();
                openAuth('login');
              }}
              className={`relative flex-1 py-2 rounded-lg text-xs font-bold transition-colors z-10 ${
                authMode === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
              {authMode === 'login' && (
                <motion.div
                  layoutId="authPill"
                  className="absolute inset-0 rounded-lg -z-10 bg-gradient-to-r from-[#FF1E56] to-[#A855F7]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => {
                zhooshAudio.playSubImpact();
                openAuth('signup');
              }}
              className={`relative flex-1 py-2 rounded-lg text-xs font-bold transition-colors z-10 ${
                authMode === 'signup' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
              {authMode === 'signup' && (
                <motion.div
                  layoutId="authPill"
                  className="absolute inset-0 rounded-lg -z-10 bg-gradient-to-r from-[#FF1E56] to-[#A855F7]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#A855F7] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@zhoosh.stream"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#A855F7] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#A855F7] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg bg-gradient-to-r from-[#FF1E56] to-[#A855F7] hover:from-[#E50914] hover:to-[#9333EA] shadow-[0_0_25px_rgba(255,30,86,0.3)] transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : authMode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter Zhoosh</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
