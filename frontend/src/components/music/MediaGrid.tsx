import React from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, Heart, Plus, Clock3 } from 'lucide-react';
import { Song } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { useLikeMutation } from '@/api/hooks';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';

interface MediaGridProps {
  title?: string;
  songs?: Song[];
  isLoading?: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  songs = [],
  isLoading = false,
}) => {
  const { currentTrack, isPlaying, playTrack, likedIds, openPopover } = useAppStore();
  const likeMutation = useLikeMutation();

  const featuredSongs = songs.slice(0, 5);
  const listSongs = songs;

  const handleRowPlay = (song: Song) => {
    playTrack(song, songs);
    synthEngine.playTrackPreview(song.genre);
  };

  const handleLike = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    likeMutation.mutate({ item: song, mode: 'music' });
  };

  const handleOpenPopover = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    openPopover(song, rect);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Recommended Albums / Singles Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white hover:underline cursor-pointer">
            {title || 'Made For You'}
          </h3>
          <span className="text-xs text-[#B3B3B3] hover:underline cursor-pointer font-semibold">
            Show all
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonCard key={idx} variant="song" index={idx} />
              ))
            : featuredSongs.map((song, idx) => (
                <MediaCard key={song.id} item={song} variant="song" index={idx} />
              ))}
        </div>
      </div>

      {/* Popular Tracks Table (Exact Spotify Specification) */}
      <div>
        <h3 className="text-xl font-bold text-white mb-3 hover:underline cursor-pointer">
          Popular Tracks
        </h3>

        <div className="space-y-0.5">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider px-4 py-2 border-b border-[#282828] select-none">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-6 sm:col-span-5">Title</span>
            <span className="hidden sm:block sm:col-span-3">Album</span>
            <span className="col-span-3 sm:col-span-2 text-right">Plays</span>
            <span className="col-span-2 sm:col-span-1 flex justify-end pr-2">
              <Clock3 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* List Rows */}
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={idx} variant="song-row" index={idx} />
              ))
            : listSongs.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isLiked = !!likedIds[String(song.id)];

                return (
                  <div
                    key={song.id}
                    onClick={() => handleRowPlay(song)}
                    className={`group grid grid-cols-12 items-center px-4 py-2 rounded-md cursor-pointer transition-colors select-none ${
                      isCurrent
                        ? 'bg-[#282828]'
                        : 'hover:bg-[#2A2A2A]/60'
                    }`}
                  >
                    {/* Track Number / Play Trigger */}
                    <div className="col-span-1 flex items-center justify-center text-sm font-medium">
                      {isCurrent && isPlaying ? (
                        <Volume2 className="w-4 h-4 text-[#A855F7] animate-pulse" />
                      ) : (
                        <span className="group-hover:hidden text-[#B3B3B3] text-xs">
                          {idx + 1}
                        </span>
                      )}
                      <Play className="w-4 h-4 text-white hidden group-hover:block fill-white" />
                    </div>

                    {/* Title & Artist */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={song.album_art}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-[#A855F7]' : 'text-white'
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-[#B3B3B3] group-hover:text-white truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Album */}
                    <div className="hidden sm:block sm:col-span-3 text-xs text-[#B3B3B3] truncate group-hover:text-white">
                      {song.album}
                    </div>

                    {/* Plays */}
                    <div className="col-span-3 sm:col-span-2 text-right text-xs text-[#B3B3B3] font-mono">
                      {song.plays}
                    </div>

                    {/* Actions & Duration */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-3 text-xs text-[#B3B3B3]">
                      <button
                        onClick={(e) => handleLike(e, song)}
                        className={`p-1 transition-opacity ${
                          isLiked ? 'opacity-100 text-[#A855F7]' : 'opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleOpenPopover(e, song)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs w-8 text-right font-mono">
                        {Math.floor(song.duration_sec / 60)}:
                        {(song.duration_sec % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};
