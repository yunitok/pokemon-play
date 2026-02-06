import { MinigameScene } from './MinigameScene';
import { UIHelper } from '../utils/UIHelper';

export class SilhouetteScannerScene extends MinigameScene {
    constructor() {
        super('SilhouetteScannerScene');
    }

    create() {
        super.create();
        if (window.setAppBackground) window.setAppBackground('#000000');
        
        // Custom BG for this scene
        // We need to add the specific background on top of the inherited one, or finding the inherited one and swapping texture
        const bg = this.children.list.find(child => child.texture && child.texture.key === 'bg_game');
        if (bg) {
            bg.setTexture('bg_scanner');
            bg.clearTint();
            bg.setDisplaySize(this.scale.width, this.scale.height);
        }
        
        // Dark Overlay
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);

        this.addHelp("¡Ordena las monedas!\n\nArrastra las monedas de abajo hacia la sombra que tenga su mismo valor o tamaño.\n\nPISTA:\nLa moneda pequeña de 1 céntimo va en la sombra pequeña.\nLa moneda grande de 2€ va en la sombra grande.");
        
        // Title
        UIHelper.createTitle(this, 'El Tesoro de Gimmighoul');
        this.add.text(this.cameras.main.width/2, 110, 'Arrastra la moneda correcta a su silueta', { fontSize: '20px', fill: '#dddddd' }).setOrigin(0.5);

        // State
        this.matches = 0;
        this.totalTargets = 3;
        
        // Coin Values
        const possibleValues = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1.00, 2.00];
        
        // Select 3 random targets
        const targets = [];
        while(targets.length < 3) {
            const val = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            // Allow duplicates but maybe filter if too confusing? For now random is fine.
            targets.push(val);
        }

        // Create Silhouettes (Targets)
        this.targetZones = [];
        const zoneY = 250;
        const zoneSpacing = 200;
        const startX = this.cameras.main.width/2 - ((this.totalTargets-1) * zoneSpacing)/2;

        targets.forEach((val, i) => {
            const x = startX + i * zoneSpacing;
            
            // Silhouette visuals (ghostly coin)
            const visual = this.createCoinVisual(x, zoneY, val);
            visual.setAlpha(0.3);
            // Hide the text on silhouette to make it "scanner" style? Or keep text for "value check"?
            // Spec says "con su valor escrito en transparencia". So keep text.
            
            // Drop zone logic
            const zone = this.add.zone(x, zoneY, 100, 100).setRectangleDropZone(100, 100);
            zone.value = val;
            zone.visual = visual;
            zone.isFilled = false;
            
            this.targetZones.push(zone);
        });

        // Create Source Coins (Wallet)
        // Ensure we have at least the needed coins, plus some distractors
        let walletCoins = [...targets];
        // Add 3 distractors
        for(let i=0; i<3; i++) {
             walletCoins.push(possibleValues[Math.floor(Math.random() * possibleValues.length)]);
        }
        // Shuffle
        walletCoins = walletCoins.sort(() => Math.random() - 0.5);

        const walletY = 600;
        const walletWidth = 800;
        const coinSpacing = walletWidth / walletCoins.length;
        const walletStartX = this.cameras.main.width/2 - (walletWidth/2) + coinSpacing/2;

        walletCoins.forEach((val, i) => {
            const x = walletStartX + i * coinSpacing;
            const coin = this.createCoinVisual(x, walletY, val);
            
            coin.setSize(80, 80); // Ensure hit area
            coin.setInteractive({ draggable: true });
            
            // Store original position for reset
            coin.input.dragStartX = x;
            coin.input.dragStartY = walletY;
            
            this.input.setDraggable(coin);
        });

        // Input Events
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', (pointer, gameObject, dropZone) => {
            dropZone.visual.setAlpha(0.7);
        });

        this.input.on('dragleave', (pointer, gameObject, dropZone) => {
            if (!dropZone.isFilled) dropZone.visual.setAlpha(0.3);
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // Check matching value
            const coinValue = gameObject.getData('value');
            const targetValue = dropZone.value;

            // Float comparison tolerance
            if (!dropZone.isFilled && Math.abs(coinValue - targetValue) < 0.001) {
                // Correct!
                gameObject.x = dropZone.x;
                gameObject.y = dropZone.y;
                gameObject.disableInteractive();
                dropZone.isFilled = true;
                dropZone.visual.setAlpha(1);
                
                this.showFeedback(true, dropZone.x, dropZone.y);
                this.matches++;
                
                if(this.matches >= this.totalTargets) {
                    this.completeMinigame(15); // Reward 15 coins
                }
            } else {
                // Wrong Match - Visual feedback handled in showFeedback
                this.showFeedback(false);
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
                dropZone.visual.setAlpha(0.3);
            }
        });

        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });
    }
}
