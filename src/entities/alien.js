import { GAME_CONFIG } from '../core/game-engine.js';

export class Alien {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.width = GAME_CONFIG.alien.width;
        this.height = GAME_CONFIG.alien.height;
        this.animationFrame = Math.random() * 2; // Random start for variety
        this.pulseOffset = Math.random() * Math.PI * 2; // For pulsing effect
        
        // Determine alien type based on row and wave
        this.type = this.determineType(row);
        this.colors = this.getColorsForType();
        
        // Type-specific properties
        if (this.type === 'shielded') {
            this.shieldStrength = 2; // Requires 2 hits to destroy
        } else if (this.type === 'shooter') {
            this.shootTimer = 0;
            this.shootInterval = 1000 + Math.random() * 2000; // 1-3 seconds
        }
    }
    
    determineType(row) {
        // Higher rows have a chance for special aliens
        if (row === 0) {
            // Top row has 20% chance for shielded alien
            return Math.random() < 0.2 ? 'shielded' : 'normal';
        } else if (row === 1) {
            // Second row has 15% chance for shooter alien
            return Math.random() < 0.15 ? 'shooter' : 'normal';
        }
        return 'normal';
    }
    
    getColorsForType() {
        switch (this.type) {
            case 'shielded':
                return ['#00ffff', '#88ffff', '#00cccc', '#008888', '#004444', '#00aaaa'];
            case 'shooter':
                return ['#ff00ff', '#ff88ff', '#cc00cc', '#880088', '#440044', '#aa00aa'];
            default:
                return ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
        }
    }
    
    reset(x, y, row) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.animationFrame = Math.random() * 2; // Random start for variety
        this.pulseOffset = Math.random() * Math.PI * 2; // For pulsing effect
        
        // Determine alien type based on row and wave
        this.type = this.determineType(row);
        this.colors = this.getColorsForType();
        
        // Type-specific properties
        if (this.type === 'shielded') {
            this.shieldStrength = 2; // Requires 2 hits to destroy
        } else if (this.type === 'shooter') {
            this.shootTimer = 0;
            this.shootInterval = 1000 + Math.random() * 2000; // 1-3 seconds
        }
    }
    
    update(direction, speed) {
        this.x += direction * speed;
        this.animationFrame += 0.1;
        if (this.animationFrame >= 2) {
            this.animationFrame = 0;
        }
    }
    
    render(ctx) {
        const colorIndex = Math.min(this.row, this.colors.length - 1);
        const baseColor = this.colors[colorIndex];
        
        // Add pulsing effect for visual appeal
        const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.003 + this.pulseOffset);
        
        // Parse color and apply pulse
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        ctx.fillStyle = `rgb(${Math.floor(r * pulse)}, ${Math.floor(g * pulse)}, ${Math.floor(b * pulse)})`;
        
        // Enhanced alien rendering with better animation
        const frame = Math.floor(this.animationFrame);
        
        if (frame === 0) {
            // Frame 1: Extended form
            ctx.fillRect(this.x + 5, this.y, 30, 20);
            ctx.fillRect(this.x, this.y + 20, 40, 10);
            ctx.fillRect(this.x + 5, this.y + 25, 5, 5);
            ctx.fillRect(this.x + 30, this.y + 25, 5, 5);
            
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 12, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 24, this.y + 8, 4, 4);
        } else {
            // Frame 2: Contracted form
            ctx.fillRect(this.x + 10, this.y, 20, 20);
            ctx.fillRect(this.x, this.y + 20, 40, 10);
            ctx.fillRect(this.x + 10, this.y + 25, 5, 5);
            ctx.fillRect(this.x + 25, this.y + 25, 5, 5);
            
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 14, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 22, this.y + 8, 4, 4);
        }
        
        // Add shield effect for shielded aliens
        if (this.type === 'shielded') {
            const shieldPulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldPulse})`;
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10 * shieldPulse;
            ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
            ctx.shadowBlur = 0;
            
            // Show shield strength
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.shieldStrength}`, this.x + this.width/2, this.y - 5);
        }
        
        // Add glow effect for top row aliens
        if (this.row === 0) {
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 5;
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }
    }
}