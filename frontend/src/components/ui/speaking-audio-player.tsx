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
  const [retryCount, setRetryCount] = useState(0);

  // Process the audio URL to ensure it's web-accessible
  const processAudioUrl = (url: string): string => {
    if (!url) {
      console.warn('No audio URL provided');
      return '';
    }

    try {
      // Get the base API URL from environment variables or use default
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

      // If it's already a full URL, validate and return it
      if (url.startsWith('http')) {
        const urlObj = new URL(url);
        return urlObj.toString();
      }

      // Extract the filename from the path, handling various path formats
      const matches = url.match(/speaking-submissions[/\\]([^/\\]+)$/);
      if (matches && matches[1]) {
        // Found a speaking submission filename
        return `${baseUrl}/api/speaking-submissions/${matches[1]}`;
      }

      // Clean the path and remove any absolute path segments
      const cleanPath = url
        .replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
        .split('/')
        .filter(segment => 
          !segment.startsWith('.') && 
          !segment.includes(':') && 
          segment !== 'home' &&
          segment !== 'home2' &&
          segment !== 'abspakco' &&
          segment !== 'backend.abspak.com' &&
          segment !== 'uploads' &&
          segment.trim() !== ''
        )
        .join('/');

      // If we have a clean path, construct the URL
      if (cleanPath) {
        return `${baseUrl}/api/${cleanPath}`;
      }

      throw new Error('Invalid audio path');
    } catch (err) {
      console.error('Error processing audio URL:', err);
      return '';
    }
  };

  const processedAudioUrl = React.useMemo(() => {
    const url = processAudioUrl(audioUrl);
    console.log('Processing audio URL:', {
      original: audioUrl,
      processed: url
    });
    return url;
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset states when URL changes
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (!processedAudioUrl) {
      setLoading(false);
      setError('Invalid audio URL');
      return;
    }

    const loadAudio = () => {
      audio.src = processedAudioUrl;
      // Set CORS mode to allow cross-origin requests
      audio.crossOrigin = "anonymous";
      audio.load();
    };

    loadAudio();

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
      console.log("Audio metadata loaded successfully:", {
        duration: audio.duration,
        url: processedAudioUrl
      });
    };

    const handleLoadedData = () => {
      setLoading(false);
      setError(null);
      console.log("Audio data loaded successfully");
      if (autoPlayAfterLoad) {
        handlePlayPause();
      }
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      console.error("Audio loading error:", {
        error: audioElement.error,
        url: processedAudioUrl,
        networkState: audioElement.networkState,
        readyState: audioElement.readyState,
        errorCode: audioElement.error?.code,
        errorMessage: audioElement.error?.message
      });

      setLoading(false);
      
      let errorMessage = "Failed to load audio. ";
      
      // Check if the format is WebM
      if (processedAudioUrl.toLowerCase().endsWith('.webm')) {
        errorMessage = "WebM audio format is not fully supported in all browsers. Please convert the audio to MP3 format. ";
      } else if (audioElement.error) {
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage += "The loading was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage += "A network error occurred. Please check your connection.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage += "The audio file is corrupted or in an unsupported format.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage += "The audio format is not supported or the file was not found.";
            break;
          default:
            errorMessage += "Please try again or contact support if the issue persists.";
        }
      }

      setError(errorMessage);
      
      if (retryCount === 0) {
        toast({
          title: "Audio Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    });

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.removeEventListener("ended", () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      });
    };
  }, [processedAudioUrl, autoPlayAfterLoad, onEnded, retryCount]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if (onPause) onPause();
      } else {
        await audio.play();
        setIsPlaying(true);
        if (onPlay) onPlay();
      }
    } catch (err) {
      console.error("Playback error:", err);
      toast({
        title: "Playback Error",
        description: "Could not play the audio. Please try again.",
        variant: "destructive",
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
    
    const audio = audioRef.current;
    if (audio) {
      // Add a cache buster
      const cacheBuster = `?v=${Date.now()}`;
      const newUrl = processedAudioUrl.includes('?') 
        ? processedAudioUrl 
        : `${processedAudioUrl}${cacheBuster}`;
      
      console.log("Retrying with URL:", newUrl);
      audio.src = newUrl;
      audio.load();
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
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Loading
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
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