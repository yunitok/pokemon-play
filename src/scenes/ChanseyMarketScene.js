import { MinigameScene } from './MinigameScene';
import { UIHelper } from '../utils/UIHelper';

export class ChanseyMarketScene extends MinigameScene {
    constructor() {
        super('ChanseyMarketScene');
    }

    create() {
        super.create();
        if (window.setAppBackground) window.setAppBackground('#000000');
        const bg = this.children.list.find(child => child.texture && child.texture.key === 'bg_game');
         if (bg) {
            bg.setTexture('bg_market');
            bg.clearTint();
            bg.setDisplaySize(this.scale.width, this.scale.height);
        }

        // Dark Overlay
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);

        this.addHelp("¡Ayuda a Chansey a dar el cambio!\n\n1. Mira el precio de la baya y cuánto dinero te dan.\n2. Resta para saber cuánto devolver.\n3. Toca las monedas de abajo para sumar esa cantidad.\n\nEJEMPLO:\nPrecio: 2€. Pagan con: 5€.\nDevuelves: 3€ (una moneda de 2€ y una de 1€).");

        // 1. Generate Problem based on Level
        const level = window.GameState.level;
        let minPrice = 1, maxPrice = 8;
        let paymentOptions = [5, 10];
        
        if (level >= 4 && level <= 8) {
            minPrice = 5; maxPrice = 18;
            paymentOptions = [10, 20];
        } else if (level >= 9) {
            minPrice = 10; maxPrice = 45;
            paymentOptions = [20, 50];
        }

        const price = Phaser.Math.Between(minPrice, maxPrice); // Integer prices for now, maybe floats later? Kept int for simplicity as per original code implies (2-8)
        // Ensure payment is higher than price
        const payment = paymentOptions.find(p => p > price) || (price + 10 - (price % 10)); // Fallback to next 10
        
        const changeNeeded = payment - price;
        this.currentChangeGiven = 0;

