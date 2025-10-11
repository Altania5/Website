# Altanian Conqueror - Personal Website & Idle Game

A full-stack web application featuring a personal portfolio website with an integrated idle game called "Altanian Conqueror".

## Features

- **Personal Portfolio**: Showcase of projects and skills
- **Altanian Conqueror Game**: A complete idle game with:
  - Resource management and production
  - Ship building and space travel
  - Military recruitment and upgrades
  - Planet exploration and harvesting
  - Crafting and automation systems
  - Real-time game loop with pause/resume

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start both server and client**:
   ```bash
   npm start
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend React app on `http://localhost:3000`

3. **Access the application**:
   - Main website: `http://localhost:3000`
   - Game portal: `http://localhost:3000/altania` (login required)

### Alternative Commands

- **Development mode** (same as start):
  ```bash
  npm run dev
  ```

- **Server only**:
  ```bash
  npm run server-only
  ```

- **Client only** (requires server to be running):
  ```bash
  npm run client
  ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── IdleGame.js      # Main game interface
│   │   │   ├── PortalHome.js    # Colony control
│   │   │   ├── EnergyTab.js     # Power management
│   │   │   ├── Military.js      # Military forces
│   │   │   ├── GalaxyMap.js     # Space travel
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   └── ...
│   └── public/images/      # Game assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   └── ...
│   └── index.js            # Server entry point
└── package.json            # Root package configuration
```

## Game Features

### Core Systems
- **Resource Production**: Energy, Altanerite, Homainionite
- **Generators**: Solar Panels, Miners, Reactors
- **Ship System**: Building, upgrading, space travel
- **Military Forces**: Nephrite Navy, Alexandrite Army, Topaz Troopers
- **Planet Exploration**: Multiple planet types with unique resources
- **Crafting**: Automated resource refinement

### Game Progression
1. **Early Game**: Build generators, gather resources
2. **Mid Game**: Construct ship, explore planets
3. **Late Game**: Expand military, colonize systems

## Technology Stack

### Frontend
- React 19.1.1
- React Router DOM
- Axios for API calls
- Custom hooks for game logic

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- RESTful API design

## Development

The application uses `concurrently` to run both server and client simultaneously. Logs are color-coded:
- **SERVER** (cyan): Backend API logs
- **CLIENT** (magenta): React development server logs

## Deployment

The project is configured for Heroku deployment with automatic client build during deployment.

## Game Balance

The game features balanced progression with:
- Scaled generator costs for smooth progression
- Military recruitment costs that increase with unit count
- Ship upgrade costs that scale with level
- Resource production rates tuned for engaging gameplay

---

**Note**: The game requires user authentication. Create an account through the login system to access the game portal.

