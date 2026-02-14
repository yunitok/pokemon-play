import { fadeOutAndSwitch } from './transition';
import { audioManager } from '../managers/AudioManager';
import { gameManager } from '../managers/GameManager';

export class UIHelper {
    /**
     * Generates persistent high-quality Canvas textures.
     * Canvas 2D API provides superior anti-aliasing compared to WebGL Graphics for simple shapes.
     * @param {Phaser.Scene} scene 
     */
    static generateTextures(scene) {
        if (scene.textures.exists('ui_button_ring')) return;

        const size = 256;
        const center = size / 2;
        const radius = 110; // Leave padding for glow/stroke
        const lineWidth = 16;

        // 1. Texture: Ring (Border)
        const ringTex = scene.textures.createCanvas('ui_button_ring', size, size);
        const ringCtx = ringTex.getContext();
        
        ringCtx.clearRect(0, 0, size, size);
        ringCtx.beginPath();
        ringCtx.arc(center, center, radius, 0, Math.PI * 2);
        ringCtx.lineWidth = lineWidth;
        ringCtx.strokeStyle = '#ffffff';
        ringCtx.stroke();
        
        ringTex.refresh();

        // 2. Texture: Fill (Body)
        const fillTex = scene.textures.createCanvas('ui_button_fill', size, size);
        const fillCtx = fillTex.getContext();

        fillCtx.clearRect(0, 0, size, size);
        fillCtx.beginPath();
        fillCtx.arc(center, center, radius, 0, Math.PI * 2);
        fillCtx.fillStyle = '#ffffff';
        fillCtx.fill();

        fillTex.refresh();
    }

    /**
     * Creates a standardized circular back button.
     * @param {Phaser.Scene} scene 
     * @param {Function} [callback] - Optional callback. Defaults to fadeOutAndSwitch to 'MenuScene'.
     */
    static createBackButton(scene, callback) {
        UIHelper.generateTextures(scene);
        const x = 60;
        const y = 50;
        
        const container = scene.add.container(x, y).setScrollFactor(0).setDepth(100);
        
        // Target Size: 60px. Texture Size: 256px.
        // Scale: 60 / 256 ≈ 0.235
        const scale = 60 / 256;

        // 1. Background Fill (Transparent White)
        const bgFill = scene.add.image(0, 0, 'ui_button_fill')
            .setScale(scale)
            .setAlpha(0.2)
            .setTint(0xffffff);

        // 2. Border Ring (Solid White)
        const bgRing = scene.add.image(0, 0, 'ui_button_ring')
            .setScale(scale)
            .setTint(0xffffff);

        const arrow = scene.add.text(0, -2, '⬅', { 
            fontSize: '34px', 
            color: '#fff',
            fontFamily: '"Fredoka One", cursive' // New Font
        }).setOrigin(0.5);
        
        container.add([bgFill, bgRing, arrow]);
        
        // Interaction
        bgFill.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                audioManager.playUiSound();
                if (callback) {
                    callback();
                } else {
                    fadeOutAndSwitch(scene, 'MenuScene');
                }
            })
            .on('pointerover', () => {
                bgFill.setAlpha(0.4);
                container.setScale(1.05); // Subtle pop effect
            })
            .on('pointerout', () => {
                bgFill.setAlpha(0.2);
                container.setScale(1);
            });
            
        return container;
    }

    /**
     * Creates a standardized circular help button.
     * @param {Phaser.Scene} scene 
     * @param {Function} callback - Function to trigger on click (e.g., showHelp).
     */
    static createHelpButton(scene, callback) {
        UIHelper.generateTextures(scene);
        const x = scene.scale.width - 60;
        const y = 50;

        const container = scene.add.container(x, y).setScrollFactor(0).setDepth(100);
        const scale = 60 / 256;

        // 1. Background Fill (Blue)
        const bgFill = scene.add.image(0, 0, 'ui_button_fill')
            .setScale(scale)
            .setAlpha(0.8)
            .setTint(0x2196F3); 

        // 2. Border Ring (White)
        const bgRing = scene.add.image(0, 0, 'ui_button_ring')
            .setScale(scale)
            .setTint(0xffffff);

        const symbol = scene.add.text(0, 0, '?', { 
            fontSize: '32px', 
            fontStyle: 'bold', 
            color: '#fff',
            fontFamily: '"Fredoka One", cursive' // New Font
        }).setOrigin(0.5);

        container.add([bgFill, bgRing, symbol]);

        // Interaction
        bgFill.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                audioManager.playUiSound();
                if (callback) callback();
            })
            .on('pointerover', () => {
                bgFill.setTint(0x42A5F5).setAlpha(1);
                container.setScale(1.05);
            })
            .on('pointerout', () => {
                bgFill.setTint(0x2196F3).setAlpha(0.8);
                container.setScale(1);
            });

        return container;
    }

    /**
     * Creates a standardized game title.
     * @param {Phaser.Scene} scene 
     * @param {string} text 
     */
    static createTitle(scene, text) {
        const x = scene.scale.width / 2;
        const y = 50; // Standardized Y

        return scene.add.text(x, y, text, {
            fontSize: '48px',
            fontFamily: '"Fredoka One", cursive',
            color: '#FFD700',
            stroke: '#3B4CCA',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(90);
    }

    /**
     * Creates a standardized full header with Back Btn, Level, Title, and Help Btn.
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     * @param {string} config.title - Title text
     * @param {boolean} [config.showLevel=true] - Whether to show level text
     * @param {string} [config.helpText] - Text to show in help dialog. If omitted, no help button.
     * @param {Function} [config.onBack] - Custom back action.
     */
    static createHeader(scene, config) {
        const { title, showLevel = true, helpText, onBack } = config;

        // 1. Back Button
        this.createBackButton(scene, onBack);

        // 2. Title (Created before Level to ensure depth order if needed, though depth handles it)
        if (title) {
            this.createTitle(scene, title);
        }

        // 3. Help Button
        const helpBtnX = scene.scale.width - 60;
        if (helpText) {
            this.createHelpButton(scene, () => {
                if (scene.showHelp) {
                    scene.showHelp(helpText);
                } else {
                    console.warn('Scene missing showHelp method');
                }
            });
        }

        // 4. Level Text (Below Help Button, smaller)
        if (showLevel) {
             const level = (scene.gameManager && scene.gameManager.level) || 
                          (window.gameManager && window.gameManager.level) || 1; 
             
             // Position below help button (which is at Y=50)
             // If no help button, still keep it top right? Yes.
             const levelY = helpText ? 95 : 50; 
             
             scene.add.text(helpBtnX, levelY, `Lvl ${level}`, {
                fontSize: '20px', 
                fontFamily: '"Fredoka One", cursive', 
                color: '#FFD700', 
                stroke: '#000', 
                strokeThickness: 4
            }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(90);
        }
    }
}
