import React, { useEffect, useRef, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const FrequencyTab = () => {
  const [game, setGame] = useState(null);
  const timerRef = useRef(null);
  const tokenHeader = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };

  const load = async () => {
    const res = await axios.get("/api/game/state", { headers: tokenHeader });
    setGame(res.data.game);
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(async () => {
      try {
        await axios.post("/api/game/tick", {}, { headers: tokenHeader });
        const res = await axios.get("/api/game/state", { headers: tokenHeader });
        setGame(res.data.game);
      } catch {}
    }, 2000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fuel = async (amount) => {
    try {
      const res = await axios.post("/api/game/fm/fuel", { amount }, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Fuel failed");
    }
  };

  const setAuto = async (val) => {
    const res = await axios.post("/api/game/fm/auto", { autoFuel: val }, { headers: tokenHeader });
    setGame(res.data.game);
  };

  if (!game) return null;

  const alex = Math.floor(game.inventory?.alexandrite || 0);
  const buffer = Math.floor(game.fm?.fuelBuffer || 0);

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Frequency Manipulator</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
          <div>Alexandrite available: {alex}</div>
          <div>Fuel buffer: {buffer}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={() => fuel(1)}>Fuel 1</button>
            <button onClick={() => fuel(5)}>Fuel 5</button>
            <button onClick={() => fuel(10)}>Fuel 10</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={Boolean(game.fm?.autoFuel)} onChange={(e) => setAuto(e.target.checked)} /> Auto-fuel
            </label>
          </div>
          <div style={{ marginTop: 8, opacity: 0.8 }}>Each alexandrite yields {game.fm?.energyPerAlex || 100} energy. Burn rate ~{game.fm?.alexPerSecond || 0.1}/s.</div>
        </div>
        <div style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 12, background: "#0b1220 url(/images/zwamshaGalaxy.gif) center/cover no-repeat" }}>
          <div>Energy: {Math.floor(game.resources?.energy || 0)}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={async () => { try { await axios.post("/api/game/tick", {}, { headers: tokenHeader }); const res = await axios.get("/api/game/state", { headers: tokenHeader }); setGame(res.data.game); } catch {} }}>Pulse</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyTab;


