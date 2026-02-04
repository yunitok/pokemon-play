window.logToScreen('Verificando escenas...');
// Check if scenes are loaded
if (typeof BootScene === 'undefined') throw new Error('BootScene is not defined. Check src/scenes/BootScene.js');
if (typeof MenuScene === 'undefined') throw new Error('MenuScene is not defined. Check src/scenes/MenuScene.js');
if (typeof SnorlaxScene === 'undefined') throw new Error('SnorlaxScene is not defined. Check src/scenes/SnorlaxScene.js');

logToScreen('Escenas OK. Configurando Phaser...');

const config = {
    type: Phaser.CANVAS, // Fallback to Canvas to avoid WebGL errors
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    audio: {
        noAudio: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, SnorlaxScene]
};

try {
    const game = new Phaser.Game(config);
    logToScreen('Instancia de juego creada. Esperando a BootScene...');
} catch (e) {
    console.error(e);
    logToScreen('ERROR CRÍTICO AL CREAR EL JUEGO: ' + e.message);
}
