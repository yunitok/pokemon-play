import { fadeOutAndSwitch } from './transition';

export class UIHelper {
    /**
     * Creates a standardized circular back button.
     * @param {Phaser.Scene} scene 
     * @param {Function} [callback] - Optional callback. Defaults to fadeOutAndSwitch to 'MenuScene'.
     */
    static createBackButton(scene, callback) {
        const x = 60;
        const y = 50;
        
        const container = scene.add.container(x, y).setScrollFactor(0).setDepth(100);
        const bg = scene.add.circle(0, 0, 30, 0xffffff, 0.2).setStrokeStyle(2, 0xffffff);
        const arrow = scene.add.text(0, 0, '⬅', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
        
        container.add([bg, arrow]);
        
        bg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (window.playUiSound) window.playUiSound();
                if (callback) {
                    callback();
                } else {
                    fadeOutAndSwitch(scene, 'MenuScene');
                }
            })
            .on('pointerover', () => bg.setFillStyle(0xffffff, 0.4))
            .on('pointerout', () => bg.setFillStyle(0xffffff, 0.2));
            
        return container;
    }

    /**
     * Creates a standardized circular help button.
     * @param {Phaser.Scene} scene 
     * @param {Function} callback - Function to trigger on click (e.g., showHelp).
     */
    static createHelpButton(scene, callback) {
        const x = scene.scale.width - 60;
        const y = 50;

        const container = scene.add.container(x, y).setScrollFactor(0).setDepth(100);
        const bg = scene.add.circle(0, 0, 30, 0x2196F3, 0.8).setStrokeStyle(2, 0xffffff);
        const symbol = scene.add.text(0, 0, '?', { fontSize: '32px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

        container.add([bg, symbol]);

        bg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (window.playUiSound) window.playUiSound();
                if (callback) callback();
            })
            .on('pointerover', () => bg.setFillStyle(0x42A5F5, 1))
            .on('pointerout', () => bg.setFillStyle(0x2196F3, 0.8));

        return container;
    }

    /**
     * Creates a standardized game title.
     * @param {Phaser.Scene} scene 
     * @param {string} text 
     */
    static createTitle(scene, text) {
        const x = scene.scale.width / 2;
        const y = 60;

        return scene.add.text(x, y, text, {
            fontSize: '48px',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            color: '#FFD700',
            stroke: '#3B4CCA',
            strokeThickness: 8,
            fontStyle: 'bold',
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(90);
    }
}
