# 📚 API Documentation

This document provides comprehensive API documentation for all classes, methods, and utilities in the Space Invaders game.

## 📋 Table of Contents

- [Game Class](#game-class)
- [Entity Classes](#entity-classes)
- [System Classes](#system-classes)
- [Utility Classes](#utility-classes)
- [Configuration](#configuration)
- [Events](#events)

## 🎮 Game Class

The main game controller that manages all game systems and state.

### Constructor
```javascript
new Game()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | Object | Current game state (score, lives, wave, etc.) |
| `player` | Player | Player spaceship instance |
| `aliens` | Array | Array of active alien instances |
| `pools` | Object | Object pools for bullets, particles, etc. |
| `powerUps` | Object | Active power-up states |
| `settings` | Object | Game settings (sound, music, etc.) |

### Methods

#### `startGame()`
Starts a new game session.
```javascript
game.startGame()
```

#### `togglePause()`
Toggles game pause state.
```javascript
game.togglePause()
```

#### `update(deltaTime)`
Updates all game systems.
```javascript
game.update(deltaTime)
```

#### `render()`
Renders the current game frame.
```javascript
game.render()
```

#### `gameOver()`
Handles game over state.
```javascript
game.gameOver()
```

#### `nextWave()`
Advances to the next wave of aliens.
```javascript
game.nextWave()
```

#### `useBomb()`
Uses a bomb power-up to clear aliens.
```javascript
game.useBomb()
```

#### `toggleSound()`
Toggles sound effects on/off.
```javascript
game.toggleSound()
```

#### `toggleMusic()`
Toggles background music on/off.
```javascript
game.toggleMusic()
```

#### `toggleFullscreen()`
Toggles fullscreen mode.
```javascript
game.toggleFullscreen()
```

## 🚀 Entity Classes

### Player Class

Represents the player's spaceship.

#### Constructor
```javascript
new Player(x, y)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | X position |
| `y` | Number | Y position |
| `width` | Number | Player width |
| `height` | Number | Player height |
| `speed` | Number | Movement speed |
| `shield` | Boolean | Shield active state |
| `rapidFire` | Boolean | Rapid fire active state |

#### Methods

#### `update(keys, canvasWidth, mouseX, mouseControl)`
Updates player position and state.
```javascript
player.update(keys, canvasWidth, mouseX, mouseControl)
```

**Parameters:**
- `keys` (Set): Set of pressed keys
- `canvasWidth` (Number): Canvas width for boundary checking
- `mouseX` (Number): Mouse X position
- `mouseControl` (Boolean): Whether mouse control is active

#### `render(ctx)`
Renders the player spaceship.
```javascript
player.render(ctx)
```

**Parameters:**
- `ctx` (CanvasRenderingContext2D): Canvas rendering context

#### `reset(x, y)`
Resets player to initial state.
```javascript
player.reset(x, y)
```

### Alien Class

Represents alien enemies.

#### Constructor
```javascript
new Alien(x, y, row)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | X position |
| `y` | Number | Y position |
| `width` | Number | Alien width |
| `height` | Number | Alien height |
| `row` | Number | Row number (affects score) |
| `type` | String | Alien type ('normal', 'shooter', 'shielded') |
| `colors` | Array | Color array for different rows |

#### Methods

#### `update(direction, speed)`
Updates alien position and behavior.
```javascript
alien.update(direction, speed)
```

#### `render(ctx)`
Renders the alien.
```javascript
alien.render(ctx)
```

#### `reset(x, y, row)`
Resets alien to initial state.
```javascript
alien.reset(x, y, row)
```

### Bullet Class

Represents projectiles.

#### Constructor
```javascript
new Bullet(x, y, speedY, color, game)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | X position |
| `y` | Number | Y position |
| `width` | Number | Bullet width |
| `height` | Number | Bullet height |
| `speedX` | Number | Horizontal speed |
| `speedY` | Number | Vertical speed |
| `color` | String | Bullet color |
| `guidedShot` | Boolean | Whether bullet tracks enemies |
| `splitShot` | Boolean | Whether bullet splits on impact |

#### Methods

#### `update()`
Updates bullet position.
```javascript
bullet.update()
```

#### `render(ctx)`
Renders the bullet.
```javascript
bullet.render(ctx)
```

#### `reset(x, y, speedY, color, game)`
Resets bullet to initial state.
```javascript
bullet.reset(x, y, speedY, color, game)
```

### Particle Class

Represents visual effect particles.

#### Constructor
```javascript
new Particle(x, y)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | X position |
| `y` | Number | Y position |
| `vx` | Number | Horizontal velocity |
| `vy` | Number | Vertical velocity |
| `life` | Number | Remaining life |
| `maxLife` | Number | Maximum life |
| `color` | String | Particle color |
| `type` | String | Particle type |

#### Methods

#### `update()`
Updates particle position and life.
```javascript
particle.update()
```

#### `render(ctx)`
Renders the particle.
```javascript
particle.render(ctx)
```

#### `reset(x, y, vx, vy, isBomb, type)`
Resets particle to initial state.
```javascript
particle.reset(x, y, vx, vy, isBomb, type)
```

### PowerUp Class

Represents power-up items.

#### Constructor
```javascript
new PowerUp(x, y)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | Number | X position |
| `y` | Number | Y position |
| `width` | Number | Power-up width |
| `height` | Number | Power-up height |
| `type` | String | Power-up type |
| `speed` | Number | Fall speed |

#### Methods

#### `update()`
Updates power-up position.
```javascript
powerUp.update()
```

#### `render(ctx)`
Renders the power-up.
```javascript
powerUp.render(ctx)
```

#### `reset(x, y, game)`
Resets power-up to initial state.
```javascript
powerUp.reset(x, y, game)
```

## ⚙️ System Classes

### AudioSystem Class

Manages game audio and sound effects.

#### Constructor
```javascript
new AudioSystem(settings)
```

#### Methods

#### `playSound(frequency, duration, waveType)`
Plays a procedural sound effect.
```javascript
audioSystem.playSound(frequency, duration, waveType)
```

**Parameters:**
- `frequency` (Number): Sound frequency in Hz
- `duration` (Number): Sound duration in seconds
- `waveType` (String): Wave type ('sine', 'square', 'sawtooth', 'triangle')

#### `startBackgroundMusic()`
Starts background music.
```javascript
audioSystem.startBackgroundMusic()
```

#### `stopBackgroundMusic()`
Stops background music.
```javascript
audioSystem.stopBackgroundMusic()
```

#### `setVolume(volume)`
Sets audio volume.
```javascript
audioSystem.setVolume(volume)
```

**Parameters:**
- `volume` (Number): Volume level (0.0 to 1.0)

## 🛠️ Utility Classes

### ObjectPool Class

Manages object pooling for performance optimization.

#### Constructor
```javascript
new ObjectPool(createFn, resetFn)
```

**Parameters:**
- `createFn` (Function): Function to create new objects
- `resetFn` (Function): Function to reset objects for reuse

#### Methods

#### `get()`
Gets an object from the pool.
```javascript
const obj = pool.get()
```

#### `release(obj)`
Returns an object to the pool.
```javascript
pool.release(obj)
```

#### `releaseAll()`
Returns all active objects to the pool.
```javascript
pool.releaseAll()
```

#### `getActiveObjects()`
Gets all currently active objects.
```javascript
const activeObjects = pool.getActiveObjects()
```

### SpatialGrid Class

Optimizes collision detection using spatial partitioning.

#### Constructor
```javascript
new SpatialGrid(width, height, cellSize)
```

**Parameters:**
- `width` (Number): Grid width
- `height` (Number): Grid height
- `cellSize` (Number): Size of each grid cell

#### Methods

#### `insert(entity)`
Inserts an entity into the grid.
```javascript
spatialGrid.insert(entity)
```

#### `getNearbyEntities(x, y)`
Gets entities near a position.
```javascript
const entities = spatialGrid.getNearbyEntities(x, y)
```

#### `clear()`
Clears all entities from the grid.
```javascript
spatialGrid.clear()
```

## ⚙️ Configuration

### GAME_CONFIG Object

Central configuration object for all game parameters.

```javascript
export const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        speed: 5,
        fireRate: 200,
        rapidFireRate: 100,
        width: 40,
        height: 30
    },
    alien: {
        baseSpeed: 1,
        speedIncrement: 0.2,
        dropDistance: 20,
        width: 40,
        height: 30
    },
    bullet: {
        speed: 8,
        width: 4,
        height: 10
    },
    powerUps: {
        shield: {
            duration: Infinity,
            type: 'permanent',
            color: '#00ffff',
            score: 0
        },
        rapidFire: {
            duration: 10000,
            type: 'timed',
            color: '#ff00ff',
            score: 50
        },
        // ... more power-ups
    },
    effects: {
        particleCount: 8,
        starCount: 100,
        screenShakeDuration: 200
    }
}
```

### Power-up Configuration

Each power-up has the following configuration:

| Property | Type | Description |
|----------|------|-------------|
| `duration` | Number | Duration in milliseconds (Infinity for permanent) |
| `type` | String | Type ('instant', 'timed', 'permanent') |
| `color` | String | Visual color |
| `score` | Number | Points awarded when collected |

## 📡 Events

### Game Events

The game emits various events that can be listened to:

#### `gameStart`
Emitted when a new game starts.
```javascript
game.on('gameStart', () => {
    console.log('Game started!');
});
```

#### `gameOver`
Emitted when the game ends.
```javascript
game.on('gameOver', (score) => {
    console.log(`Game over! Final score: ${score}`);
});
```

#### `waveComplete`
Emitted when a wave is completed.
```javascript
game.on('waveComplete', (waveNumber) => {
    console.log(`Wave ${waveNumber} completed!`);
});
```

#### `powerUpCollected`
Emitted when a power-up is collected.
```javascript
game.on('powerUpCollected', (powerUpType) => {
    console.log(`Power-up collected: ${powerUpType}`);
});
```

#### `alienDestroyed`
Emitted when an alien is destroyed.
```javascript
game.on('alienDestroyed', (alienType, score) => {
    console.log(`${alienType} destroyed! +${score} points`);
});
```

### Input Events

#### Keyboard Events
- `keydown`: Key pressed
- `keyup`: Key released

#### Mouse Events
- `mousemove`: Mouse moved
- `mousedown`: Mouse button pressed
- `mouseup`: Mouse button released
- `contextmenu`: Right-click (used for bombs)

#### Touch Events
- `touchstart`: Touch started
- `touchend`: Touch ended

## 🎯 Usage Examples

### Basic Game Setup
```javascript
// Initialize game
const game = new Game();

// Start game
game.startGame();

// Pause/unpause
game.togglePause();
```

### Custom Power-up Creation
```javascript
// Create custom power-up
const customPowerUp = new PowerUp(100, 100);
customPowerUp.type = 'custom';
customPowerUp.color = '#ff6600';

// Add to game
game.pools.powerUps.getActiveObjects().push(customPowerUp);
```

### Event Handling
```javascript
// Listen for game events
game.on('gameOver', (finalScore) => {
    // Save high score
    localStorage.setItem('highScore', finalScore);
});

game.on('powerUpCollected', (type) => {
    // Show power-up notification
    showNotification(`Power-up: ${type}`);
});
```

### Audio Control
```javascript
// Play custom sound
game.audioSystem.playSound(440, 0.5, 'sine');

// Control volume
game.audioSystem.setVolume(0.8);

// Toggle music
game.toggleMusic();
```

### Object Pool Usage
```javascript
// Get bullet from pool
const bullet = game.pools.bullets.get();
bullet.reset(100, 100, -8, '#00ff00', game);

// Release bullet back to pool
game.pools.bullets.release(bullet);
```

## 🔧 Advanced Usage

### Custom Alien Types
```javascript
class CustomAlien extends Alien {
    constructor(x, y, row) {
        super(x, y, row);
        this.type = 'custom';
        this.specialAbility = true;
    }
    
    update(direction, speed) {
        super.update(direction, speed);
        // Custom behavior
        if (this.specialAbility) {
            this.performSpecialAbility();
        }
    }
    
    performSpecialAbility() {
        // Custom alien ability
    }
}
```

### Custom Power-up Effects
```javascript
// Add custom power-up to game
game.powerUps.customPower = {
    active: false,
    expireTime: 0
};

// Apply custom power-up
function applyCustomPowerUp() {
    game.powerUps.customPower.active = true;
    game.powerUps.customPower.expireTime = Date.now() + 5000;
    
    // Custom effect
    game.player.specialMode = true;
}
```

### Performance Monitoring
```javascript
// Monitor frame rate
let frameCount = 0;
let lastTime = Date.now();

function monitorPerformance() {
    frameCount++;
    const currentTime = Date.now();
    
    if (currentTime - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Add to game loop
game.gameLoop = function(currentTime) {
    // ... existing game loop code
    monitorPerformance();
};
```

---

This API documentation provides comprehensive information about all classes, methods, and utilities available in the Space Invaders game. Use this as a reference when extending or modifying the game.
