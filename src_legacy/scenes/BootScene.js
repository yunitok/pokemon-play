class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        if (window.logToScreen) window.logToScreen('BootScene.preload: Iniciando Modo Seguro (Sin Assets Externos)');
        
        // --- SAFE MODE: Generate Logic-only Assets ---
        
        // 1. Snorlax Placeholder (Big Blue Circle)
        const snorlaxGfx = this.make.graphics();
        snorlaxGfx.fillStyle(0x0000AA);
        snorlaxGfx.fillCircle(100, 100, 100);
        snorlaxGfx.generateTexture('snorlax', 200, 200);
        snorlaxGfx.destroy();

        // 2. Candy Placeholder (Small Red Circle)
        const candyGfx = this.make.graphics();
        candyGfx.fillStyle(0xFF0000);
        candyGfx.fillCircle(16, 16, 16);
        candyGfx.generateTexture('candy', 32, 32);
        candyGfx.destroy();

        // 3. Audio Placeholders (Dummy objects so code doesn't crash)
        // We will mock the cache.audio to avoid errors when playing
        this.cache.audio.add('success', '');
        this.cache.audio.add('fail', '');
        this.cache.audio.add('coins', '');
        this.cache.audio.add('music', '');

        // Loading Bar (Visual only, completes instantly since no files are loaded)
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Cargando (Modo Seguro)...',
            style: { font: '20px monospace', fill: '#ffffff' }
        }).setOrigin(0.5, 0.5);

        // Simulate a short load for UX
        let percent = 0;
        const interval = setInterval(() => {
            percent += 0.1;
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * percent, 30);
            
            if (percent >= 1) {
                clearInterval(interval);
                this.scene.start('MenuScene');
            }
        }, 100);

        // DISABLE REAL LOADING
        return; 
    }

    create() {
        this.scene.start('MenuScene');
    }
}
