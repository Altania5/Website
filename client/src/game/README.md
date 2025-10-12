# Altanian Conqueror - Phaser WebGL Version

This is the WebGL/Phaser version of the Altanian Conqueror game, built with Phaser 3 and Socket.io for real-time multiplayer functionality.

## Features

### Core Gameplay
- **Interactive Planet Harvesting**: Click on planets to harvest resources with visual feedback
- **Real-time Resource Management**: Energy, Altanerite, and Homainionite resources
- **Generator System**: Build solar panels, miners, and reactors for automated production
- **Ship Building**: Construct ships to boost harvesting efficiency
- **Galaxy Navigation**: Travel between planets in the Zwamsha system

### Visual Features
- **WebGL Rendering**: Smooth 60fps gameplay with hardware acceleration
- **Particle Effects**: Click effects, harvest animations, and production sparks
- **Floating Numbers**: Visual feedback for resource gains
- **Planet Animations**: Rotating planets with hover effects
- **Screen Shake**: Impact feedback for significant actions

### Technical Features
- **Real-time Synchronization**: WebSocket-based game state updates
- **Modular Architecture**: Separate managers for game state, input, and particles
- **Keyboard Shortcuts**: Space for harvest, G for galaxy map, etc.
- **Responsive UI**: React overlay with real-time resource display
- **Connection Status**: Visual indicator for server connectivity

## Architecture

### Scenes
- **BootScene**: Asset loading with progress bar
- **MainScene**: Main game view with planet and base
- **GalaxyScene**: Star map for planet travel

### Managers
- **GameStateManager**: Handles backend communication and game state
- **InputManager**: Keyboard and mouse input handling
- **ParticleManager**: Visual effects and animations

### Objects
- **Generator**: Animated generator sprites with production effects
- **Planet**: Interactive planet sprites with click handling

## Controls

### Keyboard Shortcuts
- `Space`: Harvest planet
- `G`: Open galaxy map
- `H`: Quick harvest
- `M`: Military tab
- `I`: Inventory
- `E`: Energy tab
- `F`: Frequency tab
- `Tab`: Cycle UI elements
- `Escape`: Cancel/close

### Mouse
- **Click**: Harvest planet or interact with objects
- **Hover**: Visual feedback on interactive elements
- **Scroll**: Zoom controls (planned)

## API Integration

The game communicates with the backend through WebSocket events:

### Client → Server
- `authenticate`: Login with JWT token
- `harvest-planet`: Harvest resources from current planet
- `travel-to`: Travel to specified planet
- `buy-generator`: Purchase generator
- `build-ship`: Construct new ship

### Server → Client
- `game-state-update`: Real-time game state synchronization
- `harvest-result`: Harvest operation result
- `travel-result`: Travel operation result
- `buy-result`: Purchase operation result

## Development

### Running the Game
1. Start the development server: `npm start`
2. Navigate to `/portal/game-v2` in the browser
3. Login with your account credentials
4. The game will automatically connect to the WebSocket server

### File Structure
```
client/src/game/
├── config.js              # Phaser configuration
├── scenes/                 # Game scenes
│   ├── BootScene.js        # Asset loading
│   ├── MainScene.js        # Main game view
│   └── GalaxyScene.js      # Galaxy map
├── objects/                 # Game objects
│   └── Generator.js        # Generator sprite class
├── managers/               # Game managers
│   ├── GameStateManager.js # Backend communication
│   ├── InputManager.js     # Input handling
│   └── ParticleManager.js   # Visual effects
└── README.md              # This file
```

### Adding New Features

1. **New Scenes**: Add to `scenes/` directory and register in `config.js`
2. **New Objects**: Extend Phaser.GameObjects.Sprite in `objects/`
3. **New Managers**: Create in `managers/` and initialize in scenes
4. **New Socket Events**: Add handlers in `server/src/routes/socket-handlers.js`

## Performance

### Optimization Features
- **Object Pooling**: Reuse particle objects for better performance
- **Sprite Batching**: Group similar sprites for fewer draw calls
- **Texture Atlases**: Combine multiple sprites into single texture
- **60 FPS Target**: Smooth gameplay with consistent frame rate

### Memory Management
- **Automatic Cleanup**: Destroy unused objects and particles
- **Event Cleanup**: Remove event listeners on scene destruction
- **Texture Management**: Unload unused textures

## Future Enhancements

### Planned Features
- **Sound Effects**: Audio feedback for actions
- **Mobile Support**: Touch controls and responsive design
- **Save System**: Local and cloud save functionality
- **Multiplayer**: Real-time multiplayer gameplay
- **Advanced Graphics**: Shaders and post-processing effects

### Technical Improvements
- **Asset Pipeline**: Automated sprite sheet generation
- **Performance Profiling**: Built-in performance monitoring
- **Error Handling**: Comprehensive error recovery
- **Testing**: Unit and integration tests

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check server is running on port 5000
2. **Assets Not Loading**: Verify image files exist in `/public/images/`
3. **Performance Issues**: Check browser WebGL support
4. **Input Not Working**: Ensure canvas has focus

### Debug Mode
Enable debug mode by adding `?debug=true` to the URL for additional logging and visual debugging aids.

## Contributing

When contributing to the Phaser game:
1. Follow the existing code structure and naming conventions
2. Add appropriate error handling and logging
3. Test performance impact of new features
4. Update this README with new features or changes
5. Ensure compatibility with the existing React components
