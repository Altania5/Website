import React from "react";
import GameNav from "./GameNav";

const GameSettings = () => {
  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Settings</h3>
      <div
        style={{
          border: "1px solid #1f2937",
          borderRadius: 8,
          padding: 16,
          background: "rgba(15,23,42,0.65)",
        }}
      >
        <strong>Coming Soon</strong>
        <p style={{ marginTop: 8 }}>
          Customize automation, notifications, and visual options. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default GameSettings;
