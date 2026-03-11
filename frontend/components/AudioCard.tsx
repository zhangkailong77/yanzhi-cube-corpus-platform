import React, { useEffect, useMemo, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { AudioLines, CirclePause, CirclePlay, Copy, Mic2 } from 'lucide-react';

interface AudioCardProps {
  audio: {
    audio_id: string;
    audio_url: string;
    transcript?: string;
    duration_seconds?: string;
    language?: string;
  };
}

const AudioCard: React.FC<AudioCardProps> = ({ audio }) => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const backendBase = apiBase.replace(/\/api\/?$/, '');
  const resolvedAudioUrl = audio.audio_url.startsWith('http')
    ? audio.audio_url
    : `${backendBase}${audio.audio_url.startsWith('/') ? '' : '/'}${audio.audio_url}`;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const displayTranscript = useMemo(
    () => audio.transcript || 'No transcript available.',
    [audio.transcript]
  );

  const formatTime = (seconds: number): string => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !waveformRef.current || waveSurferRef.current) return;

    const wave = WaveSurfer.create({
      container: waveformRef.current,
      url: resolvedAudioUrl,
      waveColor: '#d7deea',
      progressColor: '#2563eb',
      cursorColor: 'transparent',
      barWidth: 5,
      barGap: 3,
      barRadius: 10,
      height: 54,
      normalize: true,
      dragToSeek: true,
    });

    wave.on('ready', () => {
      setIsReady(true);
      setDuration(wave.getDuration());
    });
    wave.on('play', () => setIsPlaying(true));
    wave.on('pause', () => setIsPlaying(false));
    wave.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(wave.getDuration());
    });
    wave.on('timeupdate', (time: number) => {
      setCurrentTime(time);
    });

    waveSurferRef.current = wave;

    return () => {
      wave.destroy();
      waveSurferRef.current = null;
    };
  }, [isVisible, resolvedAudioUrl]);

  const handlePlayPause = async (): Promise<void> => {
    const wave = waveSurferRef.current;
    if (!wave || !isReady) return;
    await wave.playPause();
  };

  return (
    <div ref={cardRef} className="bg-white rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold tracking-wide">
              <AudioLines size={15} />
              AUDIO
            </span>
            <span className="text-slate-400 font-semibold">#{audio.audio_id}</span>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="复制音频ID"
            onClick={() => navigator.clipboard?.writeText(audio.audio_id)}
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isPlaying ? <CirclePause size={24} /> : <CirclePlay size={24} />}
          </button>
          <span className="text-sm font-semibold text-slate-500 w-11 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 min-w-0">
            <div ref={waveformRef} />
          </div>
          <span className="text-sm font-semibold text-slate-500 w-11">{formatTime(duration)}</span>
        </div>

        <div className="bg-slate-50 rounded-xl px-4 py-4 border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold mb-2">
            <Mic2 size={14} />
            Speaker A
          </div>
          <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
            {displayTranscript}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioCard;