        // UI Container for Header
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x000000, 0.6);
        headerBg.fillRect(0, 0, this.cameras.main.width, 180);

        UIHelper.createTitle(this, 'Poké-Mart de Chansey');

        // Level Display
        this.add.text(this.cameras.main.width - 20, 20, `Nivel: ${window.GameState.level}`, {
             fontSize: '32px', fontFamily: 'Arial', color: '#FFD700', stroke: '#000', strokeThickness: 4
        }).setOrigin(1, 0);
        
        // Problem Display
        const problemBg = this.add.graphics();
        problemBg.fillStyle(0xFFFFFF, 0.9);
        problemBg.fillRoundedRect(this.cameras.main.width/2 - 300, 80, 600, 80, 20);
        
        this.add.text(this.cameras.main.width/2, 105, `Baya: ${price}€  |  Pagas con: ${payment}€`, { fontSize: '32px', fill: '#D81B60', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5);
        this.add.text(this.cameras.main.width/2, 145, `¿Cuánto cambio te devuelve Chansey?`, { fontSize: '24px', fill: '#333333', fontStyle: 'italic', fontFamily: 'Arial' }).setOrigin(0.5);

        // Visual Scene Elements
        const elementY = 320;
        
        // Chansey (Procedural)
        const chansey = this.add.container(200, elementY);
        const cBody = this.add.circle(0, 0, 70, 0xF8BBD0).setStrokeStyle(3, 0xffffff); // Pink body
        const cPouch = this.add.arc(0, 20, 40, 0, 180, false); // Pouch
        cPouch.setStrokeStyle(3, 0xffffff);
        const cEgg = this.add.ellipse(0, 20, 30, 40, 0xffffff); // Egg
        const cEyeL = this.add.rectangle(-20, -20, 10, 3, 0x000000); // Eyes
        const cEyeR = this.add.rectangle(20, -20, 10, 3, 0x000000);
        const cSmile = this.add.arc(0, -10, 10, 0, 180, false).setStrokeStyle(2, 0x000000);
        chansey.add([cBody, cPouch, cEgg, cEyeL, cEyeR, cSmile]);
        // Animation
        this.tweens.add({ targets: chansey, y: elementY - 5, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Counter Table
        this.add.rectangle(this.cameras.main.width/2, elementY + 50, 400, 20, 0x5D4037).setOrigin(0.5);
        
        // Item (Berry Icon Procedural)
        const berry = this.add.container(this.cameras.main.width/2 - 80, elementY - 20);
        // Cherry/Berry shape
        const b1 = this.add.circle(-15, 10, 20, 0xD32F2F);
        const b2 = this.add.circle(15, 10, 20, 0xC62828);
        const stem = this.add.graphics();
        stem.lineStyle(3, 0x33691E);
        stem.beginPath(); stem.moveTo(0, -20); stem.lineTo(-15, 10); stem.moveTo(0, -20); stem.lineTo(15, 10); stem.strokePath();
        const leaf = this.add.ellipse(10, -20, 20, 10, 0x558B2F).setRotation(0.5);
        berry.add([b1, b2, stem, leaf]);

        const priceTag = this.add.container(this.cameras.main.width/2 - 80, elementY + 40);
        priceTag.add(this.add.rectangle(0, 0, 80, 30, 0xffffff).setStrokeStyle(2, 0x000000));
        priceTag.add(this.add.text(0, 0, `${price}€`, { fontSize: '24px', fill: '#000', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5));

        // Payment (Money Bag Icon Procedural)
        const moneyIcon = this.add.container(this.cameras.main.width/2 + 80, elementY - 20);
        const bag = this.add.path(0, -10);
        // Draw bag shape roughly
        const bagGfx = this.add.graphics();
        bagGfx.fillStyle(0xFFD700);
        bagGfx.fillCircle(0, 10, 30); // Base
        bagGfx.fillTriangle(-20, 0, 20, 0, 0, -30); // Top
        bagGfx.lineStyle(2, 0x000000);
        bagGfx.strokeCircle(0, 10, 30);
        const dollar = this.add.text(0, 10, '€', { fontSize: '32px', color: '#000', fontStyle: 'bold' }).setOrigin(0.5);
        moneyIcon.add([bagGfx, dollar]);

         const payTag = this.add.container(this.cameras.main.width/2 + 80, elementY + 40);
        payTag.add(this.add.rectangle(0, 0, 80, 30, 0xffffff).setStrokeStyle(2, 0x000000));
        payTag.add(this.add.text(0, 0, `-${payment}€`, { fontSize: '24px', fill: '#d32f2f', fontStyle: 'bold', fontFamily: 'Arial' }).setOrigin(0.5));


        // Change Box Area
        const boxY = 550;
        this.changeBox = this.add.rectangle(this.cameras.main.width/2, boxY, 500, 160, 0x37474F, 0.9);
        this.changeBox.setStrokeStyle(4, 0x90A4AE);
        this.add.text(this.cameras.main.width/2, boxY, 'Pon el cambio aquí', { fontSize: '24px', fill: '#546E7A', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.5);
        
        this.changeText = this.add.text(this.cameras.main.width/2, boxY + 50, 'Total: 0€', { fontSize: '36px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
        
        // Group for animated coins in box
        this.changeCoinsGroup = this.add.group();

        // Styling Buttons Helper
        const createStyledBtn = (x, y, text, color, cb) => {
            const btn = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, 140, 50, color).setInteractive({ useHandCursor: true });
            bg.setStrokeStyle(2, 0xffffff);
            const txt = this.add.text(0, 0, text, { fontSize: '20px', fontStyle: 'bold', fill: '#fff' }).setOrigin(0.5);
            btn.add([bg, txt]);
            bg.on('pointerdown', () => {
                this.tweens.add({ targets: btn, scaleX: 0.9, scaleY: 0.9, yoyo: true, duration: 50 });
                cb();
            });
            return btn;
        };

        // Ready Button
        createStyledBtn(this.cameras.main.width/2 + 350, boxY, 'LISTO', 0x4CAF50, () => this.checkResult(changeNeeded));

        // Reset Button
        createStyledBtn(this.cameras.main.width/2 - 350, boxY, 'BORRAR', 0xF44336, () => this.resetChange());

        // Cash Register (Coins Source)
        const drawerY = 720;
        let denoms = [1, 2];
        if (window.GameState.level >= 4) denoms = [0.5, 1, 2];
        if (window.GameState.level >= 9) denoms = [0.2, 0.5, 1, 2];

        // START FIX: Ensure we have small coins if the change requires it!
        // If price/payment logic creates decimals (currently it doesn't, but for safety):
        // For this iteration, logic generates Integers, so [1, 2] is fine for levels 1-3.
        
        const startX = this.cameras.main.width/2;
        const spacing = 110; // Slightly tighter
        
        // Drawer Background
        this.add.rectangle(this.cameras.main.width/2, drawerY, this.cameras.main.width, 100, 0x212121).setOrigin(0.5, 0.5);

        denoms.forEach((val, i) => {
            const offset = (i - (denoms.length-1)/2) * spacing;
            const x = startX + offset;
            
            // Visual Coin
            const coin = this.createCoinVisual(x, drawerY, val);
            coin.setScale(1.2);
            
            // Hit Area
            const hitArea = this.add.rectangle(x, drawerY, 100, 100, 0xffffff, 0.01).setInteractive({ useHandCursor: true });
            hitArea.on('pointerdown', () => {
                if (window.playTone) window.playTone(600, 'sine', 0.05);
                this.addCoinToChange(val);
                
                // Animation
                const animCoin = this.createCoinVisual(x, drawerY, val);
                this.tweens.add({
                    targets: animCoin,
                    x: Phaser.Math.Between(this.changeBox.x - 150, this.changeBox.x + 150),
                    y: Phaser.Math.Between(this.changeBox.y - 40, this.changeBox.y + 40),
                    angle: Phaser.Math.Between(-30, 30),
                    duration: 400,
                    ease: 'Back.out'
                });
                this.changeCoinsGroup.add(animCoin);
            });
        });
    }

    addCoinToChange(val) {
        this.currentChangeGiven += val;
        this.changeText.setText(`Total: ${this.currentChangeGiven}€`);
    }

    resetChange() {
        this.currentChangeGiven = 0;
        this.changeText.setText(`Total: 0€`);
        this.changeCoinsGroup.clear(true, true);
    }

    checkResult(target) {
        // Floating point comparison safety
        if (Math.abs(this.currentChangeGiven - target) < 0.001) {
            const reward = 10 + (window.GameState.level * 2);
            // Level Up
            window.GameState.level += 1;
            window.saveGame();
            
            this.completeMinigame(reward);
        } else {
            this.showFeedback(false);
            const diff = this.currentChangeGiven - target;
            const hint = diff > 0 ? "¡Es demasiado!" : "¡Falta dinero!";
            
            const hintText = this.add.text(this.cameras.main.width/2, 400, hint, { fontSize: '40px', fill: '#f44336', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5);
            this.tweens.add({
                 targets: hintText,
                 y: 380, alpha: 0,
                 duration: 1500,
                 onComplete: () => hintText.destroy()
            });
            
            this.resetChange();
        }
    }
}
