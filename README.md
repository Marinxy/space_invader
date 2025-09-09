# 🚀 Modern Space Invaders

A modern, feature-rich implementation of the classic Space Invaders arcade game built with HTML5 Canvas and vanilla JavaScript. This project features enhanced graphics, multiple power-ups, advanced controls, and optimized performance.

![Space Invaders Game](https://img.shields.io/badge/Game-Space%20Invaders-green)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🎮 Core Gameplay
- **Classic Space Invaders mechanics** with modern enhancements
- **Progressive difficulty** - aliens get faster and more aggressive each wave
- **Multiple alien types**: Normal, Shooter, and Shielded aliens
- **Lives system** with visual feedback
- **High score tracking** with localStorage persistence

### 🎯 Advanced Controls
- **Keyboard controls**: Arrow keys for movement, Spacebar for shooting
- **Mouse controls**: Move with mouse, click to shoot, right-click for bombs
- **Touch controls**: Mobile-friendly touch interface
- **Fullscreen support**: Press F for immersive gameplay
- **Pause functionality**: ESC key or pause button

### ⚡ Power-ups System
- **🛡️ Shield**: Permanent protection until hit
- **⚡ Rapid Fire**: Increased shooting rate
- **🔫 Quad Shot**: Shoot 4 bullets simultaneously
- **💫 Split Shot**: Bullets split into fragments on impact
- **🎯 Guided Shot**: Bullets track the nearest enemy
- **⏰ Time Warp**: Slows down enemy bullets
- **💎 Diamond Shot**: Piercing bullets that go through enemies
- **🚀 Wingman**: AI-controlled companion ship
- **⚡ Chain Lightning**: Bullets chain between multiple enemies
- **🐌 Slow Motion**: Slows alien movement
- **💥 Bomb**: Instant screen clear (B key or right-click)
- **✨ 2x Points**: Double score multiplier

### 🎨 Visual Effects
- **Particle systems** for explosions and impacts
- **Screen shake** and distortion effects
- **Parallax scrolling** starfield background
- **Glow effects** and visual feedback
- **Smooth animations** and transitions
- **Electrical effects** for chain lightning

### 🔊 Audio System
- **Procedural sound generation** using Web Audio API
- **Background music** with toggle controls
- **Sound effects** for all game actions
- **Audio settings** persistence

### 📱 Responsive Design
- **Mobile-optimized** with touch controls
- **Responsive canvas** that adapts to screen size
- **Accessibility features** with ARIA labels
- **Cross-browser compatibility**

## 🚀 Quick Start

### Prerequisites
- Modern web browser with HTML5 Canvas support
- No additional dependencies required!

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Marinxy/space_invader.git
   cd space_invader
   ```

2. **Open the game**:
   - Simply open `index.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Start playing**:
   - Click "Start Game" or press any key
   - Use arrow keys or mouse to move
   - Press Spacebar or hold mouse to shoot
   - Press B or right-click to use bombs

### 🌐 Live Demo
**Play the game online**: [https://space-invaders-game.netlify.app](https://space-invaders-game.netlify.app)

The game is deployed on Netlify and ready to play in your browser!

## 🎮 How to Play

### Basic Controls
| Action | Keyboard | Mouse | Touch |
|--------|----------|-------|-------|
| Move Left | ← Arrow | Move mouse left | Touch left button |
| Move Right | → Arrow | Move mouse right | Touch right button |
| Shoot | Spacebar | Hold mouse button | Touch shoot button |
| Bomb | B | Right-click | - |
| Pause | ESC | - | - |
| Fullscreen | F | - | - |

### Game Mechanics
1. **Destroy all aliens** to advance to the next wave
2. **Avoid alien bullets** - you have 3 lives
3. **Collect power-ups** that drop from destroyed aliens
4. **Use bombs strategically** to clear difficult situations
5. **Score points** by destroying aliens (higher rows = more points)

### Power-up Strategy
- **Shield** provides permanent protection until hit
- **Rapid Fire** + **Quad Shot** = devastating firepower
- **Chain Lightning** is most effective against grouped enemies
- **Wingman** provides additional firepower and guided shots
- **Bombs** are limited but can clear 50% of aliens instantly

## 🏗️ Project Structure

```
space-invaders/
├── index.html              # Main HTML file
├── style.css               # Game styling and layout
├── src/
│   ├── main.js             # Main game logic and initialization
│   ├── core/
│   │   └── game-engine.js  # Core game engine and utilities
│   ├── entities/
│   │   ├── player.js       # Player spaceship class
│   │   ├── alien.js        # Alien enemy classes
│   │   ├── bullet.js       # Bullet projectile class
│   │   ├── particle.js     # Particle effect class
│   │   └── power-up.js     # Power-up item class
│   └── systems/
│       └── audio.js        # Audio system and sound generation
└── README.md               # This file
```

## 🔧 Technical Details

### Architecture
- **Object-Oriented Design**: Clean separation of concerns with dedicated classes
- **Object Pooling**: Efficient memory management for bullets, particles, and effects
- **Spatial Grid**: Optimized collision detection system
- **Modular Systems**: Separate audio, rendering, and game logic systems

### Performance Optimizations
- **60 FPS target** with frame limiting
- **Object pooling** for bullets, particles, and power-ups
- **Spatial partitioning** for collision detection
- **Batch rendering** for similar objects
- **Efficient particle systems** with automatic cleanup

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Touch controls supported

## 🎯 Development

### Code Style
- **ES6+ JavaScript** with modern syntax
- **Consistent naming** conventions
- **Comprehensive comments** for complex logic
- **Modular architecture** for maintainability

### Key Classes
- **`Game`**: Main game controller and state management
- **`Player`**: Player spaceship with movement and shooting
- **`Alien`**: Enemy entities with different types and behaviors
- **`Bullet`**: Projectile system with various types
- **`PowerUp`**: Power-up items with different effects
- **`AudioSystem`**: Sound generation and management

## 🐛 Troubleshooting

### Common Issues
1. **Game not loading**: Ensure you're using a modern browser with Canvas support
2. **Audio not working**: Check browser audio permissions
3. **Touch controls not working**: Ensure you're on a mobile device or enable mobile mode
4. **Performance issues**: Close other browser tabs or reduce particle effects

### Browser Requirements
- **HTML5 Canvas** support
- **Web Audio API** support (for sound)
- **ES6+ JavaScript** support
- **Local Storage** support (for high scores)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Space Invaders** by Taito (1978)
- **HTML5 Canvas** for rendering
- **Web Audio API** for sound generation
- **Modern JavaScript** features and best practices

## 📞 Support

If you encounter any issues or have questions:
- **Open an issue** on GitHub
- **Check the troubleshooting** section above
- **Review the code** comments for implementation details

---

**Enjoy the game!** 🎮✨

*Built with ❤️ using vanilla JavaScript and HTML5 Canvas*
