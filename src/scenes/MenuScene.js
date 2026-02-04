import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'bg_menu').setDisplaySize(width, height);

        // Title
        const titleText = this.add.text(width / 2, 80, 'PokemonPlay', {
            fontFamily: 'sans-serif',
            fontSize: '64px',
            color: '#FFCB05',
            stroke: '#3B4CCA',
            strokeThickness: 8,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Tween Title
        this.tweens.add({
            targets: titleText,
            y: 90,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Button 1: Tienda
        this.createButton(width / 2, 250, 'Tienda Pokémon', 0xBA68C8, () => {
            this.scene.start('ShopScene');
        });

        // Button 2: Snorlax Game
        this.createButton(width / 2, 380, 'El Misterio de Snorlax', 0x1565C0, () => {
            this.scene.start('SnorlaxScene');
        });
    }

    createButton(x, y, text, color, callback) {
        const btnContainer = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 300, 80, color, 1);
        bg.setInteractive({ useHandCursor: true });
        
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

        // Hit Area Hack (Invisible Rect)
        bg.setVisible(true);
        bg.setAlpha(0.01);
        
        btnContainer.add([graphics, label, bg]);

        bg.on('pointerdown', () => {
             if (window.playTone) window.playTone(400, 'square', 0.1);
            this.tweens.add({
                targets: btnContainer,
                scaleX: 0.9, scaleY: 0.9, duration: 100, yoyo: true,
                onComplete: callback
            });
        });

        bg.on('pointerover', () => {
             graphics.clear();
             graphics.fillStyle(0xffffff, 1);
             graphics.lineStyle(4, color, 1);
             graphics.fillRoundedRect(-150, -40, 300, 80, 15);
             graphics.strokeRoundedRect(-150, -40, 300, 80, 15);
             label.setColor(color === 0xffffff ? '#000000' : '#000000');
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
}
