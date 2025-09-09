# 🤝 Contributing Guidelines

Thank you for your interest in contributing to the Space Invaders project! This document provides guidelines and instructions for contributing to the codebase.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Testing Guidelines](#testing-guidelines)

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Git for version control
- Text editor or IDE (VS Code recommended)
- Basic knowledge of JavaScript, HTML5, and CSS

### Fork and Clone
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/space_invader.git
   cd space_invader
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Marinxy/space_invader.git
   ```

## 🛠️ Development Setup

### Local Development
1. **Open the project** in your preferred editor
2. **Start a local server** (required for proper functionality):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open in browser**: Navigate to `http://localhost:8000`

### Development Tools
- **VS Code Extensions** (recommended):
  - Live Server
  - Prettier
  - ESLint
  - JavaScript (ES6) code snippets

### Project Structure
```
space-invaders/
├── index.html              # Main HTML file
├── style.css               # Game styling
├── src/
│   ├── main.js             # Main game logic
│   ├── core/
│   │   └── game-engine.js  # Core engine utilities
│   ├── entities/           # Game entity classes
│   └── systems/            # Game system classes
├── docs/                   # Documentation
├── README.md
└── CONTRIBUTING.md
```

## 📝 Code Style Guidelines

### JavaScript Style
- **ES6+ syntax** preferred
- **Camel case** for variables and functions
- **Pascal case** for classes
- **UPPER_CASE** for constants
- **2 spaces** for indentation
- **Semicolons** at end of statements

### Example Code Style
```javascript
// Good
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = GAME_CONFIG.player.speed;
    }
    
    update(keys, canvasWidth) {
        if (keys.has('ArrowLeft')) {
            this.moveLeft();
        }
    }
    
    moveLeft() {
        this.x = Math.max(0, this.x - this.speed);
    }
}

// Bad
class player{
constructor(x,y){
this.x=x
this.y=y
this.speed=GAME_CONFIG.player.speed
}
update(keys,canvasWidth){
if(keys.has('ArrowLeft')){
this.moveLeft()
}
}
moveLeft(){
this.x=Math.max(0,this.x-this.speed)
}
}
```

### HTML Style
- **Proper indentation** (2 spaces)
- **Semantic HTML** elements
- **Accessibility** attributes (ARIA labels)
- **Consistent formatting**

### CSS Style
- **2 spaces** indentation
- **Consistent naming** (kebab-case for classes)
- **Logical grouping** of properties
- **Comments** for complex sections

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Ensure code follows** style guidelines
3. **Update documentation** if needed
4. **Check for performance** impact
5. **Verify cross-browser** compatibility

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested on mobile
- [ ] Performance tested

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on multiple browsers
4. **Performance** validation
5. **Documentation** review

## 🐛 Issue Reporting

### Bug Reports
When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Browser and version** information
5. **Screenshots** if applicable
6. **Console errors** if any

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g., Chrome 91]
- OS: [e.g., Windows 10]
- Game Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other context or screenshots
```

### Feature Guidelines
- **Clear description** of the feature
- **Justification** for why it's needed
- **Implementation ideas** if possible
- **Consideration** of existing features
- **Performance impact** assessment

## 🧪 Testing Guidelines

### Manual Testing
1. **Game functionality** - all features work as expected
2. **Cross-browser testing** - Chrome, Firefox, Safari
3. **Mobile testing** - touch controls work properly
4. **Performance testing** - maintains 60 FPS
5. **Edge cases** - unusual inputs and scenarios

### Test Scenarios
- **New game** starts correctly
- **All power-ups** work as expected
- **Collision detection** is accurate
- **Audio** plays correctly
- **Controls** respond properly
- **Game over** conditions trigger correctly

### Performance Testing
- **Frame rate** remains stable
- **Memory usage** doesn't increase over time
- **Object pooling** works correctly
- **Spatial grid** optimizes collisions

## 📚 Documentation

### Code Documentation
- **JSDoc comments** for all public methods
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** updates

### Example Documentation
```javascript
/**
 * Updates the player position based on input
 * @param {Set} keys - Set of currently pressed keys
 * @param {number} canvasWidth - Width of the game canvas
 * @param {number} mouseX - Current mouse X position
 * @param {boolean} mouseControl - Whether mouse control is active
 */
update(keys, canvasWidth, mouseX, mouseControl) {
    // Implementation
}
```

## 🎯 Contribution Areas

### High Priority
- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Mobile responsiveness** improvements
- **Accessibility** enhancements

### Medium Priority
- **New power-ups** and game mechanics
- **Visual effects** improvements
- **Audio enhancements**
- **UI/UX improvements**

### Low Priority
- **Code refactoring**
- **Documentation improvements**
- **Test coverage** expansion
- **Build system** improvements

## 🚫 What Not to Contribute

### Avoid These Changes
- **Breaking changes** without discussion
- **Major architectural changes** without approval
- **Dependencies** without justification
- **Code that doesn't follow** style guidelines
- **Features that don't fit** the game's scope

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for general questions
- **Pull Request comments** for code review discussions

### Questions to Ask
- Is this change necessary?
- Does it follow the existing patterns?
- Will it impact performance?
- Is it properly tested?
- Is documentation updated?

## 🏆 Recognition

### Contributors
Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

### Types of Contributions
- **Code contributions** (bug fixes, features)
- **Documentation** improvements
- **Testing** and bug reporting
- **Design** and UI improvements
- **Community** support and help

## 📋 Checklist for Contributors

### Before Contributing
- [ ] Read and understand the guidelines
- [ ] Check existing issues and PRs
- [ ] Fork and clone the repository
- [ ] Set up development environment
- [ ] Understand the codebase structure

### During Development
- [ ] Follow code style guidelines
- [ ] Write clear, documented code
- [ ] Test changes thoroughly
- [ ] Consider performance impact
- [ ] Update documentation if needed

### Before Submitting
- [ ] Test on multiple browsers
- [ ] Check for console errors
- [ ] Verify performance is maintained
- [ ] Update relevant documentation
- [ ] Write clear commit messages

### After Submitting
- [ ] Respond to review feedback
- [ ] Make requested changes
- [ ] Test final implementation
- [ ] Help with any issues

---

Thank you for contributing to the Space Invaders project! Your contributions help make the game better for everyone. 🎮✨
