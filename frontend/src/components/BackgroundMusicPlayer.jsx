import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

export default function BackgroundMusicPlayer({ musicConfig }) {
  const { enabled, url, volume = 0.5 } = musicConfig || {};

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Sync volume prop changes
  useEffect(() => {
    if (musicConfig?.volume !== undefined) {
      setCurrentVolume(musicConfig.volume);
      if (audioRef.current) {
        audioRef.current.volume = musicConfig.volume;
      }
    }
  }, [musicConfig?.volume]);

  // Handle music initialization and URL changes
  useEffect(() => {
    if (!enabled || !url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setAutoplayBlocked(false);
      return;
    }

    setAudioError(false);
    setAutoplayBlocked(false);

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = currentVolume;
    audioRef.current = audio;

    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (err) {
        // Autoplay was blocked by browser policy
        setIsPlaying(false);
        setAutoplayBlocked(true);
      }
    };

    attemptAutoplay();

    audio.onerror = () => {
      setAudioError(true);
      setIsPlaying(false);
    };

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [enabled, url]);

  const togglePlay = async () => {
    if (!audioRef.current || audioError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (err) {
        setAutoplayBlocked(true);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.muted = newMuteState;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  if (!enabled || !url || audioError) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color)',
        padding: '8px 14px',
        borderRadius: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Music 
          size={16} 
          color="var(--accent-primary)" 
          className={isPlaying ? 'pulse' : ''} 
        />
        <span style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Music
        </span>
      </div>

      {autoplayBlocked && !isPlaying ? (
        <button
          onClick={togglePlay}
          className="btn btn-primary"
          style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
            lineHeight: 1
          }}
        >
          ▶ Play Music
        </button>
      ) : (
        <button
          onClick={togglePlay}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? <Pause size={18} color="var(--accent-primary)" /> : <Play size={18} color="var(--accent-primary)" />}
        </button>
      )}

      <button
        onClick={toggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={18} color="var(--accent-rose)" /> : <Volume2 size={18} color="var(--text-muted)" />}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={isMuted ? 0 : currentVolume}
        onChange={handleVolumeChange}
        style={{
          width: '60px',
          height: '4px',
          accentColor: 'var(--accent-primary)',
          cursor: 'pointer'
        }}
        title={`Volume: ${Math.round((isMuted ? 0 : currentVolume) * 100)}%`}
      />
    </div>
  );
}
