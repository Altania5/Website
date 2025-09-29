import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const PortalHome = () => {
  const [game, setGame] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const floaterId = useRef(0);
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const res = await axios.get("/api/game/state", { headers: { Authorization: `Bearer ${token}` } });
        setGame(res.data.game);
      } catch {}
    })();
  }, []);

  const onPlanetClick = async (e) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post("/api/game/planet-click", { planetName: game.location?.planet }, { headers: { Authorization: `Bearer ${token}` } });
      setGame(res.data.game);
      if (res.data.gained?.key) {
        const id = floaterId.current++;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const colorMap = {
          wood: '#86efac',
          stone: '#cbd5e1',
          iron: '#94a3b8',
          copper: '#f59e0b',
          alexandrite: '#60a5fa',
          altanerite: '#a78bfa',
          water: '#93c5fd',
          glass: '#e5e7eb',
          fuel: '#facc15',
          plastic: '#fef08a'
        };
        const color = colorMap[res.data.gained.key] || '#a7f3d0';
        setFloaters(f => [...f, { id, text: `+${res.data.gained.amount} ${res.data.gained.key}`, x, y, color }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
      }
    } catch {}
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Home</h3>
      {game ? (
        <div>
          <div>Nation: {game.nationName}</div>
          <div>Location: {game.location?.mode === "space" ? "In Space" : `On ${game.location?.planet}`}</div>
          <div>Ship: {game.ship?.hasShip ? `Lv ${game.ship.level} (Range ${game.ship.range})` : "None"}</div>
          <div style={{ marginTop: 12, border: "1px solid #1f2937", borderRadius: 8, overflow: "hidden", position: 'relative', background: '#0b1220' }}>
            <div style={{ background: `url(${(game.location?.planet||'').toLowerCase()==='zwamsha' ? '/images/zwamsha.gif' : '/images/islands.gif'}) center/contain no-repeat`, height: 360, position: 'relative', cursor: 'pointer' }}
              onClick={onPlanetClick}
              title="Click the planet to collect resources">
              {floaters.map(f => (
                <div key={f.id} style={{ position: 'absolute', left: f.x, top: f.y, color: f.color, fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.6)', animation: 'riseUp 1.1s ease-out forwards', pointerEvents: 'none' }}>{f.text}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            {!game.ship?.hasShip ? (
              <a className="btn" href="/portal/energy">Earn energy and build your first ship</a>
            ) : game.location?.mode === "planet" ? (
              <a className="btn" href="/portal/energy">Prepare for launch</a>
            ) : (
              <a className="btn" href="/portal/map">Open Map</a>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PortalHome;


