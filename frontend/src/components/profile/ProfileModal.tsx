import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, addToast } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || PRESET_AVATARS[0]);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (user) {
      const updated = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        avatar: avatar || user.avatar
      };
      setUser(updated);
      try {
        localStorage.setItem('zhoosh_user_profile', JSON.stringify(updated));
      } catch {
        // ignore
      }
      addToast({
        title: 'Profile Updated',
        description: 'Your details have been saved to your Zhoosh neural pass.',
        type: 'success'
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-[#08060D] border border-[#2D1B45] shadow-[0_0_50px_rgba(168,85,247,0.2)] p-6 sm:p-8 overflow-hidden text-white"
        >
          {/* Ambient Lighting Flares */}
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#FF1E56]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#FF1E56]/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Modify Details</h3>
              <p className="text-xs text-gray-400">Update your personal Zhoosh credentials</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Choose Avatar</label>
              <div className="flex items-center gap-2.5">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = avatar === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-[#FF1E56] shadow-[0_0_15px_rgba(255,30,86,0.6)] scale-105'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#FF1E56]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Avatar URL input */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Or Avatar Image URL</label>
              <div className="relative flex items-center">
                <ImageIcon className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#A855F7] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Display Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#FF1E56] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@zhoosh.stream"
                  className="w-full bg-[#120D1A] border border-[#2B193D] focus:border-[#A855F7] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1E56] to-[#A855F7] text-xs font-bold text-white shadow-lg shadow-[#FF1E56]/25 hover:from-[#E50914] hover:to-[#9333EA] transition-all"
              >
                Save Changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
