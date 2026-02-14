# Pokémon Play Project Analysis

## Descripción del Proyecto
**Pokémon Play** es una colección de minijuegos educativos y casuales ambientados en el universo Pokémon, desarrollados tecnologías web modernas. El proyecto está estructurado como una "Single Page Application" (SPA) donde los jugadores pueden disfrutar de diferentes desafíos, ganar monedas y adquirir ítems en una tienda virtual para usar dentro de los juegos.

### Minijuegos Implementados
El juego cuenta con un menú central (`MenuScene`) que conecta con varias experiencias:

1.  **El Misterio de Snorlax (`SnorlaxScene`)**:
    *   **Mecánica**: Juego de lógica matemática y rapidez. El jugador debe calcular cuántas comidas le faltan a Snorlax para estar lleno (Objetivo - Actual = Respuesta).
    *   **Desafío**: Snorlax tiene un medidor de sueño que se llena con el tiempo. Si se despierta, pierdes.
    *   **Power-ups**:
        *   *Poción*: Reduce el medidor de sueño.
        *   *Paralizador*: Congela el tiempo temporalmente.
        *   *Lupa*: Resalta la respuesta correcta.
        *   *Escudo*: Protege de un fallo.
        *   *Pokéball*: Gana el nivel automáticamente.

2.  **Tesoro Gimmighoul (`SilhouetteScannerScene`)**:
    *   **Mecánica**: Juego de clasificación y percepción visual.
    *   **Objetivo**: Arrastrar monedas de diferentes valores a sus siluetas correspondientes.

3.  **Otros Minijuegos** (Inferidos por estructura):
    *   *Diglett Counter*: Posible juego de conteo/atención.
    *   *Cofres Meowth*: Probablemente un juego de azar o elección.
    *   *Poké-Mart (Chansey)*: Gestión de recursos o tienda avanzada.

## Stack Tecnológico

El proyecto utiliza un stack ligero y optimizado para desarrollo de videojuegos 2D en web:

*   **Core**: Javascript (ES Modules)
*   **Motor de Juego**: [Phaser 3](https://phaser.io/) (v3.90.0)
    *   Manejo de escenas, físicas (Arcade), inputs y renderizado en Canvas/WebGL.
*   **Build Tool**: [Vite](https://vitejs.dev/) (v7.2.4)
    *   Provee un entorno de desarrollo rápido y Hot Module Replacement (HMR).
*   **Persistencia de Datos**: `localStorage`
    *   Almacena `coins`, `level`, `inventory` y `highScore` de forma local en el navegador del usuario.
*   **Audio**: Web Audio API nativa
    *   Los efectos de sonido son sintetizados en tiempo real (osciladores) sin depender de assets de audio externos, reduciendo el peso del proyecto.

## Estructura del Proyecto

```
/
├── index.html          # Punto de entrada HTML
├── main.js             # Configuración de Phaser y Estado Global (GameState)
├── src/
│   ├── scenes/         # Lógica de cada pantalla/minijuego
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── SnorlaxScene.js
│   │   ├── ShopScene.js
│   │   └── ...
│   └── utils/          # Utilidades compartidas (UI, Transiciones)
└── public/             # Assets estáticos (imágenes)
```

## Estado Global y Sistema de Economía
El juego mantiene un estado global accesible vía `window.GameState` que incluye:
*   **Monedas**: Moneda de cambio para comprar power-ups.
*   **Nivel**: Dificultad progresiva.
*   **Inventario**: Almacena los power-ups comprados (pociones, pokéballs, etc.).

## Instalación y Ejecución

Para correr el proyecto localmente:

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

3.  **Construir para producción**:
    ```bash
    npm run build
    ```
