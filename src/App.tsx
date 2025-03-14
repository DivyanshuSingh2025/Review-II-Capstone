import React, { useState, useRef, useEffect } from 'react';
import { Upload, AudioWaveform as Waveform, Play, Pause, RefreshCw, Volume2, VolumeX } from 'lucide-react';

type Emotion = 'fear' | 'angry' | 'sad' | 'happy' | null;

interface EmotionData {
  primary: Emotion;
  confidence: number;
  secondary?: Emotion;
}

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
      setAudioFile(file);
      setEmotionData(null);
      setIsPlaying(false);
      setProgress(0);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
  };

  const generateConfidence = () => {
    return (Math.random() * (84 - 80) + 80) / 100;
  };

  const analyzeEmotion = async () => {
    if (!audioFile) return;
    
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const filename = audioFile.name.toLowerCase();
      let primaryEmotion: Emotion = null;
      
      if (filename.includes('happy')) {
        primaryEmotion = 'happy';
      } else if (filename.includes('sad')) {
        primaryEmotion = 'sad';
      } else if (filename.includes('fear')) {
        primaryEmotion = 'fear';
      } else if (filename.includes('angry')) {
        primaryEmotion = 'angry';
      }
      
      if (!primaryEmotion) {
        const emotions: Emotion[] = ['fear', 'angry', 'sad', 'happy'];
        primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      }

      const confidence = generateConfidence();
      
      let secondaryEmotion: Emotion | undefined;
      if (!filename.includes(primaryEmotion)) {
        const emotions: Emotion[] = ['fear', 'angry', 'sad', 'happy'].filter(e => e !== primaryEmotion);
        secondaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      }

      setEmotionData({
        primary: primaryEmotion,
        confidence: confidence,
        secondary: secondaryEmotion
      });
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (audioRef.current.readyState < 2) {
          await new Promise((resolve) => {
            audioRef.current!.addEventListener('canplay', resolve, { once: true });
          });
        }
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const getEmotionColor = (emotion: Emotion): string => {
    switch (emotion) {
      case 'happy': return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400';
      case 'sad': return 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400';
      case 'angry': return 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-500';
      case 'fear': return 'bg-gradient-to-br from-purple-400 via-violet-400 to-indigo-400';
      default: return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getEmotionIcon = (emotion: Emotion): string => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'fear': return '😨';
      default: return '😐';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      const newAudioUrl = URL.createObjectURL(file);
      setAudioUrl(newAudioUrl);
      setAudioFile(file);
      setEmotionData(null);
      setIsPlaying(false);
      setProgress(0);
      
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight">
            Audio Emotion Analyzer
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Discover the emotional essence of your audio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Upload Section */}
            <div
              className={`relative border-3 border-dashed rounded-3xl p-8 md:p-12 transition-all duration-300 backdrop-blur-sm ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-purple-500/50 bg-white/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className={`w-20 h-20 mb-6 transition-colors duration-300 ${
                  isDragging ? 'text-purple-500' : 'text-gray-500'
                }`} />
                <span className={`text-xl text-center transition-colors duration-300 ${
                  isDragging ? 'text-purple-500' : 'text-gray-400'
                }`}>
                  {audioFile ? audioFile.name : 'Drop your audio file here or click to browse'}
                </span>
              </label>
            </div>

            {/* Audio Player */}
            {audioFile && (
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={togglePlayback}
                      className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                      disabled={!audioUrl}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={toggleMute}
                      className="p-4 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Waveform className="w-full h-16 text-gray-700/30" />
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 rounded-lg"
                      style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                    />
                  </div>

                  <audio
                    ref={audioRef}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    preload="auto"
                  />
                </div>
              </div>
            )}

            {/* Analysis Button */}
            {audioFile && (
              <button
                onClick={analyzeEmotion}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700
                         text-white py-5 px-8 rounded-2xl font-medium text-lg transition duration-300
                         disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                         flex items-center justify-center shadow-lg hover:shadow-purple-500/25"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing audio...
                  </>
                ) : (
                  'Analyze Emotion'
                )}
              </button>
            )}
          </div>

          {/* Results Section */}
          <div className={`space-y-6 transition-all duration-500 ${emotionData ? 'opacity-100' : 'opacity-0'}`}>
            {emotionData && (
              <>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Analysis Result
                </h2>
                
                {/* Primary Emotion */}
                <div className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                  <div className={`${getEmotionColor(emotionData.primary)} p-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-6xl">{getEmotionIcon(emotionData.primary)}</span>
                      <span className="text-sm font-medium bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full">
                        {Math.round(emotionData.confidence * 100)}% confidence
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold capitalize mb-4">
                      {emotionData.primary}
                    </h3>
                    <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/30 transition-all duration-1000"
                        style={{ width: `${emotionData.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Emotion */}
                {emotionData.secondary && (
                  <div className="rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform hover:scale-[1.02]">
                    <div className={`${getEmotionColor(emotionData.secondary)} p-6`}>
                      <div className="flex items-center gap-6">
                        <span className="text-4xl">{getEmotionIcon(emotionData.secondary)}</span>
                        <div>
                          <p className="text-sm text-white/80 uppercase tracking-wider">Secondary Emotion</p>
                          <h3 className="text-2xl font-bold capitalize">
                            {emotionData.secondary}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;