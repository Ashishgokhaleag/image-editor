
import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../../../ui/Buttons';

const VideoControls = ({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  showTimeline,
  onTogglePlay,
  onToggleMute,
  formatTime,
}) => {
  return (
    <div className="px-4 py-2 bg-editor-darker border-t border-gray-800">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={onToggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <span className="text-sm text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default VideoControls;