import React, { useEffect, useState } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const typeToImage = {
  altanerite: "/images/altanerite-planet.gif",
  homainionite: "/images/homainionite-planet.gif",
  gas: "/images/gas-planet.gif",
  ice: "/images/ice-planet.gif",
  rock: "/images/islands.gif",
};
const GalaxyMap = () => {
  const [system, setSystem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/game/system", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSystem(res.data);
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load system");
      }
    })();
  }, []);

  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!system) return null;

  const travel = async (direction, targetIndex) => {
    try {
      const token = localStorage.getItem("token") || "";
      // Preview cost
      const preview = await axios.post(
        "/api/game/travel-cost",
        { direction, targetIndex },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const p = preview.data;
      if (!p.inSpace) return alert("You must be in space with a ship.");
      if (!p.rangeOk) return alert("Ship range too low.");
      if (!p.energyOk) return alert(`Not enough energy. Need ${p.cost}.`);
      if (!window.confirm(`Travel will cost ${p.cost} energy. Proceed?`))
        return;
      await axios.post(
        "/api/game/travel",
        { direction, targetIndex },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const res = await axios.get("/api/game/system", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSystem(res.data);
    } catch (e) {
      alert(e?.response?.data?.error || "Travel failed");
    }
  };

  const launch = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        "/api/game/launch",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data?.game?.location?.mode !== "space") alert("Launch failed");
    } catch (e) {
      alert(e?.response?.data?.error || "Launch failed");
    }
  };

  const land = async (planetName) => {
    try {
      const token = localStorage.getItem("token") || "";
      await axios.post(
        "/api/game/land",
        { planetName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (e) {
      alert(e?.response?.data?.error || "Landing failed");
    }
  };

  return (
    <div>
      <GameNav />
      <h3 style={{ color: "#e2e8f0" }}>Zwamsha System</h3>
      <div
        style={{
          background:
            "#0b1220 url(/images/zwamshaGalaxy.gif) center/contain no-repeat",
          border: "1px solid #1f2937",
          borderRadius: 8,
          height: 420,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 180,
            width: 60,
            height: 60,
            borderRadius: 60,
            background: "#f59e0b",
          }}
        />
        {system.planets.map((p, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={
                p.name && p.name.toLowerCase() === "zwamsha"
                  ? "/images/zwamsha.gif"
                  : typeToImage[p.type] || "/images/islands.gif"
              }
              alt={p.name}
              onClick={() => land(p.name)}
              title={`${p.name} • ${p.type} • Click to land`}
              style={{
                position: "absolute",
                left: 120 + p.distance,
                top: 210 - (p.size || 24) / 2,
                width: p.size || 24,
                height: p.size || 24,
                cursor: "pointer",
                borderRadius: "50%",
                border: "2px solid rgba(148,163,184,0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.border = "2px solid #60a5fa";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.border = "2px solid rgba(148,163,184,0.3)";
                e.target.style.transform = "scale(1)";
              }}
            />
            {/* Planet label */}
            <div
              style={{
                position: "absolute",
                left: 120 + p.distance - 20,
                top: 210 + (p.size || 24) / 2 + 5,
                fontSize: 10,
                color: "#e2e8f0",
                textAlign: "center",
                width: 40,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {p.name}
            </div>
          </div>
        ))}
        {/* Current location marker */}
        <div
          style={{
            position: "absolute",
            left: 80 + 60,
            top: 160,
            width: 8,
            height: 8,
            borderRadius: 8,
            background: "#f87171",
          }}
        />
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button 
          onClick={() => travel("prev")}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6 }}
        >
          ← Previous System
        </button>
        <button 
          onClick={() => travel("next")}
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6 }}
        >
          Next System →
        </button>
        <button 
          onClick={launch}
          style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: 6 }}
        >
          Launch Ship
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        <div>💡 Tip: Travel costs increase with fleet size and distance</div>
        <div>🚀 Ship range determines maximum travel distance</div>
        <div>⚡ Energy is consumed for interstellar travel</div>
      </div>
    </div>
  );
};

export default GalaxyMap;
