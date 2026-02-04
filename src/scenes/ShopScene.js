import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        // Background
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_menu').setDisplaySize(this.scale.width, this.scale.height);

        // Header
        this.add.text(this.scale.width / 2, 60, 'Tienda Pokémon', {
            fontSize: '50px',
            fontFamily: 'sans-serif',
            color: '#FFCB05',
            stroke: '#3B4CCA',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.updateCoinDisplay();

        // Back Button
        this.add.text(30, 30, '⬅ Volver', {
            fontSize: '28px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('MenuScene'));

        const centerX = this.scale.width / 2;
        
        // Item 1: Potion
        this.createItemCard(centerX - 200, 300, 'potion', 'Poción', 50);

        // Item 2: Pokeball
        this.createItemCard(centerX + 200, 300, 'pokeball', 'Pokéball', 100);
    }

    updateCoinDisplay() {
        if (this.coinText) this.coinText.destroy();
        if (this.coinIcon) this.coinIcon.destroy();

        const x = this.scale.width - 150;
        const y = 50;

        this.coinIcon = this.add.image(x, y, 'coin').setDisplaySize(40, 40);
        this.coinText = this.add.text(x + 30, y, `${window.GameState.coins}`, {
            fontSize: '32px',
            fontFamily: 'sans-serif',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0, 0.5);
    }

    createItemCard(x, y, key, name, cost) {
        const container = this.add.container(x, y);

        // Card Background
        const bg = this.add.rectangle(0, 0, 250, 350, 0xffffff, 0.9) // Taller for inventory text
            .setStrokeStyle(4, 0x3B4CCA);

        // Card Image
        const image = this.add.image(0, -60, key).setDisplaySize(100, 100);

        // Card Name
        const nameText = this.add.text(0, 20, name, {
            fontSize: '28px',
            fontFamily: 'sans-serif',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Inventory Count
        const ownedCount = window.GameState.inventory[key] || 0;
        const invText = this.add.text(0, 50, `En bolsa: ${ownedCount}`, {
            fontSize: '16px',
            fontFamily: 'sans-serif',
            color: '#555'
        }).setOrigin(0.5);
        container.invText = invText; // Reference for updates

        // Cost Button
        const btn = this.add.container(0, 100);
        const btnBg = this.add.rectangle(0, 0, 180, 50, 0x4CAF50, 1)
            .setInteractive({ useHandCursor: true });
        
        const btnText = this.add.text(0, 0, `${cost}`, {
            fontSize: '24px',
            fontFamily: 'sans-serif',
            color: '#fff'
        }).setOrigin(0.5);
        
        const btnIcon = this.add.image(-40, 0, 'coin').setDisplaySize(24, 24);

        btn.add([btnBg, btnIcon, btnText]);
        container.add([bg, image, nameText, invText, btn]);

        // Interactions
        btnBg.on('pointerdown', () => {
            if (window.GameState.coins >= cost) {
                this.buyItem(key, cost, container);
            } else {
                this.cantAfford(container);
            }
        });

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x66BB6A));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x4CAF50));
    }

    buyItem(key, cost, container) {
        window.GameState.coins -= cost;
        window.GameState.inventory[key] = (window.GameState.inventory[key] || 0) + 1;
        window.saveGame(); // Persist

        this.updateCoinDisplay();
        
        // Update Inventory Text
        container.invText.setText(`En bolsa: ${window.GameState.inventory[key]}`);

        // Success Sound
        if (window.playTone) {
            window.playTone(800, 'sine', 0.1);
            setTimeout(() => window.playTone(1200, 'sine', 0.1), 100);
        }

        this.tweens.add({
            targets: container,
            y: container.y - 20,
            duration: 100,
            yoyo: true
        });
    }

    cantAfford(itemContainer) {
        if (window.playTone) window.playTone(150, 'sawtooth', 0.2);
        this.tweens.add({
            targets: itemContainer,
            x: itemContainer.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }
}
