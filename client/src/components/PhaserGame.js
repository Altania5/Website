import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/config';
import BootScene from '../game/scenes/BootScene';
import MainScene from '../game/scenes/MainScene';
import GalaxyScene from '../game/scenes/GalaxyScene';
import io from 'socket.io-client';

// Helper function for progression hints
const getProgressionHint = (gameState) => {
  const totalGenerators = (gameState.generators?.solarPanels || 0) +
                          (gameState.generators?.miners || 0) +
                          (gameState.generators?.reactors || 0);
  const energy = gameState.resources?.energy || 0;
  const altanerite = gameState.resources?.altanerite || 0;

  // Early game hints
  if (totalGenerators === 0) {
    return "Harvest the planet and build your first Solar Panel (100 ⚡)";
  }

  if (totalGenerators < 3) {
    return "Build more generators to increase passive income";
  }

  if ((gameState.generators?.miners || 0) === 0 && altanerite >= 5) {
    return "Build a Miner to automate Altanerite production";
  }

  if (totalGenerators >= 3 && totalGenerators < 5) {
    return "Aim for 5 generators to unlock the Industrial Complex quest";
  }

  if (energy < 1000 && totalGenerators >= 5) {
    return "Keep harvesting and producing. Target: 1,000 energy";
  }

  // Mid game hints
  if ((gameState.generators?.reactors || 0) === 0 && energy >= 200 && altanerite >= 10) {
    return "Unlock Reactors for 8x energy production!";
  }

  if (totalGenerators >= 5 && totalGenerators < 10) {
    return "Expand to 10 generators for mega factory status";
  }

  if (energy >= 1000 && altanerite < 500) {
    return "Explore other planets for more Altanerite (Press G)";
  }

  // Late game hints
  if (totalGenerators >= 10) {
    return "You're doing great! Check achievements (Press A) and quests (Press Q)";
  }

  return "Keep conquering! Press Q for quests and A for achievements";
};

// Helper component for generator buttons
const GeneratorButton = ({ name, icon, count, cost, production, canAfford, onClick, bgColor }) => {
  const formatCost = (cost) => {
    const parts = [];
    if (cost.energy) parts.push(`${cost.energy} ⚡`);
    if (cost.altanerite) parts.push(`${cost.altanerite} 💎`);
    if (cost.homainionite) parts.push(`${cost.homainionite} 🔮`);
    return parts.join(' + ');
  };

  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      style={{
        padding: '8px',
        background: canAfford ? bgColor : '#4b5563',
        color: canAfford ? 'white' : '#9ca3af',
        border: canAfford ? `2px solid ${bgColor}` : '2px solid #6b7280',
        borderRadius: 6,
        fontSize: '11px',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        transition: 'all 0.2s',
        opacity: canAfford ? 1 : 0.6
      }}
      onMouseEnter={(e) => {
        if (canAfford) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 0 10px ${bgColor}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <span style={{ fontWeight: 'bold' }}>{icon} {name}</span>
        <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>
          ×{count}
        </span>
      </div>
      <div style={{ fontSize: '9px', opacity: 0.9 }}>{production}</div>
      <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 'bold' }}>
        Cost: {formatCost(cost)}
      </div>
    </button>
  );
};

