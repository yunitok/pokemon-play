import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load Real Assets
        this.load.path = 'assets/';

        this.load.image('snorlax', 'images/snorlax.webp');
        this.load.image('snorlax_2', 'images/snorlax_2.webp');
        this.load.image('snorlax_3', 'images/snorlax_3.webp');
        this.load.image('snorlax_4', 'images/snorlax_4.webp');

        this.load.image('candy', 'images/candy.png');
        this.load.image('berry', 'images/berry.png');
        this.load.image('apple', 'images/apple.png');
        this.load.image('donut', 'images/donut.png');

        this.load.image('bg_menu', 'images/bg_menu.webp');
        this.load.image('bg_game', 'images/bg_game.webp');
        
        // New Dynamic Backgrounds
        this.load.image('bg_shop', 'images/bg_shop.webp');
        this.load.image('bg_scanner', 'images/bg_scanner.webp');
        this.load.image('bg_cave', 'images/bg_cave.webp');
        this.load.image('bg_gold', 'images/bg_gold.webp');
        this.load.image('bg_market', 'images/bg_market.webp');
        this.load.image('bg_mystery', 'images/bg_mystery.webp');
        
        // Shop Items
        this.load.image('potion', 'images/potion.png');
        this.load.image('pokeball', 'images/pokeball.png');
        this.load.image('coin', 'images/coin.png');

        // Loading UI
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Cargando...',
            style: { font: '20px monospace', fill: '#ffffff' }
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('MenuScene');
        }.bind(this));
    }
}
