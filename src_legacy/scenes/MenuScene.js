class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        if (window.logToScreen) window.logToScreen('MenuScene.create: Entrando al menú principal');
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0); // Sky Blue

        // Title
        const titleText = this.add.text(width / 2, 80, 'PokemonPlay', {
            fontFamily: 'sans-serif',
            fontSize: '64px',
            color: '#FFCB05',
            stroke: '#3B4CCA',
            strokeThickness: 8,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Simple Tween for title
        this.tweens.add({
            targets: titleText,
            y: 90,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Button 1: Tienda (Placeholder)
        this.createButton(width / 2, 250, 'Tienda Pokémon', 0xFFA500, () => {
            // Placeholder for Shop Game
            console.log('Tienda clicked');
            // For now, shake button to show it's "locked" or just log
            const coins = this.sound.add('coins');
            coins.play();
        });

        // Button 2: Snorlax Game
        this.createButton(width / 2, 380, 'El Misterio de Snorlax', 0x4CAF50, () => {
            this.scene.start('SnorlaxScene');
        });

        // Global Music
        /*
        if (!this.sound.get('music')) {
            const music = this.sound.add('music', { loop: true, volume: 0.5 });
            music.play();
        }
        */

        // Mute Button (Simple text toggle for now)
        // this.createMuteButton();
    }

    createButton(x, y, text, color, callback) {
        const btnContainer = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 300, 80, color, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff);
        
        // Rounded effect via graphics if needed, but rectangle is faster for now. 
        // Let's stick to rectangle for code brevity or use graphics for rounded corners.
        // Actually, let's use a nice rounded rect.
        bg.setVisible(false); // Hide the hit area rect

        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.lineStyle(4, 0xffffff, 1);
        graphics.fillRoundedRect(-150, -40, 300, 80, 15);
        graphics.strokeRoundedRect(-150, -40, 300, 80, 15);
        
        const label = this.add.text(0, 0, text, {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnContainer.add([bg, graphics, label]); // helper hit area (bg) first but invisible? 
        // Actually, Phaser interactive on graphics can be tricky with hit areas.
        // Easiest: use the rectangle 'bg' as hit area but make it invisible and draw graphics behind.
        
        // Fix: Make bg visible but alpha 0.01 for hit test
        bg.setVisible(true);
        bg.setAlpha(0.01);
        graphics.setDepth(-1); // behind text and bg

        btnContainer.add(bg); // Add hit area
        btnContainer.sendToBack(graphics); // Draw decoration behind

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: btnContainer,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: callback
            });
        });

        bg.on('pointerover', () => {
             graphics.clear();
             graphics.fillStyle(0xffffff, 1); // Highlight
             graphics.lineStyle(4, color, 1);
             graphics.fillRoundedRect(-150, -40, 300, 80, 15);
             graphics.strokeRoundedRect(-150, -40, 300, 80, 15);
             label.setColor(color === 0xffffff ? '#000000' : typeof color === 'number' ? '#' + color.toString(16) : color); // Invert text color roughly
             // Simplified: just darken content
             btnContainer.setAlpha(0.9);
        });

        bg.on('pointerout', () => {
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.lineStyle(4, 0xffffff, 1);
            graphics.fillRoundedRect(-150, -40, 300, 80, 15);
            graphics.strokeRoundedRect(-150, -40, 300, 80, 15);
            label.setColor('#ffffff');
            btnContainer.setAlpha(1);
        });
    }

    createMuteButton() {
        const { width } = this.scale;
        const muteBtn = this.add.text(width - 50, 30, '🔊', { fontSize: '30px' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        muteBtn.on('pointerdown', () => {
            if (this.sound.mute) {
                this.sound.setMute(false);
                muteBtn.setText('🔊');
            } else {
                this.sound.setMute(true);
                muteBtn.setText('🔇');
            }
        });
        
        // Sync state
        muteBtn.setText(this.sound.mute ? '🔇' : '🔊');
    }
}
