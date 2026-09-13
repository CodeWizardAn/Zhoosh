import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Check, Sparkles, Shield, Zap, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  resolution: string;
  spatialAudio: boolean;
  screens: number;
  badge?: string;
  color: string;
}

const TIERS: Tier[] = [
  {
    id: 'plan-core',
    name: 'Zhoosh Core',
    price: '$8.99',
    period: '/month',
    resolution: '1080p Full HD',
    spatialAudio: false,
    screens: 1,
    color: '#7C3AED'
  },
  {
    id: 'plan-standard',
    name: 'Standard Zhoosh',
    price: '$14.99',
    period: '/month',
    resolution: '4K Ultra HD + HDR10',
    spatialAudio: true,
    screens: 2,
    badge: 'Popular',
    color: '#FF1E56'
  },
  {
    id: 'plan-vip',
    name: 'Zhoosh VIP Ultra',
    price: '$21.99',
    period: '/month',
    resolution: '8K IMAX Enhanced + Dolby Vision',
    spatialAudio: true,
    screens: 4,
    badge: 'Ultimate',
    color: '#A855F7'
  }
];

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, addToast } = useAppStore();
  const [selectedTierId, setSelectedTierId] = useState<string>('plan-vip');

  if (!isOpen) return null;

  const currentTierName = user?.role?.includes('Core')
    ? 'Zhoosh Core'
    : user?.role?.includes('Standard')
    ? 'Standard Zhoosh'
    : 'Zhoosh VIP Ultra';

  const handleUpgrade = (tier: Tier) => {
    setSelectedTierId(tier.id);
    if (user) {
      const updated = {
        ...user,
        role: `${tier.name} Member`
      };
      setUser(updated);
      try {
        localStorage.setItem('zhoosh_user_profile', JSON.stringify(updated));
      } catch {
        // ignore
      }
      addToast({
        title: `Plan Updated to ${tier.name}`,
        description: `Your membership is active with ${tier.resolution}.`,
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
          className="relative w-full max-w-2xl rounded-3xl bg-[#08060D] border border-[#2D1B45] shadow-[0_0_60px_rgba(168,85,247,0.25)] p-6 sm:p-8 overflow-hidden text-white"
        >
          {/* Ambient Lighting Flares */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF1E56]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#A855F7]/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Your Subscription Plan</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Current Plan: <span className="text-white font-bold">{currentTierName}</span> • Auto-renews next month
              </p>
            </div>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
            {TIERS.map((tier) => {
              const isCurrent = currentTierName === tier.name;
              return (
                <div
                  key={tier.id}
                  onClick={() => handleUpgrade(tier)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-gradient-to-b from-[#1C0D2C] to-[#12071E] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]'
                      : 'bg-[#120D1A]/80 border-white/10 hover:border-white/20 hover:bg-[#181024]'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF1E56] to-[#A855F7] text-white shadow-sm">
                      {tier.badge}
                    </span>
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-white">{tier.name}</h4>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-2xl font-black text-white font-mono">{tier.price}</span>
                      <span className="text-xs text-gray-400">{tier.period}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-gray-300 my-3">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#A855F7]" />
                        <span>{tier.resolution}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#FF1E56]" />
                        <span>{tier.screens} concurrent streams</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#A855F7]" />
                        <span>{tier.spatialAudio ? 'Dolby Atmos Spatial' : 'Stereo Audio'}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(tier);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-gradient-to-r from-[#FF1E56] to-[#A855F7] hover:from-[#E50914] hover:to-[#9333EA] text-white shadow-md'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Switch to this'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Security / Benefits Bar */}
          <div className="p-3.5 rounded-xl bg-[#120D1A] border border-[#2B1B3D] flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Cancel or switch anytime without fees • 4K HDR Ultra streams</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
