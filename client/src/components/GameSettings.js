import React, { useState, useEffect } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const GameSettings = () => {
  const [settings, setSettings] = useState({
    autoSaveInterval: 30,
    theme: "dark",
    soundEnabled: true,
    musicEnabled: false,
    notifications: true,
  });
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState("");

  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load game state
    const loadGame = async () => {
      try {
        const res = await axios.get("/api/game/state", { headers: tokenHeader });
        setGame(res.data.game);
      } catch (e) {
        console.error("Failed to load game state:", e);
      }
    };
    loadGame();
  }, []);

  const saveSettings = () => {
    localStorage.setItem("gameSettings", JSON.stringify(settings));
    setMessage("Settings saved!");
    setTimeout(() => setMessage(""), 3000);
  };

  const exportSave = () => {
    if (!game) return;
    const saveData = {
      game,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `altanian-conqueror-save-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage("Save exported!");
    setTimeout(() => setMessage(""), 3000);
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset all progress? This cannot be undone!")) {
      if (window.confirm("This will delete your entire save file. Are you absolutely sure?")) {
        // Reset would need backend implementation
        setMessage("Reset functionality requires backend implementation");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Game Settings</h3>
      
      {message && (
        <div style={{ 
          padding: "8px 12px", 
          background: "#10b981", 
          color: "white", 
          borderRadius: 6, 
          marginBottom: 16 
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {/* Gameplay Settings */}
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0" }}>Gameplay</h4>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Auto-save interval:</span>
              <select
                value={settings.autoSaveInterval}
                onChange={(e) => setSettings({...settings, autoSaveInterval: Number(e.target.value)})}
                style={{ background: "rgba(15,23,42,0.8)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 4, padding: "4px 8px" }}
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              <span>Enable notifications</span>
            </label>
          </div>
        </div>

        {/* Audio Settings */}
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0" }}>Audio</h4>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
              />
              <span>Sound effects</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) => setSettings({...settings, musicEnabled: e.target.checked})}
              />
              <span>Background music</span>
            </label>
          </div>
        </div>

        {/* Visual Settings */}
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0" }}>Visual</h4>
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Theme:</span>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                style={{ background: "rgba(15,23,42,0.8)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 4, padding: "4px 8px" }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </label>
          </div>
        </div>

        {/* Save Management */}
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0" }}>Save Management</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={exportSave}
              style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6 }}
            >
              Export Save
            </button>
            <button
              onClick={resetProgress}
              style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: 6 }}
            >
              Reset Progress
            </button>
          </div>
          {game && (
            <div style={{ marginTop: 12, fontSize: 12, color: "rgba(226,232,240,0.6)" }}>
              Nation: {game.nationName} • Last saved: {new Date(game.updatedAt || Date.now()).toLocaleString()}
            </div>
          )}
        </div>

        {/* Save Settings Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={saveSettings}
            style={{ 
              padding: "12px 24px", 
              background: "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
