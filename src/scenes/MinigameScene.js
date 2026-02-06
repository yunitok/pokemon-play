import { fadeOutAndSwitch } from '../utils/transition';
import { UIHelper } from '../utils/UIHelper';

export class MinigameScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        // We can't know the title here easily unless passed, 
        // but we can set a default or let subclass set it.
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Common background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg_game');

        // Standard Back Button
        UIHelper.createBackButton(this, () => this.returnToMenu());

        // Note: Title is not created here because it varies per game.
        // Subclasses should call UIHelper.createTitle(this, 'Title');
    }

    returnToMenu() {
        fadeOutAndSwitch(this, 'MenuScene');
    }

    addHelp(helpText) {
        // Standard Help Button
        UIHelper.createHelpButton(this, () => this.showHelp(helpText));
    }

    showHelp(text) {
        const container = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);
        
        // Background overlay
        const bg = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
            .setInteractive(); // Block clicks below
            
        // 1. Setup Content Width
        const boxW = 650;
        const padding = 30;
        const internalWidth = boxW - (padding * 2);
        
        // 2. Create Text Objects FIRST to measure
        // Title
        const title = this.add.text(0, 0, 'AYUDA', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFD700'
        }).setOrigin(0.5);

        // Content Text
        const content = this.add.text(0, 0, text, {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: internalWidth },
            lineSpacing: 8
        }).setOrigin(0.5);

        // Close Button
        const closeBtn = this.add.text(0, 0, 'ENTENDIDO', {
            fontSize: '28px',
            backgroundColor: '#4CAF50',
            padding: { x: 30, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // 3. Calculate Heights & Positions
        const gapTitle = 20;
        const gapBtn = 30;
        
        // Total Height Calculation
        const totalContentHeight = title.height + gapTitle + content.height + gapBtn + closeBtn.height;
        const boxH = totalContentHeight + (padding * 2);
        
        // Center Position
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // 4. Draw Box
        const box = this.add.rectangle(centerX, centerY, boxW, boxH, 0x333333).setStrokeStyle(4, 0xffffff);
        
        // 5. Position Elements relative to CenterY
        // Start Y (Top of content)
        const startY = centerY - (totalContentHeight / 2);
        
        title.setPosition(centerX, startY + title.height/2);
        content.setPosition(centerX, title.y + title.height/2 + gapTitle + content.height/2);
        closeBtn.setPosition(centerX, content.y + content.height/2 + gapBtn + closeBtn.height/2);

        // Close Interaction
        closeBtn.on('pointerdown', () => {
             if (window.playUiSound) window.playUiSound();
            this.tweens.add({
                targets: container,
                scaleX: 0, scaleY: 0,
                duration: 200,
                onComplete: () => container.destroy()
            });
        });
        
        // Add to Container
        container.add([bg, box, title, content, closeBtn]);
        
        // Animation
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1, scaleY: 1,
            duration: 200,
            ease: 'Back.out'
        });
    }

    showFeedback(success, x, y) {
        if (success) {
            // Ding sound
            if (window.playTone) window.playTone(880, 'sine', 0.1);
            
            // Stars particle effect (simplified)
            const star = this.add.text(x || this.input.x, y || this.input.y, '⭐', { fontSize: '64px' }).setOrigin(0.5).setDepth(200);
            this.tweens.add({
                targets: star,
                y: star.y - 100,
                alpha: 0,
                duration: 1000,
                onComplete: () => star.destroy()
            });
        } else {
            // Error sound
            if (window.playTone) window.playTone(150, 'sawtooth', 0.3);
            this.cameras.main.shake(200, 0.01);
        }
    }

    completeMinigame(reward) {
        // Victory fanfare
        if (window.playTone) {
            window.playTone(523, 'square', 0.1);
            setTimeout(() => window.playTone(659, 'square', 0.1), 100);
            setTimeout(() => window.playTone(784, 'square', 0.2), 200);
            setTimeout(() => window.playTone(1046, 'square', 0.4), 400);
        }

        const msg = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, `¡Ganaste ${reward} monedas!`, {
            fontSize: '64px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 20 }
        }).setOrigin(0.5).setDepth(200);

        if (window.updateGlobalCoins) {
            window.updateGlobalCoins(reward);
        }

        this.time.delayedCall(3000, () => {
            this.returnToMenu();
        });
    }

    createCoinVisual(x, y, value) {
        const container = this.add.container(x, y);
        let radius = 30;
        let color = 0xcd7f32; // Bronze default
        let text = '';
        let strokeColor = 0x000000;

        // Determine properties based on value
        if (Math.abs(value - 0.01) < 0.001) { text = '1c'; radius = 25; color = 0xb87333; }
        else if (Math.abs(value - 0.02) < 0.001) { text = '2c'; radius = 28; color = 0xb87333; }
        else if (Math.abs(value - 0.05) < 0.001) { text = '5c'; radius = 30; color = 0xb87333; }
        else if (Math.abs(value - 0.10) < 0.001) { text = '10c'; radius = 28; color = 0xffd700; }
        else if (Math.abs(value - 0.20) < 0.001) { text = '20c'; radius = 30; color = 0xffd700; }
        else if (Math.abs(value - 0.50) < 0.001) { text = '50c'; radius = 32; color = 0xffd700; }
        else if (Math.abs(value - 1.00) < 0.001) { text = '1€'; radius = 32; color = 0xc0c0c0; strokeColor = 0xffd700; } // Silver with Gold rim
        else if (Math.abs(value - 2.00) < 0.001) { text = '2€'; radius = 35; color = 0xffd700; strokeColor = 0xc0c0c0; } // Gold with Silver rim

        const circle = this.add.circle(0, 0, radius, color);
        circle.setStrokeStyle(4, strokeColor);
        
        // Special bicolor effect for 1e and 2e
        if (Math.abs(value - 1.00) < 0.001 || Math.abs(value - 2.00) < 0.001) {
            const inner = this.add.circle(0, 0, radius * 0.7, Math.abs(value - 1.00) < 0.001 ? 0xffd700 : 0xc0c0c0);
            container.add([circle, inner]);
        } else {
            container.add(circle);
        }

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        container.add(label);
        
        container.setSize(radius * 2, radius * 2);
        
        // Add data for logic
        container.setData('value', value);
        
        return container;
    }
}
