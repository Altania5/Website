import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/config';
import BootScene from '../game/scenes/BootScene';
import MainScene from '../game/scenes/MainScene';
import GalaxyScene from '../game/scenes/GalaxyScene';
import io from 'socket.io-client';

export default function PhaserGame() {
  const gameRef = useRef(null);
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Initialize socket
    socketRef.current = io('http://localhost:5000');
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
            display: 'flex', 
            gap: 16, 
            padding: '12px 16px',
            background: 'rgba(15,23,42,0.8)',
            borderRadius: 8,
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>⚡</span>
              <span>{Math.floor(gameState.resources?.energy || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>💎</span>
              <span>{Math.floor(gameState.resources?.altanerite || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🔮</span>
              <span>{Math.floor(gameState.resources?.homainionite || 0).toLocaleString()}</span>
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
        
        {/* Generator purchase buttons */}
        {gameState && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'auto'
          }}>
            <button 
              onClick={() => buyGenerator('solar')}
              style={{
                padding: '6px 12px',
                background: '#fbbf24',
                color: 'black',
                border: 'none',
                borderRadius: 4,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Buy Solar Panel (100⚡)
            </button>
            <button 
              onClick={() => buyGenerator('miner')}
              style={{
                padding: '6px 12px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Buy Miner (50⚡ + 5💎)
            </button>
            <button 
              onClick={() => buyGenerator('reactor')}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Buy Reactor (200⚡ + 10💎)
            </button>
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
          padding: '8px 12px',
          background: 'rgba(15,23,42,0.8)',
          borderRadius: 6,
          fontSize: '11px',
          color: '#94a3b8',
          pointerEvents: 'auto',
          maxWidth: '200px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Keyboard Shortcuts:</div>
          <div>Space/H - Harvest</div>
          <div>G - Galaxy Map</div>
          <div>M - Military</div>
          <div>I - Inventory</div>
          <div>E - Energy Info</div>
          <div>F - Frequency</div>
        </div>
      </div>
    </div>
  );
}
