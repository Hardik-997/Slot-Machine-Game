// Audio Management System for Neon Slots
// Handles background music, sound effects, volume control, and user preferences

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.isMusicMuted = false;
        this.isSfxMuted = false;
        this.initialized = false;

        // Load preferences from localStorage
        this.loadPreferences();

        // Initialize audio context on user interaction
        this.audioContext = null;
        this.musicSource = null;
        this.musicGainNode = null;
    }

    // Initialize Web Audio API (call after user interaction)
    async init() {
        if (this.initialized) return;

        try {
            // Create Audio Context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes for volume control
            this.musicGainNode = this.audioContext.createGain();
            this.sfxGainNode = this.audioContext.createGain();

            this.musicGainNode.connect(this.audioContext.destination);
            this.sfxGainNode.connect(this.audioContext.destination);

            this.updateVolumes();

            // Create sound effects using oscillators and filters
            this.createSynthSounds();

            this.initialized = true;
            console.log('Audio Manager initialized');
        } catch (error) {
            console.warn('Web Audio API not supported, using fallback HTML5 Audio', error);
            this.initFallback();
        }
    }

    // Create synthetic sound effects using Web Audio API
    createSynthSounds() {
        // These are procedural sounds that don't require audio files
        this.soundGenerators = {
            spin: () => this.playSynthSound('spin'),
            click: () => this.playSynthSound('click'),
            win: () => this.playSynthSound('win'),
            lose: () => this.playSynthSound('lose'),
            bigWin: () => this.playSynthSound('bigWin'),
            jackpot: () => this.playSynthSound('jackpot'),
            coin: () => this.playSynthSound('coin')
        };
    }

    // Play synthetic sound effect
    playSynthSound(type) {
        if (this.isSfxMuted || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        switch (type) {
            case 'spin':
                // Spinning reel sound - sweeping frequency
                const spinOsc = ctx.createOscillator();
                const spinGain = ctx.createGain();
                spinOsc.type = 'sine';
                spinOsc.frequency.setValueAtTime(200, now);
                spinOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                spinGain.gain.setValueAtTime(0.3, now);
                spinGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                spinOsc.connect(spinGain);
                spinGain.connect(this.sfxGainNode);
                spinOsc.start(now);
                spinOsc.stop(now + 0.3);
                break;

            case 'click':
                // Button click - short blip
                const clickOsc = ctx.createOscillator();
                const clickGain = ctx.createGain();
                clickOsc.type = 'sine';
                clickOsc.frequency.value = 800;
                clickGain.gain.setValueAtTime(0.2, now);
                clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                clickOsc.connect(clickGain);
                clickGain.connect(this.sfxGainNode);
                clickOsc.start(now);
                clickOsc.stop(now + 0.05);
                break;

            case 'win':
                // Small win - ascending notes
                for (let i = 0; i < 3; i++) {
                    const winOsc = ctx.createOscillator();
                    const winGain = ctx.createGain();
                    winOsc.type = 'sine';
                    winOsc.frequency.value = 400 + (i * 200);
                    winGain.gain.setValueAtTime(0.2, now + i * 0.1);
                    winGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
                    winOsc.connect(winGain);
                    winGain.connect(this.sfxGainNode);
                    winOsc.start(now + i * 0.1);
                    winOsc.stop(now + i * 0.1 + 0.15);
                }
                break;

            case 'lose':
                // Lose - descending tone
                const loseOsc = ctx.createOscillator();
                const loseGain = ctx.createGain();
                loseOsc.type = 'sine';
                loseOsc.frequency.setValueAtTime(300, now);
                loseOsc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
                loseGain.gain.setValueAtTime(0.15, now);
                loseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                loseOsc.connect(loseGain);
                loseGain.connect(this.sfxGainNode);
                loseOsc.start(now);
                loseOsc.stop(now + 0.4);
                break;

            case 'bigWin':
                // Big win - triumphant ascending arpeggio
                const notes = [262, 330, 392, 523, 659]; // C major arpeggio
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.25, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.3);
                    osc.connect(gain);
                    gain.connect(this.sfxGainNode);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.3);
                });
                break;

            case 'jackpot':
                // Jackpot - celebratory fanfare
                const fanfare = [523, 659, 784, 1047]; // High C major
                fanfare.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
                    osc.connect(gain);
                    gain.connect(this.sfxGainNode);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.5);
                });
                break;

            case 'coin':
                // Coin drop - metallic ping
                const coinOsc = ctx.createOscillator();
                const coinGain = ctx.createGain();
                coinOsc.type = 'sine';
                coinOsc.frequency.setValueAtTime(1000, now);
                coinOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                coinGain.gain.setValueAtTime(0.3, now);
                coinGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                coinOsc.connect(coinGain);
                coinGain.connect(this.sfxGainNode);
                coinOsc.start(now);
                coinOsc.stop(now + 0.1);
                break;
        }
    }

    // Fallback to simple HTML5 Audio if Web Audio API not available
    initFallback() {
        this.initialized = true;
        console.log('Using HTML5 Audio fallback');
    }

    // Play background music
    playMusic() {
        if (this.isMusicMuted || !this.initialized) return;

        // Create a simple ambient background using oscillators
        if (this.audioContext && !this.musicSource) {
            this.createAmbientMusic();
        }
    }

    // Create ambient background music
    createAmbientMusic() {
        const ctx = this.audioContext;

        // Create a subtle pad sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc3.type = 'sine';

        // Harmonic drone (C minor chord)
        osc1.frequency.value = 65.41; // C2
        osc2.frequency.value = 77.78; // Eb2
        osc3.frequency.value = 98.00; // G2

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(this.musicGainNode);

        osc1.start();
        osc2.start();
        osc3.start();

        this.musicSource = { osc1, osc2, osc3, filter };
    }

    // Stop background music
    stopMusic() {
        if (this.musicSource) {
            const { osc1, osc2, osc3 } = this.musicSource;
            osc1.stop();
            osc2.stop();
            osc3.stop();
            this.musicSource = null;
        }
    }

    // Update volume levels
    updateVolumes() {
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.isMusicMuted ? 0 : this.musicVolume;
        }
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.isSfxMuted ? 0 : this.sfxVolume;
        }
    }

    // Set music volume (0-1)
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.savePreferences();
    }

    // Set SFX volume (0-1)
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.savePreferences();
    }

    // Toggle music mute
    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        this.updateVolumes();
        this.savePreferences();

        if (this.isMusicMuted) {
            this.stopMusic();
        } else {
            this.playMusic();
        }

        return this.isMusicMuted;
    }

    // Toggle SFX mute
    toggleSfxMute() {
        this.isSfxMuted = !this.isSfxMuted;
        this.updateVolumes();
        this.savePreferences();
        return this.isSfxMuted;
    }

    // Play sound effect by name
    play(soundName) {
        if (!this.initialized) {
            this.init();
        }

        if (this.soundGenerators && this.soundGenerators[soundName]) {
            this.soundGenerators[soundName]();
        }
    }

    // Save preferences to localStorage
    savePreferences() {
        const prefs = {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMusicMuted: this.isMusicMuted,
            isSfxMuted: this.isSfxMuted
        };
        localStorage.setItem('audioPreferences', JSON.stringify(prefs));
    }

    // Load preferences from localStorage
    loadPreferences() {
        const saved = localStorage.getItem('audioPreferences');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.musicVolume = prefs.musicVolume ?? 0.3;
                this.sfxVolume = prefs.sfxVolume ?? 0.5;
                this.isMusicMuted = prefs.isMusicMuted ?? false;
                this.isSfxMuted = prefs.isSfxMuted ?? false;
            } catch (e) {
                console.error('Error loading audio preferences', e);
            }
        }
    }
}

// Create global instance
const audioManager = new AudioManager();

// Auto-initialize on first user interaction
document.addEventListener('click', () => {
    if (!audioManager.initialized) {
        audioManager.init();
        if (!audioManager.isMusicMuted) {
            audioManager.playMusic();
        }
    }
}, { once: true });
