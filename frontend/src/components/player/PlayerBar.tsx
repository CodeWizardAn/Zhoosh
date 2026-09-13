import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  ListMusic,
  Mic2,
  Maximize2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useLikeMutation } from '@/api/hooks';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';

export const PlayerBar: React.FC = () => {
  const {
    mode,
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    setProgress,
    currentTimeSec,
    setCurrentTimeSec,
    volume,
    setVolume,
    nextTrack,
    prevTrack,
    likedIds
  } = useAppStore();

  const likeMutation = useLikeMutation();
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTimeStr, setHoverTimeStr] = useState('0:00');
  const [hoverPositionPct, setHoverPositionPct] = useState(0);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  const durationSec = currentTrack?.duration_sec || 210;
  const isLiked = currentTrack ? !!likedIds[String(currentTrack.id)] : false;

  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrack) {
      interval = window.setInterval(() => {
        setCurrentTimeSec(Math.min(currentTimeSec + 1, durationSec));
        setProgress(Math.min((currentTimeSec + 1) / durationSec, 1));
        if (currentTimeSec >= durationSec) {
          nextTrack();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, currentTimeSec, durationSec, setProgress, setCurrentTimeSec, nextTrack]);

  const handleTogglePlay = () => {
    togglePlay();
    if (!isPlaying && currentTrack) {
      synthEngine.playTrackPreview(currentTrack.genre);
    } else {
      synthEngine.stop();
    }
  };

  const handleProgressScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newProgress = clickX / rect.width;
    setProgress(newProgress);
    setCurrentTimeSec(Math.round(newProgress * durationSec));
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = (clickX / rect.width) * 100;
    const previewSec = Math.round((clickX / rect.width) * durationSec);
    setHoverPositionPct(pct);
    setHoverTimeStr(`${Math.floor(previewSec / 60)}:${(previewSec % 60).toString().padStart(2, '0')}`);
  };

  const handleLikeCurrent = (e: React.MouseEvent) => {
    if (!currentTrack) return;
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    likeMutation.mutate({ item: currentTrack, mode: 'music' });
  };

  if (mode !== 'music' || !currentTrack) return null;

  return (
    <aside
      className="fixed bottom-0 inset-x-0 z-40 h-20 bg-[#000000] border-t border-[#282828] px-4 sm:px-6 flex items-center justify-between select-none"
      aria-label="Spotify Player"
    >
      {/* Left: Track Information & Album Art */}
      <div className="flex items-center gap-3.5 min-w-[180px] max-w-[30%]">
        <img
          src={currentTrack.album_art}
          alt={currentTrack.title}
          className="w-14 h-14 rounded object-cover shadow shrink-0"
        />

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-[#B3B3B3] truncate hover:underline hover:text-white cursor-pointer mt-0.5">
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={handleLikeCurrent}
          className={`p-1.5 transition-colors ${
            isLiked ? 'text-[#A855F7]' : 'text-[#B3B3B3] hover:text-white'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Center: Controls & Scrub Bar */}
      <div className="flex flex-col items-center max-w-xl w-full px-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-4 mb-1">
          <button className="text-[#B3B3B3] hover:text-white transition-colors" title="Shuffle">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={prevTrack}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Play/Pause circle */}
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-white hover:bg-gradient-to-r hover:from-[#FF1E56] hover:to-[#A855F7] hover:scale-105 text-black hover:text-white flex items-center justify-center transition-all shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={nextTrack}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
          <button className="text-[#B3B3B3] hover:text-white transition-colors" title="Repeat">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="w-full flex items-center gap-2 text-[11px] text-[#A7A7A7] font-mono">
          <span className="w-8 text-right">
            {Math.floor(currentTimeSec / 60)}:
            {(currentTimeSec % 60).toString().padStart(2, '0')}
          </span>

          <div
            ref={progressTrackRef}
            onClick={handleProgressScrub}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
            onMouseMove={handleProgressMouseMove}
            className="relative flex-1 h-1 bg-[#4D4D4D] hover:h-1.5 rounded-full cursor-pointer transition-all group"
          >
            {isHoveringProgress && (
              <div
                style={{ left: `${hoverPositionPct}%` }}
                className="absolute -top-6 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#282828] text-[10px] text-white border border-[#3E3E3E] pointer-events-none"
              >
                {hoverTimeStr}
              </div>
            )}

            <div
              style={{ width: `${progress * 100}%` }}
              className="absolute left-0 inset-y-0 bg-white group-hover:bg-[#A855F7] rounded-full"
            />
          </div>

          <span className="w-8">
            {Math.floor(durationSec / 60)}:
            {(durationSec % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Right: Volume & Utility Actions */}
      <div className="hidden md:flex items-center justify-end gap-3 min-w-[180px] max-w-[25%] text-[#B3B3B3]">
        <button className="hover:text-white transition-colors" title="Lyrics">
          <Mic2 className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors" title="Queue">
          <ListMusic className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-[#4D4D4D] rounded-lg appearance-none cursor-pointer accent-white hover:accent-[#A855F7]"
          />
        </div>
      </div>
    </aside>
  );
};
