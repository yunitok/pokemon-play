import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { SnorlaxScene } from './scenes/SnorlaxScene';
import { ShopScene } from './scenes/ShopScene';

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

window.playTone = (freq = 440, type = 'sine', duration = 0.1) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Audio play failed', e);
    }
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
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, SnorlaxScene, ShopScene]
};

const game = new Phaser.Game(config);
