import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  audioUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  autoPlayAfterLoad?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onPlay,
  onPause,
  onEnded,
  autoPlayAfterLoad = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<string>("");
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Process the audio URL to make it web-compatible
  const processAudioUrl = (url: string): string => {
    const isLocalFilePath = url.startsWith('F:') || url.startsWith('C:') || url.startsWith('D:') || 
                           url.startsWith('file:') || url.includes(':\\');
    
    if (isLocalFilePath) {
      const filename = url.split(/[\/\\]/).pop();
      // Don't set the audioInfo for local files
      return `http://backend.abspak.com/uploads/${filename}`;
    }
    
    if (url.startsWith('uploads/')) {
      return `http://backend.abspak.com/${url}`;
    }
    
    // Only set audioInfo for external URLs
    if (url.startsWith('http')) {
      setAudioInfo(url);
    }
    return url;
  };

  // Calculate the processed URL only once when the component mounts or when audioUrl changes
  const processedAudioUrl = React.useMemo(() => processAudioUrl(audioUrl), [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only set audio source if we haven't loaded it yet
    if (!audioLoaded) {
      console.log("Loading audio from URL:", processedAudioUrl);
      audio.src = processedAudioUrl;
      setAudioLoaded(true);
      
      setTimeout(() => {
        audio.load();
      }, 100);
    }
  }, [processedAudioUrl, audioLoaded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedData = () => {
      setDuration(audio.duration);
      setLoading(false);
      setError(null);
      console.log("Audio loaded successfully, duration:", audio.duration);
      if (autoPlayAfterLoad) handlePlayPause();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    const handleError = (e: Event) => {
      console.error("Audio loading error:", e);
      setLoading(false);
      setError("Failed to load audio file. The audio file might be a local file that needs to be served through your API server.");
      toast({
        title: "Audio Error",
        description: "Could not load the audio file. Please ensure the file is accessible via your API server.",
        variant: "destructive",
      });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [processedAudioUrl, autoPlayAfterLoad, onEnded, retryCount]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        if (onPlay) onPlay();
      }).catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback Error",
          description: "Could not play the audio. Please try again.",
          variant: "destructive",
        });
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolume = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    setAudioLoaded(false); // Reset the loaded state

    const audio = audioRef.current;
    if (audio) {
      // Add a cache buster to the URL
      const cacheBuster = `?v=${Date.now()}`;
      const newUrl = processedAudioUrl.includes('?') 
        ? processedAudioUrl 
        : processedAudioUrl + cacheBuster;
      
      console.log("Retrying with URL:", newUrl);
      audio.src = newUrl;
      
      setTimeout(() => {
        audio.load();
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-xl border border-gray-200 p-4 subtle-shadow"
    >
      <audio ref={audioRef} preload="auto" />

      {error ? (
        <div className="text-red-500 p-4 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Only show audioInfo if it's an external URL */}
          {audioInfo.startsWith('http') && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs truncate block max-w-full">
                {audioInfo}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1 px-2">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                disabled={loading}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 w-16">
              {formatTime(currentTime)}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={() => skip(-10)}
                disabled={loading}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="rounded-full h-12 w-12 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handlePlayPause}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-5 w-5 border-2 border-white border-opacity-30 border-t-white rounded-full"
                  />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={() => skip(10)}
                disabled={loading}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2 w-36">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 hover:bg-gray-100"
                onClick={toggleMute}
                disabled={loading}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-gray-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-gray-500" />
                )}
              </Button>

              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolume}
                disabled={loading}
                className="w-24"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AudioPlayer; 