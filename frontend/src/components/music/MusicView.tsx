import React from 'react';
import { useMusic } from '@/api/hooks';
import { MediaGrid } from './MediaGrid';

export const MusicView: React.FC = () => {
  const { data: songs = [], isLoading } = useMusic();

  return (
    <div className="pt-6 pb-24 bg-transparent">
      <MediaGrid
        title="Popular Tracks"
        songs={songs}
        isLoading={isLoading}
      />
    </div>
  );
};
