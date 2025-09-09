import { GAME_CONFIG } from '../core/game-engine.js';

export class PowerUp {
    constructor(x, y) {
        this.reset(x, y);
        this.width = 20;
        this.height = 20;
        this.speed = 2;
    }
    
    reset(x, y, gameInstance = null) {
        this.x = x;
        this.y = y;
        this.pulse = Math.random() * Math.PI * 2; // Random start phase
        this.types = ['life', 'rapidFire', 'shield', 'quadShot', 'slowMotion', 'bomb', 'multiplier', 'laser', 'splitShot', 'guidedShot', 'timeWarp', 'diamondShot', 'wingman', 'chainLightning'];
        
        // Smart type selection to prevent performance-heavy combos
        this.type = this.selectOptimalType(gameInstance);
        
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.rotation = 0;
    }
    
    selectOptimalType(gameInstance) {
        if (!gameInstance) {
            // Fallback to random selection
            return this.types[Math.floor(Math.random() * this.types.length)];
        }
        
        // Get currently active power-ups
        const activePowerUps = [];
        if (gameInstance.powerUps.quadShot.active) activePowerUps.push('quadShot');
        if (gameInstance.powerUps.splitShot.active) activePowerUps.push('splitShot');
        if (gameInstance.powerUps.rapidFire.active) activePowerUps.push('rapidFire');
        if (gameInstance.powerUps.laser.active) activePowerUps.push('laser');
        if (gameInstance.powerUps.guidedShot.active) activePowerUps.push('guidedShot');
        
        // Filter out performance-heavy combinations
        const filteredTypes = [...this.types];
        
        // If quad shot is active, reduce chance of split shot
        if (gameInstance.powerUps.quadShot.active) {
            const splitShotIndex = filteredTypes.indexOf('splitShot');
            if (splitShotIndex !== -1 && Math.random() < 0.7) { // 70% chance to skip split shot
                filteredTypes.splice(splitShotIndex, 1);
            }
        }
        
        // If split shot is active, reduce chance of quad shot
        if (gameInstance.powerUps.splitShot.active) {
            const quadShotIndex = filteredTypes.indexOf('quadShot');
            if (quadShotIndex !== -1 && Math.random() < 0.7) { // 70% chance to skip quad shot
                filteredTypes.splice(quadShotIndex, 1);
            }
        }
        
        // If multiple shooting power-ups are active, prefer utility power-ups
        const shootingPowerUps = ['quadShot', 'splitShot', 'rapidFire', 'laser', 'guidedShot'];
        const activeShootingCount = activePowerUps.filter(p => shootingPowerUps.includes(p)).length;
        
        if (activeShootingCount >= 2) {
            // Prefer utility power-ups when multiple shooting power-ups are active
            const utilityTypes = ['life', 'shield', 'slowMotion', 'bomb', 'multiplier'];
            const availableUtility = filteredTypes.filter(t => utilityTypes.includes(t));
            if (availableUtility.length > 0 && Math.random() < 0.6) { // 60% chance to pick utility
                return availableUtility[Math.floor(Math.random() * availableUtility.length)];
            }
        }
        
        // Default random selection from filtered types
        return filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
    }
    
    update() {
        this.y += this.speed;
        this.pulse += 0.15;
        this.rotation += this.rotationSpeed;
    }
    
    render(ctx) {
        const pulseSize = Math.sin(this.pulse) * 4;
        
        // Enhanced color scheme
        const colors = {
            'life': { primary: '#ffff00', secondary: '#ffff88' },
            'rapidFire': { primary: '#ff00ff', secondary: '#ff88ff' },
            'shield': { primary: '#00ffff', secondary: '#88ffff' },
            'quadShot': { primary: '#00ff00', secondary: '#88ff88' },
            'slowMotion': { primary: '#ff8800', secondary: '#ffaa44' },
            'bomb': { primary: '#ff0000', secondary: '#ff8888' },
            'multiplier': { primary: '#ffff88', secondary: '#ffffcc' },
            'laser': { primary: '#0088ff', secondary: '#88ccff' },
            'splitShot': { primary: '#ff0088', secondary: '#ff88cc' },
            'guidedShot': { primary: '#ff6600', secondary: '#ffaa44' },
            'timeWarp': { primary: '#8800ff', secondary: '#aa44ff' },
            'diamondShot': { primary: '#00ffff', secondary: '#44ffff' },
            'wingman': { primary: '#00ff88', secondary: '#44ffaa' },
            'chainLightning': { primary: '#ff00ff', secondary: '#ff88ff' }
        };
        
        const colorScheme = colors[this.type];
        
        // Save context for rotation
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Render background with glow
        ctx.shadowColor = colorScheme.primary;
        ctx.shadowBlur = 8 + pulseSize;
        
        ctx.fillStyle = colorScheme.primary;
        ctx.fillRect(-this.width/2 - pulseSize/2, -this.height/2 - pulseSize/2, 
                    this.width + pulseSize, this.height + pulseSize);
        
        // Inner bright core
        ctx.fillStyle = colorScheme.secondary;
        ctx.fillRect(-this.width/2 + 2, -this.height/2 + 2, this.width - 4, this.height - 4);
        
        ctx.shadowBlur = 0;
        
        // Render symbol
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbols = {
            'life': '❤️',      // Red heart for life/health
            'rapidFire': '⚡',     // Lightning for rapid fire
            'shield': '🛡️',    // Shield for protection
            'quadShot': '🔫',     // Gun for quad shot (4 bullets)
            'slowMotion': '🐌',     // Snail for slow motion
            'bomb': '💥',     // Explosion for bomb
            'multiplier': '✨', // Sparkles for bonus points
            'laser': '🔴',     // Red dot for laser beam
            'splitShot': '💫',  // Star burst for split shot
            'guidedShot': '🎯',  // Target for guided shot
            'timeWarp': '⏰',    // Clock for time warp
            'diamondShot': '💎', // Diamond for piercing shot
            'wingman': '🚀',     // Rocket for wingman ship
            'chainLightning': '⚡' // Lightning for chain effect
        };
        
        ctx.fillText(symbols[this.type], 0, 0);
        
        // Restore context
        ctx.restore();
    }
}