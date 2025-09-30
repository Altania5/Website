import React, { useEffect, useState } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const typeToImage = {
  altanerite: "/images/islands.gif",
  homainionite: "/images/lava.gif",
  gas: "/images/islands.gif",
  ice: "/images/islands.gif",
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
            "#0b1220 url(/images/zwamshaGalaxy.gif) center/cover no-repeat",
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
          <img
            key={i}
            src={
              p.name && p.name.toLowerCase() === "zwamsha"
                ? "/images/zwamsha.gif"
                : typeToImage[p.type] || "/images/islands.gif"
            }
            alt={p.name}
            onClick={() => land(p.name)}
            title={`${p.name} • ${p.type} (click to land)`}
            style={{
              position: "absolute",
              left: 120 + p.distance,
              top: 210 - (p.size || 24) / 2,
              width: p.size || 24,
              height: p.size || 24,
              cursor: "pointer",
            }}
          />
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
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => travel("prev")}>Prev System</button>
        <button onClick={() => travel("next")}>Next System</button>
        <button onClick={launch}>Launch (must have ship)</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        Deeper map intel coming soon.
      </div>
    </div>
  );
};

export default GalaxyMap;
