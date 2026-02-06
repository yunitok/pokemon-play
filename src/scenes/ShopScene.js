import { fadeOutAndSwitch } from '../utils/transition';
import { UIHelper } from '../utils/UIHelper';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // --- 1. Background & Overlay ---
        // Draw the menu background first
        // Draw the menu background first
        // Draw the menu background first
        // Draw the menu background first
        if (window.setAppBackground) window.setAppBackground('#000000');
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_shop')
            .setDisplaySize(this.scale.width, this.scale.height);
        
        // Dark Overlay for "Premium" feel
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
            .setOrigin(0, 0);

        // --- 2. Header ---
        UIHelper.createTitle(this, 'TIENDA POKÉMON');

        // --- 3. Currency Display ---
        this.updateCoinDisplay();

        // --- 4. Back Button ---
        UIHelper.createBackButton(this, () => fadeOutAndSwitch(this, 'MenuScene'));

        // --- 5. Item Data & Descriptions ---
        this.itemDescriptions = {
            'potion': "Recupera un poco la barra de sueño para que Snorlax no despierte todavía.",
            'pokeball': "¡Captura instantánea! Ganas el nivel automáticamente sin responder preguntas.",
            'paralizador': "Congela el tiempo por 5 segundos. La barra de sueño no se moverá.",
            'escudo': "Te protege de un fallo. Si te equivocas en la respuesta, no pasará nada.",
            'lupa': "Te muestra cuál es la respuesta correcta iluminándola."
        };

        // --- 6. Grid Layout ---
        // Centered Items
        
        const centerX = this.scale.width / 2;
        const row1Y = 240;
        const row2Y = 530;
        const cardW = 180; // Reduced from 240
        const gap = 30;

        // Container for all cards to animate them in
        this.cardsContainer = this.add.container(0, 0);

        // -- Row 1 --
        this.createItemCard(centerX - (cardW/2 + gap/2), row1Y, 'potion', 'potion', 'Poción', 50);
        this.createItemCard(centerX + (cardW/2 + gap/2), row1Y, 'pokeball', 'pokeball', 'Pokéball', 100);

        // -- Row 2 --
        this.createItemCard(centerX - (cardW + gap), row2Y, 'paralizador', 'potion', 'Paralizador', 75, 0x00FFFF);
        this.createItemCard(centerX, row2Y, 'escudo', 'pokeball', 'Escudo', 60, 0x00FF00);
        this.createItemCard(centerX + (cardW + gap), row2Y, 'lupa', 'potion', 'Lupa', 30, 0xFFA500);

        // Animation: Pop in cards
        this.cardsContainer.y = 50;
        this.cardsContainer.alpha = 0;
        this.tweens.add({
            targets: this.cardsContainer,
            y: 0,
            alpha: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    updateCoinDisplay() {
        if (this.coinText) this.coinText.destroy();
        if (this.coinIcon) this.coinIcon.destroy();
        if (this.coinBg) this.coinBg.destroy();

        const x = this.scale.width - 130;
        const y = 60;

        // Background pill for coins
        this.coinBg = this.add.graphics();
        this.coinBg.fillStyle(0x000000, 0.5);
        this.coinBg.fillRoundedRect(x - 20, y - 20, 140, 40, 20); // Smaller
        this.coinBg.lineStyle(2, 0xFFD700, 1);
        this.coinBg.strokeRoundedRect(x - 20, y - 20, 140, 40, 20);

        this.coinIcon = this.add.image(x, y, 'coin').setDisplaySize(32, 32);
        this.coinText = this.add.text(x + 25, y, `${window.GameState.coins}`, {
            fontSize: '26px', // Smaller
            fontFamily: 'sans-serif',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
    }

    createItemCard(x, y, id, imageKey, name, cost, tint = 0xffffff) {
        const w = 180; // Reduced width
        const h = 240; // Reduced height
        const container = this.add.container(x, y);

        // 1. Glassmorphism Card Background
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.15); // Semi-transparent white
        bg.fillRoundedRect(-w/2, -h/2, w, h, 15);
        bg.lineStyle(2, 0xffffff, 0.3); // Subtle border
        bg.strokeRoundedRect(-w/2, -h/2, w, h, 15);
        
        // 2. Glow effect (behind image)
        const glow = this.add.image(0, -40, 'particle').setDisplaySize(140, 140).setTint(tint).setAlpha(0.3).setVisible(false);

        // 3. Item Image
        const image = this.add.image(0, -45, imageKey).setDisplaySize(85, 85).setTint(tint);
        
        // Hover animation for image
        this.tweens.add({
            targets: image,
            y: '-=8',
            duration: 1500 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });

        // 4. Name
        const nameText = this.add.text(0, 15, name, {
            fontSize: '20px', // Smaller font
            fontFamily: 'sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 5. Inventory Text
        const ownedCount = window.GameState.inventory[id] || 0;
        const invText = this.add.text(0, 40, `Tienes: ${ownedCount}`, {
            fontSize: '14px', // Smaller font
            fontFamily: 'sans-serif',
            color: '#DDDDDD'
        }).setOrigin(0.5);
        container.invText = invText;

        // 6. Buy Button
        const btn = this.add.container(0, 85);
        const btnBg = this.add.graphics();
        
        const drawBtn = (color) => {
            btnBg.clear();
            btnBg.fillStyle(color, 1);
            btnBg.fillRoundedRect(-60, -20, 120, 40, 12);
            // Shadow
            btnBg.fillStyle(0x000000, 0.3);
            btnBg.fillRoundedRect(-60, -12, 120, 40, 12); // Shadow offset
            // Redraw top
            btnBg.fillStyle(color, 1);
            btnBg.fillRoundedRect(-60, -20, 120, 40, 12);
        };
        drawBtn(0x4CAF50); // Default green

        const btnText = this.add.text(0, -5, `${cost}`, {
            fontSize: '22px', // Smaller font
            fontFamily: 'sans-serif',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const btnIcon = this.add.image(-30, -5, 'coin').setDisplaySize(20, 20);

        btn.add([btnBg, btnIcon, btnText]);

        // 7. Help Button (?)
        const helpBtn = this.add.container(w/2 - 20, -h/2 + 20);
        const helpBg = this.add.circle(0, 0, 14, 0x3B4CCA).setStrokeStyle(2, 0xffffff);
        const helpSymbol = this.add.text(0, 0, '?', { fontSize: '18px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
        helpBtn.add([helpBg, helpSymbol]);
        
        helpBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.showItemInfo(id, name, imageKey, tint))
            .on('pointerover', () => helpBg.setFillStyle(0x29B6F6))
            .on('pointerout', () => helpBg.setFillStyle(0x3B4CCA));


        container.add([bg, glow, image, nameText, invText, btn, helpBtn]);
        this.cardsContainer.add(container);

        // --- Interaction ---
        // Button Hit Area
        const hitArea = this.add.rectangle(0, 85, 120, 40, 0x000000, 0).setInteractive({ useHandCursor: true });
        container.add(hitArea); // Add invisible hit area for button

        hitArea.on('pointerdown', () => {
            if (window.GameState.coins >= cost) {
                // Click animation
                this.tweens.add({
                    targets: btn,
                    scaleX: 0.9, scaleY: 0.9,
                    duration: 50,
                    yoyo: true
                });
                this.buyItem(id, cost, container);
            } else {
                this.cantAfford(container);
            }
        });

        // Hover Effect on Card
        const cardHitArea = this.add.rectangle(0, 0, w, h, 0x000000, 0).setInteractive();
        container.addAt(cardHitArea, 0); // Put at bottom of container stack

        cardHitArea.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.25); // Brighter
            bg.fillRoundedRect(-w/2, -h/2, w, h, 20);
            bg.lineStyle(2, 0xffffff, 0.8);
            bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);
        });

        cardHitArea.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 200 });
            bg.clear();
            bg.fillStyle(0xffffff, 0.15); // Normal
            bg.fillRoundedRect(-w/2, -h/2, w, h, 20);
            bg.lineStyle(2, 0xffffff, 0.3);
            bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);
        });
    }

    buyItem(id, cost, container) {
        window.GameState.coins -= cost;
        window.GameState.inventory[id] = (window.GameState.inventory[id] || 0) + 1;
        window.saveGame();

        this.updateCoinDisplay();
        container.invText.setText(`Tienes: ${window.GameState.inventory[id]}`);

        if (window.playTone) {
            window.playTone(800, 'sine', 0.1);
            setTimeout(() => window.playTone(1200, 'sine', 0.1), 100);
        }
    }

    cantAfford(container) {
        if (window.playTone) window.playTone(150, 'sawtooth', 0.2);
        this.tweens.add({
            targets: container,
            x: container.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    showItemInfo(id, name, imageKey, tint) {
        // Blocks clicks
        const blocker = this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0x000000, 0.8)
            .setInteractive();
        
        const popup = this.add.container(this.scale.width/2, this.scale.height/2);
        
        // 1. Fixed Width
        const boxW = 600;
        
        // Layout Constants
        const padding = 40;
        const leftColWidth = 180; // Reduced slighty
        const rightColX = -boxW/2 + leftColWidth + padding;
        const contentWidth = boxW - leftColWidth - (padding * 2);

        // 2. Create Text Content FIRST to measure height
        // Title
        const title = this.add.text(0, 0, name, {
            fontSize: '48px',
            fontFamily: '"Segoe UI", Tahoma, sans-serif',
            color: '#3B4CCA',
            fontStyle: 'bold'
        }).setOrigin(0, 0);

        // Description
        const description = this.itemDescriptions[id] || "Sin descripción.";
        const descText = this.add.text(0, title.height + 20, description, {
            fontSize: '28px',
            fontFamily: '"Segoe UI", Tahoma, sans-serif',
            color: '#333333',
            wordWrap: { width: contentWidth },
            lineSpacing: 8
        }).setOrigin(0, 0);

        // Calculate container height based on text
        const textHeight = title.height + 20 + descText.height;
        const minHeight = 250;
        const boxH = Math.max(minHeight, textHeight + (padding * 3) + 80); // +80 for Close Button area

        // Group Text
        const textContainer = this.add.container(rightColX, -boxH/2 + padding);
        textContainer.add([title, descText]);

        // 3. Draw Background with Dynamic Height
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.5); // Shadow
        bg.fillRoundedRect(-boxW/2 + 10, -boxH/2 + 10, boxW, boxH, 25);
        bg.fillStyle(0xffffff, 1); // Main body
        bg.fillRoundedRect(-boxW/2, -boxH/2, boxW, boxH, 25);
        bg.lineStyle(6, 0x3B4CCA); // Border
        bg.strokeRoundedRect(-boxW/2, -boxH/2, boxW, boxH, 25);

        // 4. Icon (Left Side, Vertically Centered relative to box)
        const icon = this.add.image(-boxW/2 + leftColWidth/2 + 20, 0, imageKey)
             .setTint(tint);
        
        // Optimize for Pixel Art (Fix blurry look)
        icon.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        icon.setDisplaySize(128, 128); // Power of 2 usually renders better

        // 5. Close Button (Bottom Center)
        const closeBtnY = boxH/2 - 50;
        const closeBtn = this.add.container(0, closeBtnY);
        const closeBg = this.add.rectangle(0, 0, 200, 60, 0xFF5252).setInteractive({ useHandCursor: true });
        closeBg.setStrokeStyle(2, 0xffffff);
        const closeTxt = this.add.text(0, 0, 'CERRAR', {
            fontSize: '28px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        closeBtn.add([closeBg, closeTxt]);

        popup.add([bg, icon, textContainer, closeBtn]);
        popup.setScale(0);

        this.tweens.add({ targets: popup, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.out' });

        const close = () => {
             if (window.playUiSound) window.playUiSound();
            this.tweens.add({
                targets: popup, scaleX: 0, scaleY: 0, duration: 200,
                onComplete: () => {
                    popup.destroy();
                    blocker.destroy();
                }
            });
        };

        closeBg.on('pointerdown', close);
        blocker.on('pointerdown', close);
    }
}
