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

// Managers
import { gameManager } from './managers/GameManager';
import { audioManager } from './managers/AudioManager';

// Expose Managers for Debugging (Optional)
window.GameApp = {
    gameManager,
    audioManager
};

// Background Helper (Moved to a cleaner spot later, but safe here for now)
window.setAppBackground = (color) => {
    document.body.style.backgroundColor = color || '#000000';
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
