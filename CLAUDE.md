# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack personal portfolio website with an integrated idle game called "Altanian Conqueror". The project is a monorepo containing both client (React) and server (Node.js/Express) applications that run concurrently.

## Development Commands

### Starting the Application
```bash
npm start                # Start both server and client concurrently
npm run dev              # Same as start
npm run server-only      # Run server only (port 5000)
npm run client           # Run client only (port 3000) - requires server running
```

Alternative startup methods:
- Windows: `start.bat`
- Unix/Linux/Mac: `./start.sh`

### Client Commands (in client/ directory)
```bash
npm start                # Start React dev server
npm run build            # Build for production
npm test                 # Run tests
```

### Server Commands (in server/ directory)
```bash
npm start                # Start server with node
npm run dev              # Start with nodemon (auto-restart)
```

## Architecture Overview

### Dual Game System
This project contains TWO distinct game implementations:

1. **React-based Idle Game** (`/portal/game`)
   - Original implementation using React components and hooks
   - Game loop managed by `useGameLoop` custom hook
   - Manual resource management and UI updates
   - Located in: `client/src/components/IdleGame.js`

2. **Phaser WebGL Game** (`/portal/game-v2`)
   - Newer implementation using Phaser 3 game engine
   - Real-time Socket.io communication
   - Hardware-accelerated rendering with particle effects
   - Located in: `client/src/components/PhaserGame.js` and `client/src/game/`

Both games share the same backend API and database models but have different rendering approaches.

### Backend Communication Patterns

**REST API** (used by React idle game):
- Authentication: JWT tokens via `Authorization` header
- Endpoints: `/api/game/*`, `/api/auth/*`, `/api/admin/*`
- Manual state fetching with axios

**WebSocket** (used by Phaser game):
- Real-time bidirectional communication via Socket.io
- Authentication: JWT token sent via `authenticate` event
- Room-based updates: `user-${userId}` rooms
- Socket handlers: `server/src/routes/socket-handlers.js`

### Database Architecture

**MongoDB (via Mongoose)**:
- Game state: `server/src/models/Game.js`
- User accounts: `server/src/models/User.js`
- Single game instance per user (unique userId constraint)

**MySQL** (legacy, may be deprecated):
- Connection info in `process.env` file
- Not actively used in current game logic

### Game State Management

The `Game` model schema contains:
- `resources`: energy, altanerite, homainionite
- `inventory`: 20+ craftable/harvestable materials
- `fleet`: ships and military units with levels
- `generators`: solarPanels, reactors, miners
- `location`: galaxy/system/planet with mode (planet/space)
- `lastTickAt`: timestamp for offline progress calculation

Key method: `game.getProductionRatesPerSecond()` calculates passive income.

### Phaser Game Structure

**Scenes**:
- `BootScene`: Asset loading with progress bar
- `MainScene`: Primary gameplay view (planet harvesting, base building)
- `GalaxyScene`: Star map for interplanetary travel

**Managers**:
- `GameStateManager`: Backend communication, game state sync
- `InputManager`: Keyboard shortcuts and mouse handling
- `ParticleManager`: Visual effects (clicks, harvests, floating numbers)

**Game Objects**:
- `Generator`: Animated sprites for solar panels/miners/reactors
- Custom planet sprites with click detection

### Frontend Routing

**Public Routes**:
- `/` - Home page
- `/projects` - Project showcase
- `/about` - About page
- `/altania` - Game landing page
- `/login` - Authentication

**Protected Routes** (require `<RequireAuth>`):
- `/portal` - Dashboard
- `/portal/home` - Colony control
- `/portal/game` - React idle game
- `/portal/game-v2` - Phaser WebGL game
- `/portal/map` - Galaxy map
- `/portal/military` - Military management
- `/portal/inventory` - Resource inventory
- `/portal/energy` - Energy allocation
- `/portal/frequency` - Frequency management
- `/portal/settings` - Game settings

**Admin Routes** (require `<RequireRole role="admin">`):
- `/admin` - Admin dashboard

### Authentication Flow

1. User logs in via `/api/auth/login` → receives JWT token
2. Token stored in `localStorage.getItem("token")`
3. REST requests: token sent via `Authorization: Bearer ${token}` header
4. WebSocket: token sent via `authenticate` socket event
5. Server verifies token using `JWT_SECRET` from environment

## Environment Configuration

File: `process.env` (located in project root)

Required variables:
- `JWT_SECRET`: Token signing key (CHANGE IN PRODUCTION!)
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default 5000)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL config (legacy)

**IMPORTANT**: The `process.env` file contains production credentials. Never commit real secrets to version control.

## Key Technical Details

### React Version
Using React 19.1.1 - be aware of breaking changes from earlier versions when adding new features.

### Proxy Configuration
Client dev server proxies API requests to `http://localhost:5000` (configured in `client/package.json`).

### Concurrent Development
The root `package.json` uses `concurrently` to run both server and client with color-coded logs:
- SERVER (cyan): Backend logs
- CLIENT (magenta): Frontend logs

### Socket.io Integration
- Server: Socket.io initialized in `server/index.js`, handlers in `server/src/routes/socket-handlers.js`
- Client: Socket connection established in Phaser game components
- Available to Express routes via `app.set('io', io)` / `req.app.get('io')`

### Game Balance & Calculations
- Generator costs scale exponentially for progression
- Military recruitment costs increase with unit count
- Ship upgrades scale with level
- Production rates calculated in `Game.getProductionRatesPerSecond()`
- Offline progress calculated from `lastTickAt` timestamp

## File Organization

```
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # All React components
│   │   ├── hooks/               # Custom hooks (useGameLoop, useToast)
│   │   ├── game/                # Phaser game code
│   │   │   ├── scenes/          # Phaser scenes
│   │   │   ├── managers/        # Game systems (state, input, particles)
│   │   │   ├── objects/         # Custom game objects
│   │   │   └── config.js        # Phaser configuration
│   │   └── App.js               # Route definitions
│   └── public/images/           # Game assets (planets, backgrounds)
├── server/                      # Node.js backend
│   ├── src/
│   │   ├── routes/              # Express routes + socket handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── lib/                 # Database, socket initialization
│   │   └── app.js               # Express app configuration
│   └── index.js                 # Server entry point
├── process.env                  # Environment variables
└── package.json                 # Root scripts for concurrent execution
```

## Common Development Workflows

### Adding New REST Endpoints
1. Create/modify route in `server/src/routes/`
2. Update model in `server/src/models/` if schema changes needed
3. Call from React component using axios with JWT header

### Adding New Socket Events
1. Add handler in `server/src/routes/socket-handlers.js`
2. Emit from client via `socket.emit(eventName, data)`
3. Listen for response via `socket.on(eventName, callback)`
4. Broadcast updates via `io.to(roomName).emit()` for real-time sync

### Adding Phaser Game Features
1. New scenes: Create in `client/src/game/scenes/`, register in `config.js`
2. New visual effects: Add to `ParticleManager.js`
3. New controls: Add to `InputManager.js` with keyboard bindings
4. New game objects: Create class in `client/src/game/objects/`

### Modifying Game Schema
1. Update `server/src/models/Game.js` schema
2. Existing documents will have default values for new fields
3. Add migration logic if backward compatibility needed
4. Update `getProductionRatesPerSecond()` if production changes

## Node.js Version Requirement

Minimum Node.js version: 18.0.0 (specified in root `package.json` engines field)
