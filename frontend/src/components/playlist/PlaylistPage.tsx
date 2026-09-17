import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Play,
  GripVertical,
  Clock,
  Check,
  X,
  FolderOpen,
  Music2,
  Sparkles,
  Heart,
  Search,
  Disc3,
  Image as ImageIcon
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Playlist, Movie, Song } from '@/types';
import { synthEngine } from '@/utils/audioSynth';
import { triggerLikeBurst } from '@/utils/confetti';
import { MOCK_SONGS } from '@/api/mockData';
import { EmptyState } from '../common/EmptyState';

const PLAYLIST_COVER_PRESETS = [
  {
    name: 'Neon Blue',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Soulful Ballad',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Midnight Synth',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'High Voltage Rock',
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cosmic Cinema',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Chillwave Sunset',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  }
];

export const PlaylistPage: React.FC = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addItemToPlaylist,
    removeItemFromPlaylist,
    reorderPlaylistItems,
    mode,
    playTrack,
    currentTrack,
    isPlaying,
    likedIds,
    toggleLike,
    addToast
  } = useAppStore();

  const isMusicMode = mode === 'music';

  // Filter playlists for current mode or fallback to all
  const modePlaylists = playlists.filter((p) => p.mode === mode);
  const effectivePlaylists = modePlaylists.length > 0 ? modePlaylists : playlists;

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    effectivePlaylists[0]?.id || ''
  );

  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(PLAYLIST_COVER_PRESETS[0].url);

  // Search filter for adding new songs
  const [songSearchQuery, setSongSearchQuery] = useState('');

  const currentPlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || effectivePlaylists[0];

  const handleCreateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createPlaylist(
      newTitle.trim(),
      newDescription.trim() || 'Custom curated collection',
      mode,
      selectedCoverUrl
    );
    setSelectedPlaylistId(created.id);
    setIsCreatingModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    addToast({ title: `Created playlist "${created.title}"`, type: 'success' });
  };

  const handleDeletePlaylist = (playlistId: string, title: string) => {
    deletePlaylist(playlistId);
    const remaining = playlists.filter((p) => p.id !== playlistId && p.mode === mode);
    if (remaining.length > 0) {
      setSelectedPlaylistId(remaining[0].id);
    }
    addToast({ title: `Deleted playlist "${title}"`, type: 'info' });
  };

  const handleReorder = (newItems: Array<Movie | Song>) => {
    if (!currentPlaylist) return;
    reorderPlaylistItems(currentPlaylist.id, newItems);
  };

  const handlePlaySong = (song: Song) => {
    playTrack(song, currentPlaylist?.items.filter((i): i is Song => !('overview' in i)));
    synthEngine.playTrackPreview(song.genre);
  };

  const handlePlayAll = () => {
    if (!currentPlaylist || currentPlaylist.items.length === 0) return;
    const songs = currentPlaylist.items.filter((i): i is Song => !('overview' in i));
    if (songs.length > 0) {
      playTrack(songs[0], songs);
      synthEngine.playTrackPreview(songs[0].genre);
      addToast({
        title: `Playing "${currentPlaylist.title}"`,
        description: `Starting playback of ${songs.length} tracks`,
        type: 'info'
      });
    }
  };

  // Filter available songs to quickly add
  const filteredAvailableSongs = useMemo(() => {
    const q = songSearchQuery.toLowerCase().trim();
    return MOCK_SONGS.filter((s) => {
      // Don't show if already in current playlist
      const isAlreadyIn = currentPlaylist?.items.some((item) => String(item.id) === String(s.id));
      if (isAlreadyIn) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [songSearchQuery, currentPlaylist?.items]);

  return (
    <div className="relative min-h-screen pb-32 bg-[#05070E] overflow-x-hidden">
      {/* ── Black & Blue Faded Grid Background Layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div
          className={`absolute inset-0 opacity-90 ${
            isMusicMode ? 'music-grid-pattern' : 'dashboard-grid-pattern'
          }`}
        />
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full blur-[130px] ${
            isMusicMode ? 'bg-[#0070F3]/16' : 'bg-[#E50914]/15'
          }`}
        />
        <div
          className={`absolute top-[40%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] ${
            isMusicMode ? 'bg-[#00D2FF]/12' : 'bg-[#B81D24]/12'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,7,14,0.85) 85%)'
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-6 max-w-7xl mx-auto space-y-6">
        {/* Top Playlists Selector & New Playlist Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {effectivePlaylists.map((pl) => {
              const isSelected = pl.id === currentPlaylist?.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? isMusicMode
                        ? 'bg-[#0070F3] text-white shadow-md shadow-blue-600/40'
                        : 'bg-white text-black shadow-md'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Music2 className="w-3 h-3" />
                  <span>{pl.title}</span>
                  <span className="text-[11px] opacity-70">({pl.items.length})</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCreatingModalOpen(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isMusicMode
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-400/40 hover:border-blue-400'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-400/40'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Playlist Banner Header */}
        {currentPlaylist ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-2xl bg-gradient-to-b from-blue-950/40 via-blue-950/20 to-black/60 border border-blue-500/20 shadow-2xl backdrop-blur-md select-none">
            {/* Cover Art */}
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl shadow-2xl overflow-hidden shrink-0 bg-[#0A1020] border border-blue-400/30 relative group">
              <img
                src={currentPlaylist.cover_art || PLAYLIST_COVER_PRESETS[0].url}
                alt={currentPlaylist.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                  {currentPlaylist.mode.toUpperCase()} PLAYLIST
                </span>
                <span className="text-xs text-gray-400">Created {currentPlaylist.created_at}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight truncate">
                {currentPlaylist.title}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                {currentPlaylist.description}
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 pt-1">
                <span className="text-white">Curated by You</span>
                <span>•</span>
                <span className="text-cyan-400">{currentPlaylist.items.length} Tracks</span>
              </div>

              {/* Action Buttons: Play All & Delete Playlist */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handlePlayAll}
                  disabled={currentPlaylist.items.length === 0}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm shadow-xl transition-all ${
                    currentPlaylist.items.length > 0
                      ? 'bg-white hover:bg-white/90 text-black hover:scale-105 active:scale-95 cursor-pointer shadow-blue-500/30'
                      : 'bg-white/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={() => handleDeletePlaylist(currentPlaylist.id, currentPlaylist.title)}
                  className="p-2 rounded-full bg-black/40 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-400/40 transition-colors cursor-pointer"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Reorderable Items List */}
        {currentPlaylist && currentPlaylist.items.length > 0 ? (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2 border-b border-white/10 select-none">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6 sm:col-span-5">Title</span>
              <span className="hidden sm:block sm:col-span-3">Album / Category</span>
              <span className="col-span-3 sm:col-span-2 text-right">Plays</span>
              <span className="col-span-2 sm:col-span-1 text-right pr-2">Action</span>
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
                const isThisCurrent = currentTrack?.id === song?.id;
                const isLiked = song ? !!likedIds[String(song.id)] : false;

                return (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: '0 10px 30px rgba(0,112,243,0.5)',
                      cursor: 'grabbing'
                    }}
                    className={`group grid grid-cols-12 items-center px-4 py-2.5 rounded-xl border transition-colors select-none ${
                      isThisCurrent
                        ? 'bg-blue-950/40 border-blue-500/40'
                        : 'bg-[#080D1A]/80 border-blue-500/10 hover:bg-blue-950/30 hover:border-blue-500/30'
                    }`}
                  >
                    {/* Position / Drag handle */}
                    <div className="col-span-1 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                      <div className="cursor-grab active:cursor-grabbing text-gray-500 group-hover:text-cyan-400 p-0.5">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono">{idx + 1}</span>
                    </div>

                    {/* Artwork + Title + Artist */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow">
                        <img
                          src={isMovie ? movie?.poster_path : song?.album_art}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {isThisCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isThisCurrent ? 'text-cyan-300' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {isMovie ? movie?.genres.slice(0, 2).join(', ') : song?.artist}
                        </p>
                      </div>
                    </div>

                    {/* Album / Category */}
                    <div className="hidden sm:block sm:col-span-3 text-xs text-gray-400 truncate">
                      {isMovie ? 'Feature Film' : song?.album}
                    </div>

                    {/* Plays */}
                    <div className="col-span-3 sm:col-span-2 text-right text-xs text-gray-400 font-mono">
                      {song?.plays || '10,000,000+'}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2 pr-1">
                      {song && (
                        <>
                          <button
                            onClick={() => handlePlaySong(song)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                            title="Play"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              triggerLikeBurst(e.clientX, e.clientY, 'music');
                              toggleLike(song);
                            }}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                              isLiked
                                ? 'text-[#0070F3]'
                                : 'text-gray-500 hover:text-white'
                            }`}
                            title={isLiked ? 'Unlike' : 'Like'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => removeItemFromPlaylist(currentPlaylist.id, item.id)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
            title="This playlist is currently empty"
            description="Add your favorite trending songs below or click '+' on any track card to populate this playlist."
          />
        )}

        {/* ── QUICK "ADD SONGS ACCORDINGLY" SECTION ── */}
        {currentPlaylist && (
          <div className="pt-8 border-t border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Recommended Tracks to Add</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Quickly add top trending and categorized songs to "{currentPlaylist.title}"
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter songs by name, artist..."
                  value={songSearchQuery}
                  onChange={(e) => setSongSearchQuery(e.target.value)}
                  className="w-full bg-[#080D1A] border border-blue-500/20 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredAvailableSongs.map((song: Song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#080D1A]/80 border border-blue-500/15 hover:border-blue-400/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <img
                      src={song.album_art}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addItemToPlaylist(currentPlaylist.id, song);
                      addToast({
                        title: `Added to "${currentPlaylist.title}"`,
                        description: `"${song.title}" added.`,
                        type: 'success'
                      });
                    }}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 text-xs font-semibold border border-blue-500/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE PLAYLIST MODAL ── */}
      <AnimatePresence>
        {isCreatingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-[#080D1A] border border-blue-500/30 shadow-2xl p-6 text-white select-none relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-300">
                  <Music2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Create New Playlist</h3>
                  <p className="text-xs text-gray-400">
                    Design a custom soundtrack collection for your mood
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateConfirm} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Cyber Drive, Romantic Rain..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-[#05070E] border border-blue-500/20 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Give your playlist a vibe or theme..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-[#05070E] border border-blue-500/20 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                {/* Cover Presets */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Select Cover Art
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PLAYLIST_COVER_PRESETS.map((preset) => {
                      const isSelected = selectedCoverUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelectedCoverUrl(preset.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-400 scale-105 shadow-md shadow-blue-500/40'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={preset.name}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit & Cancel */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreatingModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-[#0070F3] hover:bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition-all cursor-pointer hover:scale-105"
                  >
                    Create Playlist
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistPage;
