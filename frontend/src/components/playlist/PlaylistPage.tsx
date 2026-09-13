import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Play,
  GripVertical,
  Clock,
  Check,
  X,
  FolderOpen
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Playlist, Movie, Song } from '@/types';
import { synthEngine } from '@/utils/audioSynth';
import { EmptyState } from '../common/EmptyState';

export const PlaylistPage: React.FC = () => {
  const {
    playlists,
    createPlaylist,
    removeItemFromPlaylist,
    reorderPlaylistItems,
    mode,
    playTrack,
    addToast
  } = useAppStore();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    playlists[0]?.id || ''
  );

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  const handleCreateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createPlaylist(
      newTitle.trim(),
      'Personal collection',
      mode
    );
    setSelectedPlaylistId(created.id);
    setIsCreating(false);
    setNewTitle('');
    addToast({ title: `Created "${created.title}"`, type: 'success' });
  };

  const handleReorder = (newItems: Array<Movie | Song>) => {
    if (!currentPlaylist) return;
    reorderPlaylistItems(currentPlaylist.id, newItems);
  };

  const handlePlaySong = (song: Song) => {
    playTrack(song, currentPlaylist?.items.filter((i): i is Song => !('overview' in i)));
    synthEngine.playTrackPreview(song.genre);
  };

  return (
    <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Selector & New Playlist Button */}
      <div className="flex flex-wrap items-center gap-2">
        {playlists.map((pl) => {
          const isSelected = pl.id === currentPlaylist?.id;
          return (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-white text-black'
                  : 'bg-[#242424] text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <span>{pl.title}</span>
              <span className="text-[11px] opacity-60">({pl.items.length})</span>
            </button>
          );
        })}

        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#242424] text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A] flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreateConfirm} className="flex items-center gap-1.5 bg-[#242424] rounded-full p-1 border border-white/20">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="bg-transparent px-3 py-0.5 text-xs text-white focus:outline-none placeholder-[#727272] w-36"
            />
            <button type="submit" className="p-1 rounded-full bg-white text-black hover:scale-105">
              <Check className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="p-1 text-[#A7A7A7] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>

      {/* Playlist Banner Header */}
      {currentPlaylist && (
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-xl bg-gradient-to-b from-[#242424] to-[#121212] select-none">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded shadow-2xl overflow-hidden shrink-0 bg-[#282828]">
            <img
              src={currentPlaylist.cover_art || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'}
              alt={currentPlaylist.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <span className="text-[11px] font-bold text-[#A7A7A7] uppercase tracking-wider">
              {currentPlaylist.mode.toUpperCase()} PLAYLIST
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight truncate">
              {currentPlaylist.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#B3B3B3]">
              {currentPlaylist.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A7A7A7] pt-1">
              <span className="text-white">Alex Mercer</span>
              <span>•</span>
              <span>{currentPlaylist.items.length} items</span>
            </div>
          </div>
        </div>
      )}

      {/* Reorderable Items List */}
      {currentPlaylist && currentPlaylist.items.length > 0 ? (
        <div className="space-y-1">
          <div className="grid grid-cols-12 text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider px-4 py-2 border-b border-[#282828] select-none">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-8 sm:col-span-7">Title</span>
            <span className="hidden sm:block sm:col-span-3">Genre / Category</span>
            <span className="col-span-3 sm:col-span-1 text-right">Action</span>
          </div>

          <Reorder.Group
            axis="y"
            values={currentPlaylist.items}
            onReorder={handleReorder}
            className="space-y-1"
          >
            {currentPlaylist.items.map((item, idx) => {
              const isMovie = 'overview' in item;
              const movie = isMovie ? (item as Movie) : null;
              const song = !isMovie ? (item as Song) : null;

              return (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  whileDrag={{
                    scale: 1.02,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    cursor: 'grabbing',
                  }}
                  className="group grid grid-cols-12 items-center px-4 py-2.5 rounded-md bg-[#181818] hover:bg-[#282828] transition-colors select-none"
                >
                  <div className="col-span-1 flex items-center justify-center gap-1.5 text-xs text-[#B3B3B3]">
                    <div className="cursor-grab active:cursor-grabbing text-[#727272] group-hover:text-white p-0.5">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <span>{idx + 1}</span>
                  </div>

                  <div className="col-span-8 sm:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={isMovie ? movie?.poster_path : song?.album_art}
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="text-xs text-[#B3B3B3] truncate">
                        {isMovie ? movie?.genres.slice(0, 2).join(', ') : song?.artist}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-3 text-xs text-[#B3B3B3] truncate">
                    {isMovie ? 'Feature Film' : song?.album}
                  </div>

                  <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2">
                    {song && (
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                        title="Play"
                      >
                        <Play className="w-4 h-4 fill-white" />
                      </button>
                    )}
                    <button
                      onClick={() => removeItemFromPlaylist(currentPlaylist.id, item.id)}
                      className="p-1.5 rounded-full text-[#727272] hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      ) : (
        <EmptyState
          type="playlists"
          title="This playlist is empty"
          description="Browse movies or songs and click '+' to add them here."
        />
      )}
    </div>
  );
};