export default function PhaserGame() {
  const gameRef = useRef(null);
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Initialize socket - use production URL in production, localhost in development
    const socketUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:5000';
    socketRef.current = io(socketUrl);
    const token = localStorage.getItem('token');
    
    console.log('PhaserGame: Token from localStorage:', token ? 'present' : 'missing');
    console.log('PhaserGame: Token value:', token);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setError('');
      
      // Authenticate
      console.log('Sending authentication with token:', token);
      socketRef.current.emit('authenticate', { token });
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
    
    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to game server');
    });
    
    socketRef.current.on('authenticated', (data) => {
      console.log('Authenticated:', data);
      if (data.success) {
        // Join game room
        const userId = localStorage.getItem('userId') || 'anonymous';
        socketRef.current.emit('join-game', userId);
        
        // Request initial game state
        fetchGameState();
      } else {
        setError('Authentication failed: ' + (data.error || 'Unknown error'));
      }
    });
    
    socketRef.current.on('game-state-update', (state) => {
      console.log('Game state update:', state);
      setGameState(state);
      
      if (gameRef.current) {
        gameRef.current.registry.set('gameState', state);
      }
    });
    
    // Initialize Phaser
    const config = {
      ...gameConfig,
      scene: [BootScene, MainScene, GalaxyScene]
    };
    
    try {
      gameRef.current = new Phaser.Game(config);
      gameRef.current.registry.set('socket', socketRef.current);
    } catch (error) {
      console.error('Failed to initialize Phaser game:', error);
      setError('Failed to initialize game engine');
    }
    
    // Make game accessible globally for UI interactions
    window.phaserGame = gameRef.current;
    
    return () => {
      socketRef.current?.disconnect();
      gameRef.current?.destroy(true);
      window.phaserGame = null;
    };
  }, []);
  
  const fetchGameState = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching game state with token:', token ? 'present' : 'missing');
      
      const response = await fetch('/api/game/state', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Game state response:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Game state data:', data);
        setGameState(data.game);
        
        if (gameRef.current) {
          gameRef.current.registry.set('gameState', data.game);
        }
      } else {
        const errorText = await response.text();
        console.error('Game state fetch failed:', response.status, errorText);
        setError(`Failed to load game state: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch game state:', err);
      setError('Failed to load game state: ' + err.message);
    }
  };
  
  const harvestPlanet = (count = 1) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('harvest-planet', { 
        planetName: gameState?.location?.planet, 
        count 
      });
    }
  };
  
  const travelToGalaxy = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('GalaxyScene');
    }
  };
  
  const returnToBase = () => {
    if (gameRef.current) {
      gameRef.current.scene.start('MainScene');
    }
  };
  
  const buyGenerator = (type) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('buy-generator', { type });
    }
  };
  
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: '#ef4444',
        fontSize: '18px'
      }}>
        {error}
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Phaser canvas */}
      <div id="phaser-container" style={{ width: '100%', height: '100%' }} />
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        color: '#e2e8f0',
        zIndex: 1000
      }}>
        {/* Connection status */}
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '8px 12px',
          background: connected ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
          borderRadius: 6,
          fontSize: '12px',
          pointerEvents: 'auto'
        }}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        
        {/* Resource display */}
        {gameState ? (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            pointerEvents: 'auto'
          }}>
            {/* Main resources */}
            <div style={{
              display: 'flex',
              gap: 16,
              padding: '12px 16px',
              background: 'rgba(15,23,42,0.9)',
              borderRadius: 8,
              marginBottom: 8,
              border: '1px solid rgba(59,130,246,0.3)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⚡</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {Math.floor(gameState.resources?.energy || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#10b981' }}>
                  +{((gameState.generators?.solarPanels || 0) * 1.5 + (gameState.generators?.reactors || 0) * 8).toFixed(1)}/s
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>💎</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {Math.floor(gameState.resources?.altanerite || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#8b5cf6' }}>
                  +{((gameState.generators?.miners || 0) * 0.3).toFixed(1)}/s
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>🔮</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {Math.floor(gameState.resources?.homainionite || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#ef4444' }}>
                  Manual
                </div>
              </div>
            </div>

            {/* Progression hint */}
            <div style={{
              padding: '8px 12px',
              background: 'rgba(16,185,129,0.15)',
              borderRadius: 6,
              fontSize: '11px',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
              maxWidth: '300px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>💡 Next Step:</div>
              <div>
                {getProgressionHint(gameState)}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '12px 16px',
            background: 'rgba(15,23,42,0.8)',
            borderRadius: 8,
            pointerEvents: 'auto',
            color: '#fbbf24'
          }}>
            Loading game state...
          </div>
        )}
        
        {/* Action buttons */}
        {gameState?.location?.mode === 'planet' && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            pointerEvents: 'auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button 
              onClick={() => harvestPlanet(1)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Harvest ×1
            </button>
            <button 
              onClick={() => harvestPlanet(5)}
              style={{
                padding: '8px 16px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Harvest ×5
            </button>
            <button 
              onClick={() => harvestPlanet(10)}
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Harvest ×10
            </button>
            <button 
              onClick={travelToGalaxy}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Galaxy Map
            </button>
          </div>
        )}
        
        {/* Generator purchase panel */}
        {gameState && (
          <div style={{
            position: 'absolute',
            top: 80,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'auto',
            background: 'rgba(15,23,42,0.9)',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid rgba(59,130,246,0.3)',
            maxWidth: '220px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: '#3b82f6' }}>
              Generators
            </div>

            {/* Solar Panel */}
            <GeneratorButton
              name="Solar Panel"
              icon="☀️"
              count={gameState.generators?.solarPanels || 0}
              cost={{ energy: 100 }}
              production="+1.5 ⚡/s"
              canAfford={(gameState.resources?.energy || 0) >= 100}
              onClick={() => buyGenerator('solar')}
              bgColor="#fbbf24"
            />

            {/* Miner */}
            <GeneratorButton
              name="Miner"
              icon="⛏️"
              count={gameState.generators?.miners || 0}
              cost={{ energy: 50, altanerite: 5 }}
              production="+0.3 💎/s"
              canAfford={(gameState.resources?.energy || 0) >= 50 && (gameState.resources?.altanerite || 0) >= 5}
              onClick={() => buyGenerator('miner')}
              bgColor="#8b5cf6"
            />

            {/* Reactor */}
            <GeneratorButton
              name="Reactor"
              icon="⚛️"
              count={gameState.generators?.reactors || 0}
              cost={{ energy: 200, altanerite: 10 }}
              production="+8 ⚡/s"
              canAfford={(gameState.resources?.energy || 0) >= 200 && (gameState.resources?.altanerite || 0) >= 10}
              onClick={() => buyGenerator('reactor')}
              bgColor="#ef4444"
            />
          </div>
        )}
        
        {/* Galaxy scene controls */}
        {gameState?.location?.mode === 'space' && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            pointerEvents: 'auto'
          }}>
            <button 
              onClick={returnToBase}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Return to Base
            </button>
          </div>
        )}
        
        {/* Keyboard shortcuts help */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          padding: '10px 14px',
          background: 'rgba(15,23,42,0.9)',
          borderRadius: 8,
          fontSize: '11px',
          color: '#cbd5e1',
          pointerEvents: 'auto',
          maxWidth: '200px',
          border: '1px solid rgba(59,130,246,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#3b82f6', fontSize: '12px' }}>
            ⌨️ Keyboard Shortcuts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '4px' }}>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Space</span>
            <span>Harvest planet</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>G</span>
            <span>Galaxy Map</span>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Q</span>
            <span>View Quests</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>A</span>
            <span>Achievements</span>
            <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>E</span>
            <span>Production Info</span>
            <span style={{ color: '#6b7280', fontWeight: 'bold' }}>M/I</span>
            <span>Military/Inventory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
