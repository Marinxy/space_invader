import { GAME_CONFIG } from '../core/game-engine.js';

export class Bullet {
    constructor(x, y, speed, color, game = null) {
        this.reset(x, y, speed, color, game);
        this.width = GAME_CONFIG.bullet.width;
        this.height = GAME_CONFIG.bullet.height;
        this.trail = []; // For trail effect
    }
    
    reset(x, y, speed, color, game = null) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.speedX = 0; // Horizontal velocity for spread shots
        this.color = color;
        this.splitShot = false; // Whether this bullet splits on impact
        this.game = game; // Reference to the game for particle effects
        this.trail = [];
    }
    
    update() {
        // Store previous position for trail effect
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.pop();
        }
        
        this.y += this.speed;
        this.x += this.speedX; // Apply horizontal velocity
        
        // Create trail particles periodically (only if game reference exists)
        if (this.game && Math.random() < 0.3) {
            const particle = this.game.pools.particles.get();
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            particle.reset(this.x, this.y, vx, vy, false, 'trail');
        }
    }
    
    render(ctx) {
        // Check if this is an enemy bullet (orange colors)
        const isEnemyBullet = this.color === '#ff4400' || this.color === '#ff6600';
        
        // Render trail effect
        this.trail.forEach((pos, index) => {
            const alpha = (this.trail.length - index) / this.trail.length * 0.5;
            let trailColor;
            
            if (isEnemyBullet) {
                trailColor = this.color === '#ff4400' ? 
                    `rgba(255, 68, 0, ${alpha})` : 
                    `rgba(255, 102, 0, ${alpha})`;
            } else {
                trailColor = this.color === '#00ff00' ? 
                    `rgba(0, 255, 0, ${alpha})` : 
                    `rgba(255, 0, 0, ${alpha})`;
            }
            
            ctx.fillStyle = trailColor;
            ctx.fillRect(pos.x, pos.y, this.width, this.height / 2);
        });
        
        if (isEnemyBullet) {
            // Render enemy bullets as diamond/rhombus shape with pulsing effect
            const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const size = this.width * pulse;
            
            // Outer glow
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = this.color;
            
            // Draw diamond shape
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - size/2); // Top
            ctx.lineTo(centerX + size/2, centerY); // Right
            ctx.lineTo(centerX, centerY + size/2); // Bottom
            ctx.lineTo(centerX - size/2, centerY); // Left
            ctx.closePath();
            ctx.fill();
            
            // Inner bright core
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffaa00';
            const innerSize = size * 0.6;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - innerSize/2);
            ctx.lineTo(centerX + innerSize/2, centerY);
            ctx.lineTo(centerX, centerY + innerSize/2);
            ctx.lineTo(centerX - innerSize/2, centerY);
            ctx.closePath();
            ctx.fill();
            
            // Bright center dot
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(centerX - 1, centerY - 1, 2, 2);
        } else {
            // Render player bullets as rectangles (original behavior)
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 3;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add bright core
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
            
            ctx.shadowBlur = 0;
        }
    }
}