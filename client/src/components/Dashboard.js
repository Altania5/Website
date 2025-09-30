import React, { useEffect, useState } from "react";
import axios from "axios";

const onboardingSteps = [
  {
    title: "Build Power",
    description:
      "Visit the Energy tab to purchase generators and boost energy production.",
    link: "/portal/frequency",
  },
  {
    title: "Harvest Resources",
    description:
      "Use the Home screen to gather resources from planets and unlock refined drops.",
    link: "/portal/home",
  },
  {
    title: "Upgrade Forces",
    description:
      "Strengthen Nephrite, Alexandrite, and Topaz units to increase bonuses.",
    link: "/portal/military",
  },
  {
    title: "Explore the Galaxy",
    description: "Launch into space and travel to new systems via the Map.",
    link: "/portal/map",
  },
];

const Dashboard = () => {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe(res.data.user);
      } catch (e) {
        setError("Failed to load profile");
      }
    })();
  }, []);

  const [gameState, setGameState] = useState(null);
  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

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
        { headers: tokenHeader },
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

      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #1f2937",
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Idle Game</h3>
        {gameState ? (
          <div>
            <div>Nation: {gameState.nationName}</div>
            <div style={{ marginTop: 8 }}>
              <a href="/portal/home">Track Colony</a>
              <span style={{ margin: "0 8px" }}>|</span>
              <a href="/portal/frequency">Manage Power</a>
              <span style={{ margin: "0 8px" }}>|</span>
              <a href="/portal/map">Map</a>
            </div>
          </div>
        ) : (
          <button onClick={startGame}>Start New Nation</button>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Mission Briefing</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {onboardingSteps.map((step) => (
            <div
              key={step.title}
              style={{
                border: "1px solid #1f2937",
                borderRadius: 8,
                padding: 12,
                background: "rgba(15,23,42,0.6)",
                display: "grid",
                gap: 4,
              }}
            >
              <div style={{ fontWeight: 600 }}>{step.title}</div>
              <div style={{ opacity: 0.8 }}>{step.description}</div>
              <a
                className="btn"
                style={{ width: "fit-content", padding: "6px 10px" }}
                href={step.link}
              >
                Go to {step.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
