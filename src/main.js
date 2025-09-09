import { GAME_CONFIG, ObjectPool, SpatialGrid } from './core/game-engine.js';
import { Player } from './entities/player.js';
import { Alien } from './entities/alien.js';
import { Bullet } from './entities/bullet.js';
import { Particle } from './entities/particle.js';
import { PowerUp } from './entities/power-up.js';
import { AudioSystem } from './systems/audio.js';

class Game {
    constructor() {
        // DOM elements - cache references
        this.elements = {
            canvas: document.getElementById('gameCanvas'),
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            highScore: document.getElementById('highScore'),
            bombCount: document.getElementById('bombCount'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            soundBtn: document.getElementById('soundBtn'),
            musicBtn: document.getElementById('musicBtn')
        };
        
        this.ctx = this.elements.canvas.getContext('2d');
        
        // Game state
        this.state = {
            current: 'menu',
            score: 0,
            lives: 3,
            wave: 1,
            highScore: parseInt(localStorage.getItem('spaceInvadersHighScore')) || 0
        };
        
        // Game entities
        this.player = new Player(this.elements.canvas.width / 2, this.elements.canvas.height - 50);
        
        // Wingman ship (add-on spaceship)
        this.wingman = {
            x: 0,
            y: 0,
            width: 25,
            height: 20,
            active: false,
            lastShot: 0,
            fireRate: 300,
            offset: 0 // Oscillation offset
        };
        
        // Initialize object pools
        this.pools = {
            bullets: new ObjectPool(
                () => new Bullet(0, 0, 0, '#00ff00', this),
                (bullet) => bullet.reset(0, 0, 0, '#00ff00', this)
            ),
            alienBullets: new ObjectPool(
                () => new Bullet(0, 0, 0, '#ff4400', this),
                (bullet) => bullet.reset(0, 0, 0, '#ff4400', this)
            ),
            particles: new ObjectPool(
                () => new Particle(0, 0),
                (particle) => particle.reset(0, 0)
            ),
            powerUps: new ObjectPool(
                () => new PowerUp(0, 0),
                (powerUp) => powerUp.reset(0, 0)
            ),
            aliens: new ObjectPool(
                () => new Alien(0, 0, 0),
                (alien) => alien.reset(0, 0, 0)
            )
        };
        
        this.aliens = [];
        this.stars = [];
        this.backgroundLayers = [
            { stars: [], speed: 0.1, opacity: 0.2 },
            { stars: [], speed: 0.3, opacity: 0.4 },
            { stars: [], speed: 0.6, opacity: 0.8 }
        ];
        
        // Input state
        this.input = {
            keys: new Set(),
            mouse: { x: 0, y: 0, control: true },
            lastShot: 0,
            mousePressed: false
        };
        
        // Alien movement
        this.alienMovement = {
            direction: 1,
            speed: GAME_CONFIG.alien.baseSpeed
        };
        
        // Optimized power-up states with unified structure
        this.powerUps = {
            shield: { active: false, expireTime: 0 },
            rapidFire: { active: false, expireTime: 0 },
            quadShot: { active: false, expireTime: 0 },
            splitShot: { active: false, expireTime: 0 },
            slowMotion: { active: false, expireTime: 0 },
            multiplier: { active: false, expireTime: 0, value: 1 },
            bomb: { count: 0, ready: false },
            laser: { active: false, expireTime: 0 },
            guidedShot: { active: false, expireTime: 0 },
            timeWarp: { active: false, expireTime: 0 },
            diamondShot: { active: false, expireTime: 0 },
            wingman: { active: false, expireTime: 0 },
            chainLightning: { active: false, expireTime: 0 }
        };
        
        // Power-up effects cache for performance
        this.powerUpEffects = {
            activeShooting: new Set(),
            activeVisual: new Set(),
            activeGameplay: new Set()
        };
        
        // Power-up management system
        this.powerUpManager = {
            lastDropTime: 0,
            minDropInterval: 2000, // Minimum 2 seconds between drops
            maxActivePowerUps: 3, // Maximum power-ups on screen
            dropChanceReduction: 0.5, // Reduce drop chance when many active
            comboCooldown: 5000 // 5 seconds cooldown after combo power-ups
        };
        
        // Settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: true
        };
        
        // Visual effects
        this.effects = {
            screenShake: { active: false, intensity: 0, duration: 0, startTime: 0 }
        };
        
        // Electrical effects for chain lightning
        this.electricalArcs = [];
        this.electricalShockwaves = [];
        
        // Splash labels for power-ups
        this.splashLabels = [];
        
        // Initialize spatial grid for collision optimization
        this.spatialGrid = new SpatialGrid(GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height, 50);
        
        // Initialize audio system
        this.audioSystem = new AudioSystem(this.settings);
        
        // Initialize game
        this.setupEventListeners();
        this.createStars();
        this.createAliens();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events with modern event handling
        document.addEventListener('keydown', (e) => {
            this.input.keys.add(e.code);
            
            switch (e.code) {
                case 'KeyB':
                    if (this.powerUps.bomb.ready && this.powerUps.bomb.count > 0) {
                        this.useBomb();
                    }
                    break;
                case 'KeyM':
                    this.toggleMouseControl();
                    break;
                case 'KeyF':
                    this.toggleFullscreen();
                    break;
                case 'Escape':
                    if (this.state.current === 'playing') {
                        this.togglePause();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.input.keys.delete(e.code);
        });
        
        // Button event listeners with proper binding
        const buttonHandlers = {
            startBtn: () => this.startGame(),
            pauseBtn: () => this.togglePause(),
            soundBtn: () => this.toggleSound(),
            musicBtn: () => this.toggleMusic(),
            fullscreenBtn: () => this.toggleFullscreen()
        };
        
        // Add fullscreen change listener for button state updates
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.updateFullscreenButton();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.updateFullscreenButton();
        });
        
        document.addEventListener('MSFullscreenChange', () => {
            this.updateFullscreenButton();
        });
        
        Object.entries(buttonHandlers).forEach(([id, handler]) => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('click', handler);
            }
        });
        
        // Mouse and touch controls
        this.setupMouseControls();
        this.setupMobileControls();
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('blur', () => {
            if (this.state.current === 'playing') {
                this.togglePause();
            }
        });
        
        // Visibility API for better performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.current === 'playing') {
                this.togglePause();
            }
        });
    }
    
    setupMouseControls() {
        const canvas = this.elements.canvas;
        
        const getMousePosition = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };
        
        canvas.addEventListener('mousemove', (e) => {
            const pos = getMousePosition(e);
            this.input.mouse.x = pos.x;
            this.input.mouse.y = pos.y;
            
            // Hide cursor when mouse control is active
            if (this.input.mouse.control) {
                document.body.style.cursor = 'none';
            }
        });
        
        // Restore cursor when mouse leaves canvas
        canvas.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'auto';
        });
        
        canvas.addEventListener('mousedown', (e) => {
            if (this.state.current === 'playing') {
                this.input.mousePressed = true;
            }
        });
        
        canvas.addEventListener('mouseup', (e) => {
            this.input.mousePressed = false;
        });
        
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.state.current === 'playing' && this.powerUps.bomb.ready && this.powerUps.bomb.count > 0) {
                this.useBomb();
            }
        });
        
        // Mouse wheel for special actions
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (this.state.current === 'playing') {
                // Scroll to change fire rate temporarily
                const direction = e.deltaY > 0 ? 1 : -1;
                this.temporaryFireRateBoost(direction);
            }
        });
    }
    
    // Modern toggle functions with better state management
    
    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.updateButton('soundBtn', this.settings.soundEnabled, 'Sound', '🔊');
    }
    
    toggleMusic() {
        this.settings.musicEnabled = !this.settings.musicEnabled;
        this.updateButton('musicBtn', this.settings.musicEnabled, 'Music', '🎵');
        
        if (!this.settings.musicEnabled && !this.settings.soundEnabled) {
            this.settings.soundEnabled = true;
            this.updateButton('soundBtn', this.settings.soundEnabled, 'Sound', '🔊');
        }
        
        if (this.settings.musicEnabled) {
            this.audioSystem.startBackgroundMusic();
        } else {
            this.audioSystem.stopBackgroundMusic();
        }
    }
    
    togglePause() {
        if (this.state.current === 'playing') {
            this.state.current = 'paused';
        } else if (this.state.current === 'paused') {
            this.state.current = 'playing';
        }
    }
    
    // Generic button update function
    updateButton(buttonId, isActive, label, icon = '') {
        const button = this.elements[buttonId];
        if (!button) return;
        
        const status = isActive ? 'ON' : 'OFF';
        button.textContent = `${label}: ${status} ${icon}`.trim();
        button.style.background = isActive ?
            'linear-gradient(45deg, #00ff00, #00cc00)' :
            'linear-gradient(45deg, #666666, #444444)';
    }
    
    setupMobileControls() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            const mobileControls = document.querySelector('.mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
            
            const controlText = document.querySelector('.game-controls p');
            if (controlText) {
                controlText.textContent = 'Use touch controls below';
            }
            
            // Touch control mapping
            const touchControls = {
                leftBtn: 'ArrowLeft',
                rightBtn: 'ArrowRight',
                shootBtn: 'Space'
            };
            
            Object.entries(touchControls).forEach(([btnId, keyCode]) => {
                const btn = document.getElementById(btnId);
                if (!btn) return;
                
                const startHandler = () => this.input.keys.add(keyCode);
                const endHandler = () => this.input.keys.delete(keyCode);
                
                // Touch events
                btn.addEventListener('touchstart', startHandler);
                btn.addEventListener('touchend', endHandler);
                
                // Mouse events for desktop testing
                btn.addEventListener('mousedown', startHandler);
                btn.addEventListener('mouseup', endHandler);
                
                // Special handling for shoot button
                if (btnId === 'shootBtn') {
                    btn.addEventListener('click', () => {
                        this.input.keys.add(keyCode);
                        setTimeout(() => this.input.keys.delete(keyCode), 100);
                    });
                }
            });
        }
    }
    
    // New utility functions
    handleResize() {
        // Handle responsive canvas resizing
        const canvas = this.elements.canvas;
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Maintain aspect ratio
        const aspectRatio = GAME_CONFIG.canvas.width / GAME_CONFIG.canvas.height;
        let newWidth = Math.min(containerRect.width - 40, GAME_CONFIG.canvas.width);
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > containerRect.height - 200) {
            newHeight = containerRect.height - 200;
            newWidth = newHeight * aspectRatio;
        }
        
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Try different fullscreen methods for better browser compatibility
            const element = document.documentElement;
            const requestFullscreen = element.requestFullscreen || 
                                    element.webkitRequestFullscreen || 
                                    element.mozRequestFullScreen || 
                                    element.msRequestFullscreen;
            
            if (requestFullscreen) {
                requestFullscreen.call(element).catch(err => {
                    console.log('Fullscreen request failed:', err);
                    this.showFullscreenError();
            });
        } else {
                this.showFullscreenError();
            }
        } else {
            // Exit fullscreen
            const exitFullscreen = document.exitFullscreen || 
                                  document.webkitExitFullscreen || 
                                  document.mozCancelFullScreen || 
                                  document.msExitFullscreen;
            
            if (exitFullscreen) {
                exitFullscreen.call(document).catch(err => {
                    console.log('Exit fullscreen failed:', err);
                });
            }
        }
    }
    
    showFullscreenError() {
        // Show a brief message that fullscreen is not available
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 10000;
            text-align: center;
        `;
        message.textContent = 'Fullscreen not supported in this browser';
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }
    
    temporaryFireRateBoost(direction) {
        // Temporary fire rate modification with mouse wheel
        const boost = direction > 0 ? 0.8 : 1.2; // Faster or slower
        const originalRate = this.powerUps.rapidFire.active ? GAME_CONFIG.player.rapidFireRate : GAME_CONFIG.player.fireRate;
        
        // Apply temporary modification
        this.tempFireRate = originalRate * boost;
        
        // Reset after short duration
        clearTimeout(this.fireRateTimeout);
        this.fireRateTimeout = setTimeout(() => {
            this.tempFireRate = null;
        }, 1000);
    }
    
    startGame() {
        // Reset game state
        Object.assign(this.state, {
            current: 'playing',
            score: 0,
            lives: 3,
            wave: 1
        });
        
        this.alienMovement.speed = GAME_CONFIG.alien.baseSpeed;
        
        // Reset power-ups
        Object.keys(this.powerUps).forEach(key => {
            if (key === 'bomb') {
                // Keep bomb count between games but reset ready state
                this.powerUps.bomb.ready = this.powerUps.bomb.count > 0;
            } else {
                this.powerUps[key].active = false;
                this.powerUps[key].expireTime = 0;
            }
        });
        
        // Reset player and clear object pools
        this.player.reset(this.elements.canvas.width / 2, this.elements.canvas.height - 50);
        Object.values(this.pools).forEach(pool => pool.releaseAll());
        this.aliens = [];
        
        // Initialize game objects
        this.createAliens();
        this.updateUI();
        this.updateAllButtons();
        
        // Mouse control is always enabled
        this.input.mouse.control = true;
        
        // Start background music if enabled
        if (this.settings.musicEnabled) {
            this.audioSystem.startBackgroundMusic();
        }
    }
    
    updateAllButtons() {
        this.updateButton('soundBtn', this.settings.soundEnabled, 'Sound', '🔊');
        this.updateButton('musicBtn', this.settings.musicEnabled, 'Music', '🎵');
        this.updateFullscreenButton();
    }
    
    updateFullscreenButton() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        const button = this.elements.fullscreenBtn;
        if (button) {
            button.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
            button.style.background = isFullscreen ? 
                'linear-gradient(145deg, #ff6600, #cc4400)' : 
                'linear-gradient(145deg, #00ff00, #00cc00)';
        }
    }
    
    updateUI() {
        // Update UI elements efficiently
        const updates = {
            score: this.state.score,
            lives: this.state.lives,
            highScore: this.state.highScore
        };
        
        // Only update bomb count if element exists
        if (this.elements.bombCount) {
            updates.bombCount = this.powerUps.bomb.count;
        }
        
        Object.entries(updates).forEach(([key, value]) => {
            const element = this.elements[key];
            if (element && element.textContent !== String(value)) {
                element.textContent = value;
            }
        });
        
        // Update high score if needed
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('spaceInvadersHighScore', this.state.highScore);
            this.elements.highScore.textContent = this.state.highScore;
        }
    }
    
    createStars() {
        // Create multiple layers for parallax effect
        this.backgroundLayers.forEach(layer => {
            layer.stars = Array.from({ length: GAME_CONFIG.effects.starCount }, () => ({
                x: Math.random() * this.elements.canvas.width,
                y: Math.random() * this.elements.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * layer.opacity + 0.1
            }));
        });
    }
    
    createAliens() {
        // Release all active aliens back to the pool
        this.aliens.forEach(alien => this.pools.aliens.release(alien));
        this.aliens = [];
        
        const { wave } = this.state;
        const rows = Math.min(5 + Math.floor(wave / 3), 8);
        const cols = Math.max(11 - Math.floor(wave / 5), 6);
        const { width: alienWidth, height: alienHeight } = GAME_CONFIG.alien;
        const spacing = 10;
        const startX = 100;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (alienWidth + spacing);
                const y = startY + row * (alienHeight + spacing);
                const alien = this.pools.aliens.get();
                alien.reset(x, y, row);
                this.aliens.push(alien);
            }
        }
    }
    
    update() {
        // Always update screen shake and splash labels regardless of game state
        this.updateScreenShake();
        this.updateSplashLabels();
        
        if (this.state.current !== 'playing') return;
        
        // Apply screen distortion effect
        this.updateScreenDistortion();
        
        // Update stars with efficient filtering
        this.updateStars();
        
        // Update power-up timers efficiently
        this.updatePowerUpTimers();
        
        // Update player with modern input handling
        this.player.update(this.input.keys, this.elements.canvas.width, this.input.mouse.x, this.input.mouse.control);
        
        // Update wingman ship
        this.updateWingman();
        
        // Handle shooting with improved fire rate system
        this.handleShooting();
        
        // Update game objects using object pools
        this.updateBullets();
        this.updateAliens();
        this.updateParticles();
        this.updateElectricalEffects();
        this.updatePowerUps();
        
        // Check collisions with spatial optimization
        this.checkCollisions();
        this.checkGameEnd();
    }
    
    updateScreenShake() {
        const shake = this.effects.screenShake;
        if (shake.active) {
            const elapsed = Date.now() - shake.startTime;
            if (elapsed >= shake.duration) {
                shake.active = false;
                shake.intensity = 0;
            } else {
                // Decay shake intensity over time
                const progress = elapsed / shake.duration;
                shake.intensity *= (1 - progress * 0.1);
            }
        }
    }
    
    handleShooting() {
        const currentTime = Date.now();
        const shouldShoot = this.input.keys.has('Space') || this.input.mousePressed;
        
        if (!shouldShoot) return;
        
        // Dynamic fire rate based on power-ups and temporary boosts
        let fireRate = this.powerUps.rapidFire.active ? 
                      GAME_CONFIG.player.rapidFireRate : 
                      GAME_CONFIG.player.fireRate;
        
        if (this.tempFireRate) {
            fireRate = this.tempFireRate;
        }
        
        if (currentTime - this.input.lastShot > fireRate) {
            this.shoot();
            this.audioSystem.playSound(440, 0.1, 'square');
            this.input.lastShot = currentTime;
        }
    }
    
    updatePowerUpTimers() {
        const currentTime = Date.now();
        
        // Optimized power-up expiration with mapping
        const expirationMap = {
            'shield': () => this.player.shield = false,
            'rapidFire': () => this.player.rapidFire = false,
            'quadShot': () => this.player.quadShot = false,
            'multiplier': () => {
                this.player.pointsMultiplier = 1;
                this.powerUps.multiplier.value = 1;
            },
            'laser': () => this.player.laser = false,
            'splitShot': () => this.player.splitShot = false,
            'guidedShot': () => this.player.guidedShot = false,
            'timeWarp': () => this.player.timeWarp = false,
            'diamondShot': () => this.player.diamondShot = false,
            'wingman': () => this.wingman.active = false,
            'chainLightning': () => this.player.chainLightning = false
            // 'slowMotion' doesn't need reset as it's global
        };
        
        // Efficiently update all power-ups in one loop
        Object.entries(this.powerUps).forEach(([key, powerUp]) => {
            // Skip permanent power-ups (they don't expire naturally)
            if (powerUp.expireTime === Infinity) {
                return;
            }
            
            if (powerUp.active && currentTime > powerUp.expireTime) {
                powerUp.active = false;
                
                // Apply expiration effect if exists
                const expirationEffect = expirationMap[key];
                if (expirationEffect) {
                    expirationEffect();
                }
            }
        });
    }
    
    shoot() {
        const bulletSpeed = -GAME_CONFIG.bullet.speed;
        
        // Check for laser first (laser overrides other shooting modes)
        if (this.powerUps.laser.active) {
            this.fireLaser();
            this.addScreenShake(1, 50);
            return;
        }
        
        // Optimized bullet creation with power-up combinations
        const bulletConfig = this.getBulletConfiguration();
        
        // Create bullets based on configuration
        for (let i = 0; i < bulletConfig.count; i++) {
            const bullet = this.pools.bullets.get();
            const x = bulletConfig.positions[i] || bulletConfig.positions[0];
            
            bullet.reset(x, this.player.y - 10, bulletSpeed, bulletConfig.color, this);
            bullet.speedX = bulletConfig.speeds[i] || 0;
            
            // Mark as split shot if that power-up is active
            if (this.powerUps.splitShot.active) {
                bullet.splitShot = true;
            }
            
            // Mark as guided shot if that power-up is active
            if (this.powerUps.guidedShot.active) {
                bullet.guidedShot = true;
            }
            
            // Mark as diamond shot if that power-up is active
            if (this.powerUps.diamondShot.active) {
                bullet.diamondShot = true;
            }
            
            // Mark as chain lightning if that power-up is active
            if (this.powerUps.chainLightning.active) {
                bullet.chainLightning = true;
            }
        }
        
        // Trigger screen shake for shooting feedback
        this.addScreenShake(1, 50);
    }
    
    getBulletConfiguration() {
        // Default configuration
        let config = {
            count: 1,
            positions: [this.player.x + this.player.width/2],
            speeds: [0],
            color: '#00ff00'
        };
        
        // Apply rapid fire color
        if (this.powerUps.rapidFire.active) {
            config.color = '#ff00ff';
        }
        
        // Apply split shot color (overrides rapid fire)
        if (this.powerUps.splitShot.active) {
            config.color = '#ff0088';
        }
        
        // Apply guided shot color (overrides others)
        if (this.powerUps.guidedShot.active) {
            config.color = '#ff6600';
        }
        
        // Apply diamond shot color (overrides others)
        if (this.powerUps.diamondShot.active) {
            config.color = '#00ffff';
        }
        
        // Apply chain lightning color (overrides others)
        if (this.powerUps.chainLightning.active) {
            config.color = '#ff00ff';
        }
        
        // Apply quad shot configuration with performance optimization
        if (this.powerUps.quadShot.active) {
            config.count = 4;
            config.positions = [
                this.player.x + 2,
                this.player.x + 8,
                this.player.x + this.player.width - 8,
                this.player.x + this.player.width - 2
            ];
            config.speeds = [-3, -1, 1, 3];
            
            // Performance optimization: Reduce bullet count for combo
            if (this.powerUps.splitShot.active) {
                // Reduce to 3 bullets instead of 4 for quad+split combo
                config.count = 3;
                config.positions = config.positions.slice(0, 3);
                config.speeds = config.speeds.slice(0, 3);
            }
        }
        
        return config;
    }
    
    fireLaser() {
        // Create a laser beam effect
        const laserWidth = 4;
        const laserColor = '#0088ff';
        const laserX = this.player.x + this.player.width/2;
        
        // Check for collisions with aliens along the laser beam
        let laserHit = false;
        
        // Create laser particles
        for (let i = 0; i < 5; i++) {
            const particle = this.pools.particles.get();
            const angle = (Math.PI * 2 * i) / 5;
            const speed = Math.random() * 3 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            particle.reset(
                laserX + (Math.random() - 0.5) * 10, 
                this.player.y, 
                vx, 
                vy, 
                false
            );
            particle.color = laserColor;
        }
        
        // Check for collisions with aliens along the beam
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            
            // Simple collision check - is the alien in the path of the laser?
            if (alien.x <= laserX + laserWidth/2 &&
                alien.x + alien.width >= laserX - laserWidth/2 &&
                alien.y + alien.height >= 0 &&
                alien.y <= this.player.y) {
                
                // Create explosion and update score
                this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
                
                // Remove alien from main array
                this.aliens.splice(i, 1);
                
                const baseScore = (4 - alien.row) * 10;
                const multiplier = this.powerUps.multiplier.active ? this.powerUps.multiplier.value : 1;
                this.state.score += baseScore * multiplier;
                
                this.audioSystem.playSound(1760, 0.1, 'sine');
                laserHit = true;
            }
        }
        
        // Play sound if laser hit something
        if (laserHit) {
            this.updateUI();
        } else {
            this.audioSystem.playSound(880, 0.1, 'sine');
        }
        
        // Add screen shake for laser firing
        this.addScreenShake(0.5, 30);
    }
    
    createSplitBullets(x, y) {
        // Create split bullets that spread out from the impact point
        const splitCount = this.powerUps.quadShot.active ? 3 : 4; // Reduce from 5
        const splitSpeed = -3;
        
        for (let i = 0; i < splitCount; i++) {
            const angle = (Math.PI * 2 * i) / splitCount + Math.random() * 0.3; // Reduced randomness
            const speedX = Math.cos(angle) * 2;
            const speedY = Math.sin(angle) * splitSpeed;
            
            const bullet = this.pools.bullets.get();
            bullet.reset(x, y, speedY, '#ff88cc', this); // Pass game reference
            bullet.speedX = speedX;
            
            // Reduced particle effects for performance
            const particleCount = this.powerUps.quadShot.active ? 1 : 2; // Reduce particles
            for (let j = 0; j < particleCount; j++) {
                const particle = this.pools.particles.get();
                const particleAngle = angle + (Math.random() - 0.5) * 0.3;
                const particleSpeed = Math.random() * 1.5 + 0.5; // Reduced speed
                const vx = Math.cos(particleAngle) * particleSpeed;
                const vy = Math.sin(particleAngle) * particleSpeed;
                particle.reset(x, y, vx, vy, false);
                particle.color = '#ff88cc';
            }
        }
        
        // Play split sound
        this.audioSystem.playSound(1320, 0.2, 'triangle');
    }
    
    createChainLightning(x, y) {
        // Enhanced chain lightning - zap main enemy + nearby enemies
        const chainRadius = 120; // Increased radius for better chaining
        const maxChains = 6; // More chains
        let chains = 0;
        const chainedAliens = [];
        
        // Find all aliens within chain radius
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            const dx = alien.x + alien.width/2 - x;
            const dy = alien.y + alien.height/2 - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= chainRadius) {
                chainedAliens.push({
                    alien: alien,
                    distance: distance,
                    index: i
                });
            }
        }
        
        // Sort by distance (closest first)
        chainedAliens.sort((a, b) => a.distance - b.distance);
        
        // Create electrical zap sequence
        const zapSequence = [];
        const maxZaps = Math.min(maxChains, chainedAliens.length);
        
        // Zap up to maxChains aliens with electrical effects
        for (let i = 0; i < maxZaps; i++) {
            const chainedAlien = chainedAliens[i];
            const alien = chainedAlien.alien;
            
            // Calculate zap positions
            const fromX = i === 0 ? x : chainedAliens[i-1].alien.x + chainedAliens[i-1].alien.width/2;
            const fromY = i === 0 ? y : chainedAliens[i-1].alien.y + chainedAliens[i-1].alien.height/2;
            const toX = alien.x + alien.width/2;
            const toY = alien.y + alien.height/2;
            
            // Add to zap sequence for animated effect
            zapSequence.push({
                fromX, fromY, toX, toY,
                alien: alien,
                index: chainedAlien.index,
                delay: i * 100 // Stagger the zaps
            });
        }
        
        // Animate the zap sequence
        this.animateZapSequence(zapSequence);
        
        // Add dramatic screen effects
        this.addScreenShake(20, 400);
        this.addScreenFlash('#ff00ff', 150);
        
        // Play enhanced chain lightning sound
        this.audioSystem.playSound(1100, 0.4, 'triangle');
        setTimeout(() => this.audioSystem.playSound(1320, 0.3, 'square'), 100);
        setTimeout(() => this.audioSystem.playSound(880, 0.2, 'sawtooth'), 200);
    }
    
    animateZapSequence(zapSequence) {
        zapSequence.forEach((zap, index) => {
            setTimeout(() => {
                // Create electrical zap effect
                this.createElectricalZap(zap.fromX, zap.fromY, zap.toX, zap.toY);
                
                // Destroy alien with electrical explosion
                this.createElectricalExplosion(zap.toX, zap.toY);
                
                // Update score
                const baseScore = (4 - zap.alien.row) * 10;
                const multiplier = this.powerUps.multiplier.active ? this.powerUps.multiplier.value : 1;
                this.state.score += baseScore * multiplier;
                
                // Remove alien
                this.aliens.splice(zap.index, 1);
                
                // Adjust indices for remaining aliens
                for (let j = index + 1; j < zapSequence.length; j++) {
                    if (zapSequence[j].index > zap.index) {
                        zapSequence[j].index--;
                    }
                }
            }, zap.delay);
        });
    }
    
    createElectricalZap(x1, y1, x2, y2) {
        // Create realistic electrical zap between two points
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const segments = Math.max(8, Math.floor(distance / 15)); // More segments for longer zaps
        
        // Create jagged lightning path
        const zapPath = this.generateZapPath(x1, y1, x2, y2, segments);
        
        // Create electrical particles along the path
        for (let i = 0; i < zapPath.length - 1; i++) {
            const current = zapPath[i];
            const next = zapPath[i + 1];
            
            // Create spark particles
            const sparkCount = 3;
            for (let j = 0; j < sparkCount; j++) {
                const particle = this.pools.particles.get();
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                
                particle.reset(current.x, current.y, vx, vy, false, 'spark');
                particle.color = Math.random() < 0.5 ? '#ffffff' : '#ff00ff'; // White or purple sparks
                particle.life = 30;
                particle.maxLife = 30;
                particle.size = Math.random() * 3 + 1;
                
                this.particles.push(particle);
            }
        }
        
        // Create electrical arc effect
        this.createElectricalArc(zapPath);
    }
    
    generateZapPath(x1, y1, x2, y2, segments) {
        // Generate a jagged lightning path between two points
        const path = [];
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const baseX = x1 + dx * t;
            const baseY = y1 + dy * t;
            
            // Add jaggedness to the path
            const jaggedness = 15 * (1 - Math.abs(t - 0.5) * 2); // More jagged in the middle
            const offsetX = (Math.random() - 0.5) * jaggedness;
            const offsetY = (Math.random() - 0.5) * jaggedness;
            
            path.push({
                x: baseX + offsetX,
                y: baseY + offsetY
            });
        }
        
        return path;
    }
    
    createElectricalArc(zapPath) {
        // Create a visual electrical arc effect
        const arcEffect = {
            path: zapPath,
            life: 15,
            maxLife: 15,
            color: '#ff00ff',
            thickness: 3
        };
        
        // Store arc effect for rendering
        if (!this.electricalArcs) {
            this.electricalArcs = [];
        }
        this.electricalArcs.push(arcEffect);
    }
    
    createElectricalExplosion(x, y) {
        // Create electrical explosion effect
        const explosionCount = 12;
        for (let i = 0; i < explosionCount; i++) {
            const particle = this.pools.particles.get();
            const angle = (i / explosionCount) * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particle.reset(x, y, vx, vy, false, 'spark');
            particle.color = Math.random() < 0.3 ? '#ffffff' : '#ff00ff';
            particle.life = 40;
            particle.maxLife = 40;
            particle.size = Math.random() * 4 + 2;
            
            this.particles.push(particle);
        }
        
        // Create electrical shockwave
        this.createElectricalShockwave(x, y);
    }
    
    createElectricalShockwave(x, y) {
        // Create expanding electrical shockwave
        const shockwave = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: 60,
            life: 20,
            maxLife: 20,
            color: '#ff00ff',
            thickness: 2
        };
        
        if (!this.electricalShockwaves) {
            this.electricalShockwaves = [];
        }
        this.electricalShockwaves.push(shockwave);
    }
    
    addScreenShake(intensity, duration) {
        this.effects.screenShake = {
            active: true,
            intensity: intensity,
            duration: duration,
            startTime: Date.now()
        };
    }
    
    useBomb() {
        if (this.powerUps.bomb.count <= 0) return;
        
        // Destroy 50% of all aliens on screen with visual feedback
        const aliensToDestroy = Math.floor(this.aliens.length * 0.5);
        let aliensDestroyed = 0;
        const explosionRadius = 200;
        
        // Create massive explosion effect
        this.addScreenShake(15, GAME_CONFIG.effects.screenShakeDuration);
        
        // Destroy aliens within radius first
        for (let i = this.aliens.length - 1; i >= 0 && aliensDestroyed < aliensToDestroy; i--) {
            const alien = this.aliens[i];
            const distance = Math.sqrt(
                Math.pow(alien.x + alien.width/2 - (this.player.x + this.player.width/2), 2) +
                Math.pow(alien.y + alien.height/2 - (this.player.y + this.player.height/2), 2)
            );
            
            if (distance < explosionRadius) {
                this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, true);
                this.aliens.splice(i, 1);
                aliensDestroyed++;
            }
        }
        
        // Destroy remaining random aliens if needed
        while (aliensDestroyed < aliensToDestroy && this.aliens.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.aliens.length);
            const alien = this.aliens[randomIndex];
            this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, true);
            this.aliens.splice(randomIndex, 1);
            aliensDestroyed++;
        }
        
        // Update score and bomb count
        const multiplier = this.powerUps.multiplier.active ? this.powerUps.multiplier.value : 1;
        this.state.score += aliensDestroyed * 25 * multiplier;
        this.audioSystem.playSound(200, 0.5, 'sawtooth');
        this.updateUI();
        
        // Visual effect at player position
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, true);
        
        // Update bomb status
        this.powerUps.bomb.count--;
        if (this.powerUps.bomb.count <= 0) {
            this.powerUps.bomb.ready = false;
        }
        
        // Check for wave completion
        if (this.aliens.length === 0) {
            this.nextWave();
        }
    }
    
    nextWave() {
        this.state.wave++;
        this.alienMovement.speed += GAME_CONFIG.alien.speedIncrement;
        this.audioSystem.playSound(880, 0.5, 'sine');
        this.createAliens();
        this.updateUI();
        
        // Add screen shake for wave completion
        this.addScreenShake(8, 200);
    }
    
    updateBullets() {
        // Update player bullets using object pool
        const activeBullets = this.pools.bullets.getActiveObjects();
        activeBullets.forEach(bullet => {
            // Apply guided shot tracking if active
            if (bullet.guidedShot && this.aliens.length > 0) {
                this.updateGuidedBullet(bullet);
            }
            
            bullet.update();
            if (bullet.y < 0) {
                this.pools.bullets.release(bullet);
            }
        });
        
        // Update alien bullets using object pool with time warp effect
        const activeAlienBullets = this.pools.alienBullets.getActiveObjects();
        activeAlienBullets.forEach(bullet => {
            // Apply time warp effect to slow down enemy bullets
            if (this.powerUps.timeWarp.active) {
                bullet.speedY *= 0.3; // Slow down enemy bullets by 70%
            }
            
            bullet.update();
            if (bullet.y > this.elements.canvas.height) {
                this.pools.alienBullets.release(bullet);
            }
        });
    }
    
    updateGuidedBullet(bullet) {
        // Find the closest alien to the bullet
        let closestAlien = null;
        let closestDistance = Infinity;
        
        this.aliens.forEach(alien => {
            const dx = alien.x + alien.width/2 - bullet.x;
            const dy = alien.y + alien.height/2 - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance && dy > 0) { // Only track aliens below the bullet
                closestDistance = distance;
                closestAlien = alien;
            }
        });
        
        if (closestAlien) {
            // Calculate direction to target
            const targetX = closestAlien.x + closestAlien.width/2;
            const targetY = closestAlien.y + closestAlien.height/2;
            
            const dx = targetX - bullet.x;
            const dy = targetY - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalize direction and apply tracking speed
                const trackingSpeed = 0.3; // How much the bullet curves toward target
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;
                
                // Gradually adjust bullet direction toward target
                bullet.speedX += normalizedX * trackingSpeed;
                bullet.speedY += normalizedY * trackingSpeed;
                
                // Limit maximum speed to prevent bullets from becoming too fast
                const maxSpeed = 8;
                const currentSpeed = Math.sqrt(bullet.speedX * bullet.speedX + bullet.speedY * bullet.speedY);
                if (currentSpeed > maxSpeed) {
                    bullet.speedX = (bullet.speedX / currentSpeed) * maxSpeed;
                    bullet.speedY = (bullet.speedY / currentSpeed) * maxSpeed;
                }
            }
        }
    }
    
    updateAliens() {
        let shouldDrop = false;
        
        // Apply slow motion effect
        const currentSpeed = this.powerUps.slowMotion.active ? 
                           this.alienMovement.speed * 0.3 : 
                           this.alienMovement.speed;
        
        // Update alien positions and check boundaries
        this.aliens.forEach(alien => {
            alien.update(this.alienMovement.direction, currentSpeed);
            
            if (alien.x <= 0 || alien.x >= this.elements.canvas.width - alien.width) {
                shouldDrop = true;
            }
            
            // Handle shooter aliens
            if (alien.type === 'shooter') {
                alien.shootTimer += 16; // Approximate frame time
                if (alien.shootTimer >= alien.shootInterval) {
                    const bullet = this.pools.alienBullets.get();
                    const speed = 4 + this.state.wave * 0.3;
                    bullet.reset(
                        alien.x + alien.width / 2, 
                        alien.y + alien.height, 
                        speed, 
                        '#ff6600',
                        this
                    );
                    alien.shootTimer = 0;
                    alien.shootInterval = 1000 + Math.random() * 2000; // Reset interval
                }
            }
            
            // Enhanced alien shooting with wave-based frequency for normal aliens
            if (alien.type === 'normal') {
                const shootChance = 0.001 + (this.state.wave * 0.0002);
                if (Math.random() < shootChance) {
                    const bullet = this.pools.alienBullets.get();
                    const speed = 3 + this.state.wave * 0.2;
                    bullet.reset(
                        alien.x + alien.width / 2, 
                        alien.y + alien.height, 
                        speed, 
                        '#ff4400', 
                        this
                    );
                }
            }
        });
        
        // Handle alien movement drop
        if (shouldDrop) {
            this.alienMovement.direction *= -1;
            this.aliens.forEach(alien => {
                alien.y += GAME_CONFIG.alien.dropDistance;
            });
            
            // Add subtle screen shake when aliens drop
            this.addScreenShake(2, 100);
        }
    }
    
    updateStars() {
        this.backgroundLayers.forEach(layer => {
            layer.stars.forEach(star => {
                star.y += star.speed * layer.speed;
                if (star.y > this.elements.canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * this.elements.canvas.width;
                    // Vary star properties for more visual interest
                    star.opacity = Math.random() * layer.opacity + 0.1;
                    star.size = Math.random() * 2 + 0.5;
                }
            });
        });
    }
    
    updateWingman() {
        if (!this.wingman.active) return;
        
        // Position wingman relative to player with oscillation
        this.wingman.offset += 0.1;
        const oscillation = Math.sin(this.wingman.offset) * 15;
        
        this.wingman.x = this.player.x + this.player.width + 10 + oscillation;
        this.wingman.y = this.player.y + this.player.height / 2 - this.wingman.height / 2;
        
        // Wingman shooting
        const currentTime = Date.now();
        if (currentTime - this.wingman.lastShot >= this.wingman.fireRate) {
            this.wingmanShoot();
            this.wingman.lastShot = currentTime;
        }
    }
    
    wingmanShoot() {
        // Create guided bullet from wingman
        const bullet = this.pools.bullets.get();
        if (bullet) {
            bullet.reset(
                this.wingman.x + this.wingman.width / 2,
                this.wingman.y,
                0, // speedX
                -8, // speedY
                '#00ff88' // Green color
            );
            
            // Make it guided
            bullet.guidedShot = true;
            bullet.wingmanBullet = true; // Mark as wingman bullet
            
            // Note: Bullet is automatically added to active objects by the pool
            // No need to push to this.bullets array
            
            // Play wingman shoot sound
            this.audioSystem.playSound(660, 0.1, 'square');
        }
    }
    
    updateParticles() {
        const activeParticles = this.pools.particles.getActiveObjects();
        activeParticles.forEach(particle => {
            particle.update();
            if (particle.life <= 0) {
                this.pools.particles.release(particle);
            }
        });
    }
    
    updateElectricalEffects() {
        // Update electrical arcs
        for (let i = this.electricalArcs.length - 1; i >= 0; i--) {
            const arc = this.electricalArcs[i];
            arc.life--;
            if (arc.life <= 0) {
                this.electricalArcs.splice(i, 1);
            }
        }
        
        // Update electrical shockwaves
        for (let i = this.electricalShockwaves.length - 1; i >= 0; i--) {
            const shockwave = this.electricalShockwaves[i];
            shockwave.life--;
            shockwave.radius += (shockwave.maxRadius / shockwave.maxLife);
            if (shockwave.life <= 0) {
                this.electricalShockwaves.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        const activePowerUps = this.pools.powerUps.getActiveObjects();
        activePowerUps.forEach(powerUp => {
            powerUp.update();
            if (powerUp.y > this.elements.canvas.height) {
                this.pools.powerUps.release(powerUp);
            }
        });
    }
    
    checkCollisions() {
        // Clear and repopulate spatial grid
        this.spatialGrid.clear();
        
        // Add all entities to the spatial grid
        this.aliens.forEach(alien => this.spatialGrid.insert(alien));
        this.pools.bullets.getActiveObjects().forEach(bullet => this.spatialGrid.insert(bullet));
        this.pools.alienBullets.getActiveObjects().forEach(bullet => this.spatialGrid.insert(bullet));
        this.pools.powerUps.getActiveObjects().forEach(powerUp => this.spatialGrid.insert(powerUp));
        
        // Player bullets vs aliens - optimized collision detection using spatial grid
        const playerBullets = this.pools.bullets.getActiveObjects();
        
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            
            // Get nearby aliens using spatial grid
            const nearbyAliens = this.spatialGrid.getNearbyEntities(bullet.x, bullet.y);
            
            for (let j = nearbyAliens.length - 1; j >= 0; j--) {
                const alien = nearbyAliens[j];
                
                // Check if alien is actually in the array (since spatial grid might have duplicates)
                if (this.aliens.includes(alien) && this.collision(bullet, alien)) {
                    // Handle shielded aliens
                    if (alien.type === 'shielded' && alien.shieldStrength > 1) {
                        // Reduce shield strength
                        alien.shieldStrength--;
                        this.pools.bullets.release(bullet);
                        
                        // Visual feedback for shield hit
                        this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
                        this.audioSystem.playSound(880, 0.1, 'sine');
                        break;
                    }
                    
                    // Create explosion and update score
                    this.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
                    
                    // Handle special bullet effects
                    if (bullet.splitShot) {
                        // Create split bullets
                        this.createSplitBullets(bullet.x, bullet.y);
                        this.pools.bullets.release(bullet);
                    } else if (bullet.diamondShot) {
                        // Diamond shot pierces through aliens - don't release bullet
                        // Bullet continues until it hits the top of screen
                        // Just continue to next alien without releasing bullet
                    } else if (bullet.chainLightning) {
                        // Chain lightning effect
                        this.createChainLightning(bullet.x, bullet.y);
                        this.pools.bullets.release(bullet);
                    } else {
                        this.pools.bullets.release(bullet);
                    }
                    
                    // Remove alien from main array
                    const alienIndex = this.aliens.indexOf(alien);
                    if (alienIndex !== -1) {
                        this.aliens.splice(alienIndex, 1);
                    }
                    
                    // Calculate score based on alien type
                    let baseScore = (4 - alien.row) * 10;
                    if (alien.type === 'shielded') {
                        baseScore *= 2; // Shielded aliens are worth more
                    } else if (alien.type === 'shooter') {
                        baseScore *= 1.5; // Shooter aliens are worth more
                    }
                    
                    const multiplier = this.powerUps.multiplier.active ? this.powerUps.multiplier.value : 1;
                    this.state.score += baseScore * multiplier;
                    
                    this.audioSystem.playSound(1100, 0.1, 'square');
                    this.updateUI();
                    break; // Break since bullet is gone
                }
            }
        }
        
        // Alien bullets vs player
        const alienBullets = this.pools.alienBullets.getActiveObjects();
        
        for (let i = alienBullets.length - 1; i >= 0; i--) {
            const bullet = alienBullets[i];
            
            if (this.collision(bullet, this.player)) {
                this.pools.alienBullets.release(bullet);
                
                if (this.powerUps.shield.active) {
                    // Shield absorbs hit
                    this.powerUps.shield.active = false;
                    this.player.shield = false;
                    this.audioSystem.playSound(880, 0.2, 'sine');
                    this.createExplosion(this.player.x, this.player.y);
                } else {
                    // Player takes damage
                    this.state.lives--;
                    this.audioSystem.playSound(150, 0.3, 'sawtooth');
                    this.updateUI();
                    this.createExplosion(this.player.x, this.player.y);
                    this.addScreenShake(10, 200);
                    
                    if (this.state.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        // Power-up collisions
        this.checkPowerUpCollisions();
        
        // Check for wave completion
        if (this.aliens.length === 0 && this.state.current === 'playing') {
            this.nextWave();
        }
    }
    
    collision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkPowerUpCollisions() {
        const activePowerUps = this.pools.powerUps.getActiveObjects();
        
        for (let i = activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = activePowerUps[i];
            
            if (this.collision(powerUp, this.player)) {
                this.pools.powerUps.release(powerUp);
                this.applyPowerUp(powerUp.type);
                this.createExplosion(powerUp.x, powerUp.y);
            }
        }
    }
    
    createSplashLabel(type, x, y) {
        // Optimized label creation using game config
        const config = GAME_CONFIG.powerUps[type];
        if (!config) return;
        
        // Generate label text and colors from config
        const labelText = this.getPowerUpLabelText(type);
        const labelColors = this.getPowerUpLabelColors(type, config);
        
        // Check for compound effects
        const activePowerUps = this.getActivePowerUpNames();
        
        let finalText = labelText;
        let finalColors = labelColors;
        
        if (activePowerUps.length > 1) {
            finalText = `${activePowerUps.join(' + ')} COMBO!`;
            finalColors = { color: '#ffffff', bgColor: '#ff6600' };
        }
        
        this.splashLabels.push({
            x: x,
            y: y,
            text: finalText,
            color: finalColors.color,
            bgColor: finalColors.bgColor,
            life: 120, // 2 seconds at 60fps
            maxLife: 120,
            scale: 1,
            alpha: 1
        });
    }
    
    getPowerUpLabelText(type) {
        const textMap = {
            'life': 'EXTRA LIFE!',
            'rapidFire': 'RAPID FIRE!',
            'shield': 'PERMANENT SHIELD!',
            'quadShot': 'QUAD SHOT!',
            'slowMotion': 'SLOW MOTION!',
            'bomb': 'BOMB READY!',
            'multiplier': 'x2 POINTS!',
            'laser': 'LASER BEAM!',
            'splitShot': 'SPLIT SHOT!',
            'guidedShot': 'GUIDED SHOT!',
            'timeWarp': 'TIME WARP!',
            'diamondShot': 'DIAMOND SHOT!',
            'wingman': 'WINGMAN!',
            'chainLightning': 'CHAIN LIGHTNING!'
        };
        return textMap[type] || 'POWER UP!';
    }
    
    getPowerUpLabelColors(type, config) {
        // Use config colors if available, otherwise defaults
        if (config.color) {
            return {
                color: '#ffffff',
                bgColor: config.color
            };
        }
        
        // Fallback colors for instant power-ups
        const fallbackColors = {
            'life': { color: '#ffff00', bgColor: '#ff0000' },
            'bomb': { color: '#ffffff', bgColor: '#ff0000' }
        };
        
        return fallbackColors[type] || { color: '#ffffff', bgColor: '#00ff00' };
    }
    
    getActivePowerUpNames() {
        const activePowerUps = [];
        if (this.powerUps.quadShot.active) activePowerUps.push('QUAD');
        if (this.powerUps.splitShot.active) activePowerUps.push('SPLIT');
        if (this.powerUps.rapidFire.active) activePowerUps.push('RAPID');
        if (this.powerUps.laser.active) activePowerUps.push('LASER');
        if (this.powerUps.guidedShot.active) activePowerUps.push('GUIDED');
        if (this.powerUps.timeWarp.active) activePowerUps.push('TIME WARP');
        if (this.powerUps.diamondShot.active) activePowerUps.push('DIAMOND');
        if (this.powerUps.wingman.active) activePowerUps.push('WINGMAN');
        if (this.powerUps.chainLightning.active) activePowerUps.push('CHAIN');
        return activePowerUps;
    }
    
    updateSplashLabels() {
        for (let i = this.splashLabels.length - 1; i >= 0; i--) {
            const label = this.splashLabels[i];
            label.life--;
            label.y -= 1; // Float upward
            label.scale = 1 + (label.maxLife - label.life) / label.maxLife * 0.5; // Grow slightly
            label.alpha = label.life / label.maxLife;
            
            if (label.life <= 0) {
                this.splashLabels.splice(i, 1);
            }
        }
    }
    
    renderSplashLabels() {
        this.splashLabels.forEach(label => {
            this.ctx.save();
            this.ctx.globalAlpha = label.alpha;
            this.ctx.scale(label.scale, label.scale);
            
            // Comic-style background
            this.ctx.fillStyle = label.bgColor;
            this.ctx.fillRect(label.x - 50, label.y - 15, 100, 30);
            
            // Comic-style border
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(label.x - 50, label.y - 15, 100, 30);
            
            // Text
            this.ctx.fillStyle = label.color;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(label.text, label.x, label.y);
            
            this.ctx.restore();
        });
    }
    
    renderScreenFlash() {
        if (this.effects.screenFlash && this.effects.screenFlash.active) {
            const flash = this.effects.screenFlash;
            const elapsed = Date.now() - flash.startTime;
            const progress = elapsed / flash.duration;
            
            if (progress < 1) {
                const alpha = Math.sin(progress * Math.PI) * 0.3; // Fade in and out
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = flash.color;
                this.ctx.fillRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
                this.ctx.restore();
            } else {
                flash.active = false;
            }
        }
    }
    
    // Optimized power-up application with unified logic
    applyPowerUp(type) {
        const config = GAME_CONFIG.powerUps[type];
        if (!config) return;
        
        const currentTime = Date.now();
        
        // Add score for all power-ups
        this.state.score += config.score;
        
        // Handle different power-up types
        if (config.type === 'instant') {
            this.handleInstantPowerUp(type);
        } else if (config.type === 'permanent') {
            this.handlePermanentPowerUp(type, config);
        } else {
            // Handle timed power-ups
            this.handleTimedPowerUp(type, config, currentTime);
        }
        
        // Create splash label and update UI
        this.createSplashLabel(type, this.player.x + this.player.width/2, this.player.y - 30);
        this.updateUI();
    }
    
    handleInstantPowerUp(type) {
        switch (type) {
            case 'life':
                this.state.lives = Math.min(this.state.lives + 1, 5);
                this.audioSystem.playSound(660, 0.3, 'sine');
                break;
            case 'bomb':
                this.powerUps.bomb.count++;
                this.powerUps.bomb.ready = true;
                this.audioSystem.playSound(220, 0.6, 'sawtooth');
                break;
        }
    }
                
    handlePermanentPowerUp(type, config) {
        switch (type) {
            case 'shield':
                this.powerUps.shield.active = true;
                this.powerUps.shield.expireTime = Infinity; // Never expires naturally
                this.player.shield = true;
                this.audioSystem.playSound(440, 0.4, 'sine');
                break;
        }
    }
    
    handleTimedPowerUp(type, config, currentTime) {
        // Power-up effect mappings for cleaner code
        const effectMap = {
            'rapidFire': { 
                powerUpKey: 'rapidFire', 
                playerProp: 'rapidFire', 
                sound: { freq: 880, duration: 0.3, type: 'triangle' }
            },
            'shield': { 
                powerUpKey: 'shield', 
                playerProp: 'shield', 
                sound: { freq: 440, duration: 0.4, type: 'sine' }
            },
            'quadShot': { 
                powerUpKey: 'quadShot', 
                playerProp: 'quadShot', 
                sound: { freq: 1100, duration: 0.3, type: 'square' }
            },
            'slowMotion': { 
                powerUpKey: 'slowMotion', 
                playerProp: null, 
                sound: { freq: 330, duration: 0.5, type: 'sawtooth' }
            },
            'multiplier': { 
                powerUpKey: 'multiplier', 
                playerProp: 'pointsMultiplier', 
                playerValue: 2,
                sound: { freq: 1320, duration: 0.3, type: 'sine' }
            },
            'laser': { 
                powerUpKey: 'laser', 
                playerProp: 'laser', 
                sound: { freq: 1760, duration: 0.3, type: 'sine' }
            },
            'splitShot': { 
                powerUpKey: 'splitShot', 
                playerProp: 'splitShot', 
                sound: { freq: 1320, duration: 0.3, type: 'triangle' }
            },
            'guidedShot': { 
                powerUpKey: 'guidedShot', 
                playerProp: 'guidedShot', 
                sound: { freq: 880, duration: 0.4, type: 'sine' }
            },
            'timeWarp': { 
                powerUpKey: 'timeWarp', 
                playerProp: 'timeWarp', 
                sound: { freq: 440, duration: 0.5, type: 'triangle' }
            },
            'diamondShot': { 
                powerUpKey: 'diamondShot', 
                playerProp: 'diamondShot', 
                sound: { freq: 1320, duration: 0.3, type: 'sine' }
            },
            'wingman': { 
                powerUpKey: 'wingman', 
                playerProp: 'wingman', 
                sound: { freq: 660, duration: 0.3, type: 'sawtooth' }
            },
            'chainLightning': { 
                powerUpKey: 'chainLightning', 
                playerProp: 'chainLightning', 
                sound: { freq: 1100, duration: 0.4, type: 'triangle' }
            }
        };
        
        const effect = effectMap[type];
        if (effect) {
            // Activate power-up
            this.powerUps[effect.powerUpKey].active = true;
            this.powerUps[effect.powerUpKey].expireTime = currentTime + config.duration;
            
            // Update player properties
            if (effect.playerProp) {
                if (effect.playerProp === 'wingman') {
                    this.wingman.active = true;
                } else {
                    this.player[effect.playerProp] = effect.playerValue || true;
                }
            }
            
            // Play sound
            this.audioSystem.playSound(effect.sound.freq, effect.sound.duration, effect.sound.type);
            
            // Special activation effects
            // (No special effects needed for remaining power-ups)
        }
    }
    
    
    
    addScreenFlash(color, duration) {
        this.effects.screenFlash = {
            active: true,
            color: color,
            duration: duration,
            startTime: Date.now()
        };
    }
    
    renderStars() {
        this.backgroundLayers.forEach(layer => {
            layer.stars.forEach(star => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * star.size / 2})`;
                this.ctx.fillRect(star.x, star.y, star.size, star.size);
                
                // Add twinkling effect
                if (Math.random() < 0.01) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                    this.ctx.fillRect(star.x - 1, star.y - 1, star.size + 2, star.size + 2);
                }
            });
        });
    }
    
    renderPowerUpStatus() {
        const activePowerUps = [];
        const currentTime = Date.now();
        
        // Collect active power-ups with modern syntax
        const powerUpConfig = {
            shield: { emoji: '🛡', name: 'SHIELD', color: '#00ffff' },
            rapidFire: { emoji: '⚡', name: 'RAPID FIRE', color: '#ff00ff' },
            quadShot: { emoji: '🔫', name: 'QUAD SHOT', color: '#00ff00' },
            splitShot: { emoji: '💫', name: 'SPLIT SHOT', color: '#ff0088' },
            slowMotion: { emoji: '🐌', name: 'SLOW MOTION', color: '#ff8800' },
            multiplier: { emoji: '✨', name: 'x2 POINTS', color: '#ffff88' },
            laser: { emoji: '🔴', name: 'LASER', color: '#0088ff' },
            guidedShot: { emoji: '🎯', name: 'GUIDED SHOT', color: '#ff6600' },
            timeWarp: { emoji: '⏰', name: 'TIME WARP', color: '#8800ff' },
            diamondShot: { emoji: '💎', name: 'DIAMOND SHOT', color: '#00ffff' },
            wingman: { emoji: '🚀', name: 'WINGMAN', color: '#00ff88' },
            chainLightning: { emoji: '⚡', name: 'CHAIN LIGHTNING', color: '#ff00ff' }
        };
        
        Object.entries(this.powerUps).forEach(([key, powerUp]) => {
            if (powerUp.active && powerUpConfig[key]) {
                const config = powerUpConfig[key];
                let displayText;
                
                // Handle permanent power-ups (no timer)
                if (powerUp.expireTime === Infinity) {
                    displayText = `${config.emoji} ${config.name} (PERMANENT)`;
                } else {
                    const timeLeft = Math.max(0, Math.ceil((powerUp.expireTime - currentTime) / 1000));
                    displayText = `${config.emoji} ${config.name} (${timeLeft}s)`;
                }
                
                activePowerUps.push({
                    text: displayText,
                    color: config.color
                });
            }
        });
        
        // Add bomb indicator (always show bomb count even when not active)
        if (this.powerUps.bomb.count > 0) {
            activePowerUps.push({
                text: `💣 BOMB (B) x${this.powerUps.bomb.count}`,
                color: '#ff0000'
            });
        }
        
        // Add music indicator
        if (this.musicPlaying && this.settings.musicEnabled) {
            activePowerUps.push({
                text: '🎵 MUSIC',
                color: '#88ff88'
            });
        }
        
        if (activePowerUps.length === 0) return;
        
        // Enhanced rendering with better layout
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const padding = 10;
        const lineHeight = 25;
        const maxPerRow = Math.floor(this.elements.canvas.width / 180);
        
        activePowerUps.forEach((powerUp, index) => {
            const row = Math.floor(index / maxPerRow);
            const col = index % maxPerRow;
            const x = padding + col * 180;
            const y = 30 + row * lineHeight;
            
            // Add background for better readability
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x - 5, y - 15, 170, 20);
            
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillText(powerUp.text, x, y);
        });
    }
    
        
    createExplosion(x, y, isBomb = false) {
        // Create more particles for bomb explosions (reduced for performance)
        const particleCount = isBomb ? GAME_CONFIG.effects.particleCount * 1.5 : GAME_CONFIG.effects.particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.pools.particles.get();
            
            // Enhanced particle initialization with more variety
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = isBomb ? (Math.random() * 8 + 4) : (Math.random() * 6 + 2);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Use explosion particle type for better visual effects
            particle.reset(x, y, vx, vy, isBomb, 'explosion');
        }
        
        // Add spark particles for extra visual effect (reduced for performance)
        const sparkCount = isBomb ? 8 : 5;
        for (let i = 0; i < sparkCount; i++) {
            const particle = this.pools.particles.get();
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            particle.reset(x, y, vx, vy, false, 'spark');
        }
        
        // Add screen distortion effect for large explosions
        if (isBomb) {
            this.addScreenDistortion(0.5, 200);
        }
        
        this.audioSystem.playSound(220, 0.2, 'sawtooth');
        
        // Smart power-up spawning with overlap prevention
        this.spawnPowerUpIfAppropriate(x, y, isBomb);
    }
    
    spawnPowerUpIfAppropriate(x, y, isBomb = false) {
        const currentTime = Date.now();
        
        // Check minimum drop interval
        if (currentTime - this.powerUpManager.lastDropTime < this.powerUpManager.minDropInterval) {
            return;
        }
        
        // Count active power-ups on screen
        const activePowerUps = this.pools.powerUps.getActiveObjects();
        const activeCount = activePowerUps.length;
        
        // Don't spawn if too many power-ups already active
        if (activeCount >= this.powerUpManager.maxActivePowerUps) {
            return;
        }
        
        // Check for combo cooldown (prevent quad+split combos too often)
        const hasComboPowerUps = this.powerUps.quadShot.active && this.powerUps.splitShot.active;
        if (hasComboPowerUps && currentTime - this.powerUpManager.lastDropTime < this.powerUpManager.comboCooldown) {
            return;
        }
        
        // Calculate dynamic drop chance
        let baseChance = isBomb ? 0.25 : 0.08; // Reduced from 0.4/0.15
        
        // Reduce chance if many power-ups active
        if (activeCount > 1) {
            baseChance *= this.powerUpManager.dropChanceReduction;
        }
        
        // Further reduce chance if combo power-ups are active
        if (hasComboPowerUps) {
            baseChance *= 0.3; // 70% reduction
        }
        
        // Spawn power-up if chance succeeds
        if (Math.random() < baseChance) {
            const powerUp = this.pools.powerUps.get();
            powerUp.reset(x, y, this); // Pass game instance for smart type selection
            this.powerUpManager.lastDropTime = currentTime;
        }
    }
    
    addScreenDistortion(intensity, duration) {
        this.effects.screenDistortion = {
            active: true,
            intensity: intensity,
            duration: duration,
            startTime: Date.now()
        };
    }
    
    updateScreenDistortion() {
        const distortion = this.effects.screenDistortion;
        if (distortion && distortion.active) {
            const elapsed = Date.now() - distortion.startTime;
            if (elapsed >= distortion.duration) {
                distortion.active = false;
                distortion.intensity = 0;
            } else {
                // Decay distortion intensity over time
                const progress = elapsed / distortion.duration;
                distortion.intensity *= (1 - progress * 0.05);
            }
        }
    }
    
    checkGameEnd() {
        // Check if aliens reached the player
        for (const alien of this.aliens) {
            if (alien.y + alien.height >= this.player.y) {
                this.gameOver();
                return;
            }
        }
    }
    
    gameOver() {
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('spaceInvadersHighScore', this.state.highScore);
        }
        
        this.audioSystem.playSound(100, 0.5, 'sawtooth');
        this.audioSystem.stopBackgroundMusic();
        this.state.current = 'gameOver';
        
        // Release all pooled objects including aliens
        Object.values(this.pools).forEach(pool => pool.releaseAll());
        this.aliens = [];
        
        // Major screen shake for game over (1 second as requested)
        this.addScreenShake(20, 1000);
    }
    
    render() {
        // Apply screen shake effect
        let shakeX = 0, shakeY = 0;
        if (this.effects.screenShake.active) {
            const intensity = this.effects.screenShake.intensity;
            shakeX = (Math.random() - 0.5) * intensity;
            shakeY = (Math.random() - 0.5) * intensity;
        }
        
        // Apply screen distortion effect
        let distortionX = 0, distortionY = 0;
        if (this.effects.screenDistortion && this.effects.screenDistortion.active) {
            const intensity = this.effects.screenDistortion.intensity;
            distortionX = (Math.random() - 0.5) * intensity * 10;
            distortionY = (Math.random() - 0.5) * intensity * 10;
        }
        
        // Save context for transformations
        this.ctx.save();
        this.ctx.translate(shakeX + distortionX, shakeY + distortionY);
        
        // Enhanced background with slow motion effect
        const bgColor = this.powerUps.slowMotion.active ? '#001133' : '#000011';
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        
        // Render stars and status
        this.renderStars();
        this.renderPowerUpStatus();
        this.renderSplashLabels();
        this.renderScreenFlash();
        
        // Render game states
        switch (this.state.current) {
            case 'menu':
                this.renderMenuScreen();
                break;
            case 'paused':
                this.renderPausedScreen();
                break;
            case 'gameOver':
                this.renderGameOverScreen();
                break;
            case 'playing':
                this.renderGameplayElements();
                break;
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    renderMenuScreen() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPACE INVADERS', this.elements.canvas.width / 2, this.elements.canvas.height / 2);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Start Game to begin', this.elements.canvas.width / 2, this.elements.canvas.height / 2 + 40);
        this.ctx.fillText('Press F for fullscreen | Mouse + Keyboard controls', this.elements.canvas.width / 2, this.elements.canvas.height / 2 + 70);
    }
    
    renderPausedScreen() {
        this.renderGameplayElements();
        
        // Add pause overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.elements.canvas.width / 2, this.elements.canvas.height / 2);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press ESC to resume', this.elements.canvas.width / 2, this.elements.canvas.height / 2 + 40);
    }
    
    renderGameOverScreen() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.elements.canvas.width / 2, this.elements.canvas.height / 2);
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Final Score: ${this.state.score}`, this.elements.canvas.width / 2, this.elements.canvas.height / 2 + 40);
        
        if (this.state.score === this.state.highScore) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('NEW HIGH SCORE!', this.elements.canvas.width / 2, this.elements.canvas.height / 2 + 70);
        }
    }
    
    renderGameplayElements() {
        // Optimized batch rendering for maximum performance
        this.renderPlayer();
        this.renderBulletBatch();
        this.renderAlienBatch();
        this.renderEffectBatch();
    }
    
    renderPlayer() {
        this.ctx.save();
        this.player.render(this.ctx);
        
        // Render wingman ship if active
        if (this.wingman.active) {
            this.renderWingman();
        }
        
        this.ctx.restore();
    }
    
    renderWingman() {
        this.ctx.save();
        
        // Wingman ship body
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(this.wingman.x, this.wingman.y, this.wingman.width, this.wingman.height);
        
        // Wingman ship details
        this.ctx.fillStyle = '#44ffaa';
        this.ctx.fillRect(this.wingman.x + 2, this.wingman.y + 2, this.wingman.width - 4, this.wingman.height - 4);
        
        // Wingman cockpit
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.wingman.x + 8, this.wingman.y + 6, 9, 8);
        
        // Wingman glow effect
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(this.wingman.x, this.wingman.y, this.wingman.width, this.wingman.height);
        
        this.ctx.restore();
    }
    
    renderBulletBatch() {
        // Render laser beam if active
        if (this.powerUps.laser.active) {
            this.renderLaser();
        }
        
        const activeBullets = this.pools.bullets.getActiveObjects();
        const activeAlienBullets = this.pools.alienBullets.getActiveObjects();
        
        if (activeBullets.length === 0 && activeAlienBullets.length === 0) return;
        
        this.ctx.save();
        
        // Batch render player bullets
        activeBullets.forEach(bullet => bullet.render(this.ctx));
        
        // Batch render alien bullets
        activeAlienBullets.forEach(bullet => bullet.render(this.ctx));
        
        this.ctx.restore();
    }
    
    renderAlienBatch() {
        if (this.aliens.length === 0) return;
        
        this.ctx.save();
        
        // Group aliens by row for better batching
        const aliensByRow = {};
        this.aliens.forEach(alien => {
            const row = alien.row;
            if (!aliensByRow[row]) aliensByRow[row] = [];
            aliensByRow[row].push(alien);
        });
        
        // Render each row as a batch
        Object.values(aliensByRow).forEach(rowAliens => {
            rowAliens.forEach(alien => alien.render(this.ctx));
        });
        
        this.ctx.restore();
    }
    
    renderEffectBatch() {
        const activeParticles = this.pools.particles.getActiveObjects();
        const activePowerUps = this.pools.powerUps.getActiveObjects();
        
        // Render electrical effects
        this.renderElectricalEffects();
        
        if (activeParticles.length === 0 && activePowerUps.length === 0) return;
        
        this.ctx.save();
        
        // Batch render particles by type
        if (activeParticles.length > 0) {
            const particlesByType = {};
            activeParticles.forEach(particle => {
                const type = particle.type || 'default';
                if (!particlesByType[type]) particlesByType[type] = [];
                particlesByType[type].push(particle);
            });
            
            Object.values(particlesByType).forEach(typeParticles => {
                typeParticles.forEach(particle => particle.render(this.ctx));
            });
        }
        
        // Batch render power-ups
        if (activePowerUps.length > 0) {
            activePowerUps.forEach(powerUp => powerUp.render(this.ctx));
        }
        
        this.ctx.restore();
    }
    
    renderBullets() {
        // Render laser beam if active
        if (this.powerUps.laser.active) {
            this.renderLaser();
        }
        
        // Batch render player bullets
        const playerBullets = this.pools.bullets.getActiveObjects();
        if (playerBullets.length > 0) {
            // Set common state once for all green bullets
            this.ctx.shadowColor = '#00ff00';
            this.ctx.fillStyle = '#00ff00';
            
            playerBullets.forEach(bullet => {
                // Only set varying properties
                this.ctx.shadowBlur = 3;
                this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                
                // Add bright core
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.width - 2, bullet.height - 2);
                this.ctx.fillStyle = '#00ff00';
            });
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
        
        // Batch render alien bullets (now using individual bullet rendering for diamond shapes)
        const alienBullets = this.pools.alienBullets.getActiveObjects();
        if (alienBullets.length > 0) {
            alienBullets.forEach(bullet => bullet.render(this.ctx));
        }
    }
    
    renderLaser() {
        // Render a continuous laser beam from the player upward
        const laserWidth = 4;
        const laserX = this.player.x + this.player.width/2 - laserWidth/2;
        
        // Create a gradient for the laser beam
        const gradient = this.ctx.createLinearGradient(laserX, this.player.y, laserX, 0);
        gradient.addColorStop(0, 'rgba(0, 136, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');
        
        // Draw the laser beam
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(laserX, 0, laserWidth, this.player.y);
        
        // Add glow effect
        this.ctx.shadowColor = '#0088ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(laserX - 2, 0, laserWidth + 4, this.player.y);
        this.ctx.shadowBlur = 0;
        
        // Add periodic bright flashes
        if (Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(laserX + 1, 0, laserWidth - 2, this.player.y);
        }
    }
    
    renderAliens() {
        if (this.aliens.length === 0) return;
        
        // Group aliens by row for batch rendering
        const aliensByRow = {};
        this.aliens.forEach(alien => {
            if (!aliensByRow[alien.row]) {
                aliensByRow[alien.row] = [];
            }
            aliensByRow[alien.row].push(alien);
        });
        
        // Render each row with batched state changes
        Object.keys(aliensByRow).forEach(row => {
            const aliens = aliensByRow[row];
            const colorIndex = Math.min(row, aliens[0].colors.length - 1);
            const baseColor = aliens[0].colors[colorIndex];
            
            // Set common state for this row
            const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.003 + aliens[0].pulseOffset);
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            
            this.ctx.fillStyle = `rgb(${Math.floor(r * pulse)}, ${Math.floor(g * pulse)}, ${Math.floor(b * pulse)})`;
            
            // Add glow effect for top row aliens
            if (row === "0") {
                this.ctx.shadowColor = baseColor;
                this.ctx.shadowBlur = 5;
            }
            
            // Render all aliens in this row
            aliens.forEach(alien => {
                // Enhanced alien rendering with better animation
                const frame = Math.floor(alien.animationFrame);
                
                if (frame === 0) {
                    // Frame 1: Extended form
                    this.ctx.fillRect(alien.x + 5, alien.y, 30, 20);
                    this.ctx.fillRect(alien.x, alien.y + 20, 40, 10);
                    this.ctx.fillRect(alien.x + 5, alien.y + 25, 5, 5);
                    this.ctx.fillRect(alien.x + 30, alien.y + 25, 5, 5);
                    
                    // Eyes
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(alien.x + 12, alien.y + 8, 4, 4);
                    this.ctx.fillRect(alien.x + 24, alien.y + 8, 4, 4);
                    this.ctx.fillStyle = `rgb(${Math.floor(r * pulse)}, ${Math.floor(g * pulse)}, ${Math.floor(b * pulse)})`;
                } else {
                    // Frame 2: Contracted form
                    this.ctx.fillRect(alien.x + 10, alien.y, 20, 20);
                    this.ctx.fillRect(alien.x, alien.y + 20, 40, 10);
                    this.ctx.fillRect(alien.x + 10, alien.y + 25, 5, 5);
                    this.ctx.fillRect(alien.x + 25, alien.y + 25, 5, 5);
                    
                    // Eyes
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(alien.x + 14, alien.y + 8, 4, 4);
                    this.ctx.fillRect(alien.x + 22, alien.y + 8, 4, 4);
                    this.ctx.fillStyle = `rgb(${Math.floor(r * pulse)}, ${Math.floor(g * pulse)}, ${Math.floor(b * pulse)})`;
                }
            });
            
            // Reset shadow for next row
            if (row === "0") {
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    renderEffects() {
        // Batch render particles
        const activeParticles = this.pools.particles.getActiveObjects();
        if (activeParticles.length > 0) {
            activeParticles.forEach(particle => particle.render(this.ctx));
        }
        
        // Batch render power-ups
        const activePowerUps = this.pools.powerUps.getActiveObjects();
        if (activePowerUps.length > 0) {
            activePowerUps.forEach(powerUp => powerUp.render(this.ctx));
        }
    }
    
    renderElectricalEffects() {
        this.ctx.save();
        
        // Render electrical arcs
        this.electricalArcs.forEach(arc => {
            const alpha = arc.life / arc.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = arc.color;
            this.ctx.lineWidth = arc.thickness;
            this.ctx.shadowColor = arc.color;
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(arc.path[0].x, arc.path[0].y);
            
            for (let i = 1; i < arc.path.length; i++) {
                this.ctx.lineTo(arc.path[i].x, arc.path[i].y);
            }
            
            this.ctx.stroke();
        });
        
        // Render electrical shockwaves
        this.electricalShockwaves.forEach(shockwave => {
            const alpha = shockwave.life / shockwave.maxLife;
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.strokeStyle = shockwave.color;
            this.ctx.lineWidth = shockwave.thickness;
            this.ctx.shadowColor = shockwave.color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    gameLoop(currentTime = 0) {
        // Variable timestep with frame limiting for consistent performance
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Only update if enough time has passed (frame limiting)
        if (deltaTime >= frameTime) {
            this.update(deltaTime);
        this.render();
            this.lastFrameTime = currentTime;
        }
        
        requestAnimationFrame(time => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
