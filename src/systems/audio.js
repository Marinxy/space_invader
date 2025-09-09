import { GAME_CONFIG } from '../core/game-engine.js';

export class AudioSystem {
    constructor(settings) {
        this.settings = settings;
        this.initializeAudio();
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.backgroundMusic = null;
            this.musicPlaying = false;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.audioContext = null;
        }
    }
    
    // Modern audio system with better organization
    startBackgroundMusic() {
        if (this.musicPlaying || !this.settings.musicEnabled || !this.audioContext) return;
        
        this.musicPlaying = true;
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = GAME_CONFIG.audio.musicVolume;
        this.musicGain.connect(this.audioContext.destination);
        
        this.playMelody();
    }
    
    playMelody() {
        if (!this.musicPlaying || !this.settings.musicEnabled) return;
        
        const melody = [
            { freq: 261.63, duration: 0.25 }, // C4
            { freq: 293.66, duration: 0.25 }, // D4
            { freq: 329.63, duration: 0.25 }, // E4
            { freq: 349.23, duration: 0.5 },  // F4
            { freq: 392.00, duration: 0.25 }, // G4
            { freq: 440.00, duration: 0.5 },  // A4
        ];
        
        const note = melody[Math.floor(Math.random() * melody.length)];
        this.playMusicNote(note.freq, note.duration);
        
        // Add harmonic bass note occasionally
        if (Math.random() < 0.3) {
            this.playMusicNote(note.freq * 0.5, note.duration * 1.5, 'triangle', 0.05);
        }
        
        // Schedule next note with some variation
        const nextDelay = (note.duration + Math.random() * 0.3) * 1000;
        setTimeout(() => this.playMelody(), nextDelay);
    }
    
    playMusicNote(frequency, duration, type = 'square', volume = 0.15) {
        if (!this.audioContext || !this.musicGain) return;
        
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.musicGain);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        
        const currentTime = this.audioContext.currentTime;
        noteGain.gain.setValueAtTime(0, currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
    }
    
    stopBackgroundMusic() {
        this.musicPlaying = false;
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
    }
    
    playSound(frequency, duration, type = 'square', volume = GAME_CONFIG.audio.effectVolume) {
        if (!this.settings.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Enhanced sound types with better filters
            const soundConfig = {
                square: { type: 'square', filterFreq: 2000, filterQ: 1 },
                sawtooth: { type: 'sawtooth', filterFreq: 1500, filterQ: 0.5 },
                triangle: { type: 'triangle', filterFreq: 1000, filterQ: 0.7 },
                sine: { type: 'sine', filterFreq: 800, filterQ: 0.3 }
            };
            
            const config = soundConfig[type] || soundConfig.square;
            oscillator.type = config.type;
            oscillator.frequency.value = frequency;
            
            filter.type = 'lowpass';
            filter.frequency.value = config.filterFreq;
            filter.Q.value = config.filterQ;
            
            // Enhanced envelope with better attack/decay
            const currentTime = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }
}