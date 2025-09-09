import { GAME_CONFIG } from '../core/game-engine.js';

export class Player {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.player.width;
        this.height = GAME_CONFIG.player.height;
        this.speed = GAME_CONFIG.player.speed;
        
        // Power-up states
        this.rapidFire = false;
        this.shield = false;
        this.tripleShot = false;
        this.splitShot = false;
        this.laser = false;
        this.pointsMultiplier = 1;
        
        // Animation state
        this.thrusterAnimation = 0;
    }
    
    update(keys, canvasWidth, mouseX = null, useMouseControl = false) {
        // Update thruster animation
        this.thrusterAnimation += 0.2;
        
        if (mouseX !== null && useMouseControl) {
            // Enhanced mouse control with smoothing
            const targetX = mouseX - this.width / 2;
            const diff = targetX - this.x;
            const smoothingFactor = 0.15;
            this.x += diff * smoothingFactor;
        } else {
            // Keyboard control
            if (keys.has('ArrowLeft') && this.x > 0) {
                this.x -= this.speed;
            }
            if (keys.has('ArrowRight') && this.x < canvasWidth - this.width) {
                this.x += this.speed;
            }
        }
        
        // Keep player within bounds
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }
    
    render(ctx) {
        // Enhanced rendering with better visual effects
        
        // Shield effect with pulsing animation
        if (this.shield) {
            const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15 * pulseIntensity;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.shadowBlur = 0;
        }
        
        // Rapid fire glow effect
        if (this.rapidFire) {
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 10;
        }
        
        // Main player body - changes color based on active power-ups
        let shipColor = '#00ff00'; // Default green
        
        // Priority order for ship color (later power-ups override earlier ones)
        if (this.splitShot) {
            shipColor = '#ff0088'; // Pink for split shot
        }
        if (this.rapidFire) {
            shipColor = '#ff00ff'; // Magenta for rapid fire (overrides split shot)
        }
        if (this.laser) {
            shipColor = '#0088ff'; // Blue for laser (overrides others)
        }
        
        ctx.fillStyle = shipColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Cockpit window
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 5, this.y - 5, 30, 5);
        
        // Enhanced thrusters with animation
        const thrusterFlame = Math.sin(this.thrusterAnimation) > 0 ? 10 : 8;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + 10, this.y + 30, 5, thrusterFlame);
        ctx.fillRect(this.x + 25, this.y + 30, 5, thrusterFlame);
        
        // Thruster glow
        ctx.fillStyle = '#ff8888';
        ctx.fillRect(this.x + 11, this.y + 31, 3, thrusterFlame - 2);
        ctx.fillRect(this.x + 26, this.y + 31, 3, thrusterFlame - 2);
        
        ctx.shadowBlur = 0;
        
        // Quad shot indicators - color changes based on compound power-ups
        if (this.tripleShot) {
            // Determine cannon color based on active power-ups
            let cannonColor = '#00ff00'; // Default green
            let glowColor = '#88ff88';
            
            if (this.splitShot) {
                cannonColor = '#ff0088'; // Pink for split shot
                glowColor = '#ff88cc';
            }
            if (this.rapidFire) {
                cannonColor = '#ff00ff'; // Magenta for rapid fire
                glowColor = '#ff88ff';
            }
            
            ctx.fillStyle = cannonColor;
            ctx.fillRect(this.x + 2, this.y - 15, 3, 10);
            ctx.fillRect(this.x + 8, this.y - 15, 3, 10);
            ctx.fillRect(this.x + this.width - 8, this.y - 15, 3, 10);
            ctx.fillRect(this.x + this.width - 2, this.y - 15, 3, 10);
            
            // Glow effect for quad shot indicators
            ctx.fillStyle = glowColor;
            ctx.fillRect(this.x + 3, this.y - 14, 1, 8);
            ctx.fillRect(this.x + 9, this.y - 14, 1, 8);
            ctx.fillRect(this.x + this.width - 7, this.y - 14, 1, 8);
            ctx.fillRect(this.x + this.width - 1, this.y - 14, 1, 8);
        }
        
        // Split shot - ship changes color instead of showing canons
        if (this.splitShot) {
            // Ship glows with split shot color
            ctx.shadowColor = '#ff0088';
            ctx.shadowBlur = 15;
        }
        
        // Laser indicator
        if (this.laser) {
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(this.x + 15, this.y - 20, 10, 15);
            
            // Glow effect for laser indicator
            ctx.fillStyle = '#88ccff';
            ctx.fillRect(this.x + 16, this.y - 19, 8, 13);
        }
        
        // Rapid fire indicator
        if (this.rapidFire) {
            // Pulsing effect for rapid fire
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
            ctx.fillStyle = `rgba(255, 0, 255, ${pulse})`;
            ctx.fillRect(this.x - 5, this.y + 5, 3, 20);
            ctx.fillRect(this.x + this.width + 2, this.y + 5, 3, 20);
        }
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.rapidFire = false;
        this.shield = false;
        this.tripleShot = false;
        this.splitShot = false;
        this.laser = false;
        this.pointsMultiplier = 1;
        this.thrusterAnimation = 0;
    }
}