import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { SnorlaxScene } from './scenes/SnorlaxScene';
import { ShopScene } from './scenes/ShopScene';
import { SilhouetteScannerScene } from './scenes/SilhouetteScannerScene';
import { DiglettCounterScene } from './scenes/DiglettCounterScene';
import { MeowthChangeScene } from './scenes/MeowthChangeScene';
import { ChanseyMarketScene } from './scenes/ChanseyMarketScene';

// Simple Audio Synth Helper
// Game State Management
const InitialState = {
    coins: 500,
    level: 1,
    inventory: {
        potion: 0,
        pokeball: 0
    },
    highScore: 0
};

// Load from LocalStorage or use Initial
const savedState = localStorage.getItem('pokemonPlayState');
window.GameState = savedState ? JSON.parse(savedState) : JSON.parse(JSON.stringify(InitialState));

// Save Helper
window.saveGame = () => {
    localStorage.setItem('pokemonPlayState', JSON.stringify(window.GameState));
};

// Reset Helper (for debugging or new game)
window.resetGame = () => {
    window.GameState = JSON.parse(JSON.stringify(InitialState));
    window.saveGame();
    location.reload();
};

window.updateGlobalCoins = (amount) => {
    if (!window.GameState) return;
    window.GameState.coins += amount;
    window.saveGame();
    console.log(`Global coins updated: ${window.GameState.coins} (+${amount})`);
};

window.playTone = (freq = 440, type = 'sine', duration = 0.1) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        // Create context only if needed (or reuse a global one if performance became an issue, 
        // but for a menu click new AudioContext is usually fine or browsers handle it).
        // note: modern browsers rarely allow unlimited AudioContexts, so best to try/catch.
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        
        // Envelope for a nicer "ding"
        osc.start(now);
        
        // Attack
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        
        // Decay/Release
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.stop(now + duration);
        
        // Cleanup
        setTimeout(() => {
            if(ctx.state !== 'closed') ctx.close();
        }, duration * 1000 + 100);

    } catch (e) {
        console.warn('Audio play failed', e);
    }
};

window.playUiSound = () => {
    // A nice high-pitch "ding" (Coin/Select style)
    // 880Hz is a high A, 1200Hz is crisp. Let's try a pleasant mixture or just a clean tone.
    // 900Hz sine wave with 0.15s duration is usually quite "Nintendo-like"
    window.playTone(880, 'sine', 0.15);
};

window.playGameOverSound = () => {
    // sophisticated "Loss" sound: deeply descending sawtooth with vibrato/dissonance
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const now = ctx.currentTime;
        
        // Oscillator 1: Main descending tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(40, now + 0.8); // Drop nicely
        
        // Oscillator 2: Dissonant harmony (Tri-tone away roughly) for "wrong" feeling
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(100, now); // Lower harmony
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.8);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        // Envelope
        [gain1, gain2].forEach(g => {
            g.gain.setValueAtTime(0.3, now);
            g.gain.linearRampToValueAtTime(0.3, now + 0.5);
            g.gain.linearRampToValueAtTime(0, now + 0.9);
        });
        
        osc1.start(now);
        osc2.start(now);
        
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
        
         setTimeout(() => {
            if(ctx.state !== 'closed') ctx.close();
        }, 1200);
        
    } catch(e) { console.warn('Audio fail', e); }
};

// Background Helper
window.setAppBackground = (color) => {
    document.body.style.backgroundColor = '#000000';
};

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'app',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
    },
    // High DPI Support
    resolution: window.devicePixelRatio,
    scene: [BootScene, MenuScene, SnorlaxScene, ShopScene, SilhouetteScannerScene, DiglettCounterScene, MeowthChangeScene, ChanseyMarketScene]
};

const game = new Phaser.Game(config);
