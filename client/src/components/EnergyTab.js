import React, { useEffect, useRef, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const EnergyTab = () => {
  const [game, setGame] = useState(null);
  const [system, setSystem] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const tokenHeader = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };

  const fetchState = async () => {
    try {
      const res = await axios.get("/api/game/state", { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load state");
    }
  };

  const loadSystem = async () => {
    try {
      const res = await axios.get("/api/game/system", { headers: tokenHeader });
      setSystem(res.data);
    } catch {}
  };

  const tick = async () => {
    try {
      const res = await axios.post("/api/game/tick", {}, { headers: tokenHeader });
      setGame(res.data.game);
    } catch {}
  };

  const click = async () => {
    try {
      const res = await axios.post("/api/game/click", {}, { headers: tokenHeader });
      setGame(res.data.game);
    } catch {}
  };

  const buy = async (type) => {
    try {
      const res = await axios.post("/api/game/buy-generator", { type }, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Purchase failed");
    }
  };

  useEffect(() => {
    fetchState();
    loadSystem();
    timerRef.current = setInterval(tick, 2000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!game) return null;

  const currentBG = game.location?.mode === "space" ? "/images/space.gif" : (game.location?.planet?.toLowerCase()==='zwamsha' ? "/images/zwamsha.gif" : "/images/islands.gif");

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Energy</h3>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <div>
          <div><strong>Energy</strong>: {Math.floor(game.resources?.energy || 0)}</div>
          <div style={{ marginTop: 8 }}>Generators</div>
          <ul style={{ marginTop: 4 }}>
            <li>Solar Panels: {game.generators?.solarPanels || 0}</li>
            <li>Reactors: {game.generators?.reactors || 0}</li>
            <li>Miners: {game.generators?.miners || 0}</li>
          </ul>
          <div style={{ display: "grid", gap: 8 }}>
            <button onClick={() => buy("solarPanels")}>Buy Solar Panel (50 energy)</button>
            <button onClick={() => buy("miners")}>Buy Miner (100 energy)</button>
            <button onClick={() => buy("reactors")}>Buy Reactor (300 energy, 5 Altanerite)</button>
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>Frequency Manipulator</strong>
            <div style={{ opacity: 0.8 }}>Coming soon: massive energy, shields, and beams.</div>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Scene</div>
          <div
            onClick={async () => { if (game.location?.mode === 'planet') { try { const res = await axios.post('/api/game/planet-click', { planetName: game.location?.planet }, { headers: tokenHeader }); setGame(res.data.game); } catch(e) {} } }}
            style={{ background: `url(${currentBG}) center/cover no-repeat`, border: "1px solid #1f2937", borderRadius: 8, height: 320, position: "relative", overflow: "hidden", cursor: 'pointer' }}
            title="Click the planet to collect local resources"
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyTab;


