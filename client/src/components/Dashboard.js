import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        setMe(res.data.user);
      } catch (e) {
        setError("Failed to load profile");
      }
    })();
  }, []);

  const [gameState, setGameState] = useState(null);
  const tokenHeader = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };

  const loadGame = async () => {
    try {
      const res = await axios.get("/api/game/state", { headers: tokenHeader });
      setGameState(res.data.game);
    } catch (e) {
      setGameState(null);
    }
  };

  const startGame = async () => {
    try {
      await axios.post(
        "/api/game/start",
        { nationName: "Altanian Colony" },
        { headers: tokenHeader }
      );
      await loadGame();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to start game");
    }
  };

  useEffect(() => {
    loadGame();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>Dashboard</h2>
      {me ? (
        <div>Welcome, {me.email || me.username}.</div>
      ) : error ? (
        <div style={{ color: "#f87171" }}>{error}</div>
      ) : null}

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #1f2937", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Idle Game</h3>
        {gameState ? (
          <div>
            <div>Nation: {gameState.nationName}</div>
            <div style={{ marginTop: 8 }}>
              <a href="/portal/home">Open Home</a>
              <span style={{ margin: "0 8px" }}>|</span>
              <a href="/portal/frequency">Energy</a>
              <span style={{ margin: "0 8px" }}>|</span>
              <a href="/portal/map">Map</a>
            </div>
          </div>
        ) : (
          <button onClick={startGame}>Start New Nation</button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


