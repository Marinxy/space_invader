// Game Configuration
const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 40,
        height: 30,
        speed: 5,
        fireRate: 200,
        rapidFireRate: 25  // Machine gun speed!
    },
    alien: {
        width: 40,
        height: 30,
        dropDistance: 20,
        baseSpeed: 1,
        speedIncrement: 0.5
    },
    bullet: {
        width: 4,
        height: 10,
        speed: 5
    },
    powerUps: {
        // Core power-ups with consistent naming
        life: { score: 50, type: 'instant' },
        bomb: { score: 150, type: 'instant' },
        
        // Timed power-ups with duration and visual effects
        shield: { score: 75, color: '#00ffff', glowColor: '#88ffff', type: 'permanent' },
        rapidFire: { duration: 5000, score: 100, color: '#ff00ff', glowColor: '#ff88ff' },
        quadShot: { duration: 10000, score: 125, color: '#00ff00', glowColor: '#88ff88' },
        slowMotion: { duration: 7000, score: 80, color: '#ff8800', glowColor: '#ffaa44' },
        multiplier: { duration: 15000, score: 90, color: '#ffff88', glowColor: '#ffffcc' },
        laser: { duration: 2500, score: 150, color: '#0088ff', glowColor: '#88ccff' },
        splitShot: { duration: 8000, score: 125, color: '#ff0088', glowColor: '#ff88cc' },
        guidedShot: { duration: 6000, score: 100, color: '#ff6600', glowColor: '#ffaa44' },
        
        // New advanced power-ups
        timeWarp: { duration: 4000, score: 120, color: '#8800ff', glowColor: '#aa44ff' },
        diamondShot: { duration: 5000, score: 110, color: '#00ffff', glowColor: '#44ffff' },
        wingman: { duration: 8000, score: 120, color: '#00ff88', glowColor: '#44ffaa' },
        chainLightning: { duration: 7000, score: 130, color: '#ff00ff', glowColor: '#ff88ff' }
    },
    audio: {
        musicVolume: 0.1,
        effectVolume: 0.2
    },
    effects: {
        particleCount: 15,
        starCount: 100,
        screenShakeDuration: 300
    }
};

// Object Pools for performance
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 20) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
        
        // Performance tracking
        this.stats = {
            totalCreated: initialSize,
            maxActive: 0,
            poolHits: 0,
            poolMisses: 0
        };
    }
    
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.poolHits++;
        } else {
            obj = this.createFn();
            this.stats.poolMisses++;
            this.stats.totalCreated++;
        }
        this.active.add(obj);
        this.stats.maxActive = Math.max(this.stats.maxActive, this.active.size);
        return obj;
    }
    
    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    releaseAll() {
        this.active.forEach(obj => {
            this.resetFn(obj);
            this.pool.push(obj);
        });
        this.active.clear();
    }
    
    getActiveObjects() {
        return Array.from(this.active);
    }
    
    getStats() {
        return {
            ...this.stats,
            poolHitRate: this.stats.poolHits / (this.stats.poolHits + this.stats.poolMisses) * 100,
            currentActive: this.active.size,
            poolSize: this.pool.length
        };
    }
    
    // Optimize pool size based on usage patterns
    optimize() {
        const avgActive = this.stats.maxActive;
        const optimalSize = Math.max(avgActive * 1.5, 10);
        
        if (this.pool.length > optimalSize) {
            // Reduce pool size
            const excess = this.pool.length - optimalSize;
            this.pool.splice(0, excess);
        } else if (this.pool.length < optimalSize) {
            // Increase pool size
            const needed = optimalSize - this.pool.length;
            for (let i = 0; i < needed; i++) {
                this.pool.push(this.createFn());
            }
        }
    }
}

class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = Array(this.cols * this.rows).fill().map(() => []);
    }
    
    getCellIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return row * this.cols + col;
    }
    
    insert(entity) {
        const index = this.getCellIndex(entity.x, entity.y);
        if (index >= 0 && index < this.grid.length) {
            this.grid[index].push(entity);
        }
    }
    
    getNearbyEntities(x, y) {
        const results = [];
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        // Check current and adjacent cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkCol = col + dx;
                const checkRow = row + dy;
                const index = checkRow * this.cols + checkCol;
                
                if (index >= 0 && index < this.grid.length) {
                    results.push(...this.grid[index]);
                }
            }
        }
        
        return results;
    }
    
    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }
}

export { GAME_CONFIG, ObjectPool, SpatialGrid };