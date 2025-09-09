export class Particle {
    constructor(x, y) {
        this.reset(x, y);
    }
    
    reset(x, y, vx = null, vy = null, isBomb = false, type = 'normal') {
        this.x = x;
        this.y = y;
        this.vx = vx || (Math.random() - 0.5) * 8;
        this.vy = vy || (Math.random() - 0.5) * 8;
        this.life = isBomb ? 60 : 30; // Bomb particles last longer
        this.maxLife = this.life;
        this.size = isBomb ? (Math.random() * 4 + 2) : (Math.random() * 3 + 1);
        this.type = type; // normal, explosion, trail, or spark
        
        // Set color based on type
        switch (type) {
            case 'explosion':
                this.color = `hsl(${Math.random() * 60}, 100%, 50%)`; // Orange/red for explosions
                break;
            case 'trail':
                this.color = `hsl(${Math.random() * 120 + 180}, 70%, 70%)`; // Blue/cyan for trails
                this.life = 20;
                this.size = Math.random() * 2 + 1;
                break;
            case 'spark':
                this.color = `hsl(${Math.random() * 360}, 100%, 80%)`; // Bright colors for sparks
                this.life = 15;
                this.size = Math.random() * 1.5 + 0.5;
                break;
            default:
                this.color = `hsl(${Math.random() * 360}, 70%, 70%)`; // Random colors for regular
        }
        
        this.gravity = type === 'spark' ? -0.05 : 0.1; // Sparks float up
        this.friction = 0.98;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Apply rotation
        this.rotation += this.rotationSpeed;
        
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        const currentSize = this.size * alpha;
        
        // Save context for rotation
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Enhanced particle rendering with glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = currentSize * 2;
        
        // Parse HSL color and convert to RGBA for alpha
        ctx.fillStyle = this.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
        
        // Render particle based on type
        switch (this.type) {
            case 'explosion':
            case 'spark':
                // Render as a circle for explosions and sparks
                ctx.beginPath();
                ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add bright core
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'trail':
                // Render as a diamond for trails
                ctx.beginPath();
                ctx.moveTo(0, -currentSize);
                ctx.lineTo(currentSize, 0);
                ctx.lineTo(0, currentSize);
                ctx.lineTo(-currentSize, 0);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                // Render as a circle for regular particles
                ctx.beginPath();
                ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add bright core
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
        }
        
        // Restore context
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}