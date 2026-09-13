import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, FolderPlus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const PlaylistPopover: React.FC = () => {
  const {
    popoverTarget,
    closePopover,
    playlists,
    addItemToPlaylist,
    removeItemFromPlaylist,
    mode,
    addToast
  } = useAppStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    if (popoverTarget) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [popoverTarget, closePopover]);

  if (!popoverTarget) return null;

  const { item, anchorRect } = popoverTarget;

  // Calculate position relative to viewport
  const top = Math.min(anchorRect.bottom + 8, window.innerHeight - 280);
  const left = Math.max(16, Math.min(anchorRect.left - 180, window.innerWidth - 270));

  // Filter playlists relevant to item type or show all
  const relevantPlaylists = playlists.filter((pl) => pl.mode === mode);

  const toggleItemInPlaylist = (playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const isInside = pl.items.some((i) => String(i.id) === String(item.id));
    if (isInside) {
      removeItemFromPlaylist(playlistId, item.id);
      addToast({ title: `Removed from "${pl.title}"`, type: 'info' });
    } else {
      addItemToPlaylist(playlistId, item);
      addToast({ title: `Added to "${pl.title}"`, type: 'success' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-auto">
        <motion.div
          ref={popoverRef}
          style={{ top: `${top}px`, left: `${left}px` }}
          initial={{ opacity: 0, scale: 0.85, transformOrigin: 'top right' }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-64 rounded-2xl bg-[#181824] border border-white/10 shadow-2xl p-4 backdrop-blur-2xl text-white"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <FolderPlus className={`w-4 h-4 ${mode === 'movies' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Add to Playlist
              </h4>
            </div>
            <button
              onClick={closePopover}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Playlist list */}
          <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar py-1">
            {relevantPlaylists.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No playlists created yet</p>
            ) : (
              relevantPlaylists.map((playlist) => {
                const isSelected = playlist.items.some((i) => String(i.id) === String(item.id));
                return (
                  <button
                    key={playlist.id}
                    onClick={() => toggleItemInPlaylist(playlist.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex-1 truncate pr-2">
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                        {playlist.title}
                      </p>
                      <p className="text-[11px] text-gray-400">{playlist.items.length} items</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? mode === 'movies'
                            ? 'bg-amber-500 border-amber-500 text-black'
                            : 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-white/20 group-hover:border-white/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
