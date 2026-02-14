export class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }
        AudioManager.instance = this;

        this.ctx = null;
        this.isMuted = false;
        
        // Initialize logic for web synth
        this.initContext();
    }

    initContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        } catch(e) {
            console.warn('AudioContext not supported');
        }
    }

    playTone(freq = 440, type = 'sine', duration = 0.1, vol = 0.1) {
        if (this.isMuted || !this.ctx) return;

        try {
            // Resume if suspended (browser autoplay policy)
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;
            
            // Envelope
            osc.start(now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now + 0.01); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay
            
            osc.stop(now + duration);

            // Simple cleanup
            setTimeout(() => {
                // disconnecting nodes is usually enough for GC
                osc.disconnect();
                gain.disconnect();
            }, duration * 1000 + 100);

        } catch (e) {
            console.warn('Audio play failed', e);
        }
    }

    // High level abstractions
    playUiSound() {
        // "Nintendo" Ding: 880Hz sine
        this.playTone(880, 'sine', 0.15, 0.1);
    }

    playWinSound() {
        // Ascending major arpeggio
        if (!this.ctx) return;
        this.playTone(523.25, 'square', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.1, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.1), 200); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.4, 0.1), 400); // C6
    }

    playLoseSound() {
        // Descending dissonant
        if (!this.ctx) return;
        this.playTone(150, 'sawtooth', 0.4, 0.2);
        // Harmony/Dissonance handled in complex tone? 
        // Keeping it simple for now, can expand if needed.
    }

    playClick() {
        this.playTone(400, 'triangle', 0.05, 0.1);
    }
}

export const audioManager = new AudioManager();
