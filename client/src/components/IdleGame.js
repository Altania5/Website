import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const IdleGame = () => {
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const [system, setSystem] = useState(null);

  const tokenHeader = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };

  const startGame = async (nationName) => {
    await axios.post(
      "/api/game/start",
      { nationName: nationName || "Altanian Colony" },
      { headers: tokenHeader }
    );
  };

  const fetchState = async () => {
    try {
      const res = await axios.get("/api/game/state", { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        try {
          await startGame();
          const res2 = await axios.get("/api/game/state", { headers: tokenHeader });
          setGame(res2.data.game);
          setError("");
          return;
        } catch (e2) {
          setError(e2?.response?.data?.error || "Failed to start game");
          return;
        }
      }
      setError(e?.response?.data?.error || "Failed to load game state");
    }
  };

  const tick = async () => {
    try {
      const res = await axios.post("/api/game/tick", {}, { headers: tokenHeader });
      setGame(res.data.game);
    } catch {}
  };

  const buyGenerator = async () => {
    try {
      const res = await axios.post("/api/game/buy-generator", { type: "solarPanels" }, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Purchase failed");
    }
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

  const loadSystem = async () => {
    try {
      const res = await axios.get("/api/game/system", { headers: tokenHeader });
      setSystem(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchState();
    timerRef.current = setInterval(tick, 2000);
    loadSystem();
    return () => clearInterval(timerRef.current);
  }, []);

  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!game) return <div style={{ color: "#e2e8f0" }}>Loading game...</div>;

  const buildShip = async () => {
    try {
      const res = await axios.post("/api/game/build-ship", {}, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Build failed");
    }
  };

  const launch = async () => {
    try {
      const res = await axios.post("/api/game/launch", {}, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Launch failed");
    }
  };

  const land = async (planetName) => {
    try {
      const res = await axios.post("/api/game/land", { planetName }, { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Landing failed");
    }
  };

  const currentBG = game.location?.mode === "space" ? "/images/space.gif" : "/images/zwamsha.gif";

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
      <div>
        <h3 style={{ marginTop: 0 }}>{game.nationName}</h3>
          <div>Location: {game.location?.mode === "space" ? "In Space" : `On ${game.location?.planet}`}</div>
          <div>Ship: {game.ship?.hasShip ? `Lv ${game.ship.level} (Range ${game.ship.range})` : "None"}</div>
        <div style={{ marginTop: 8 }}>Resources</div>
        <ul style={{ marginTop: 4 }}>
          <li>Energy: {Math.floor(game.resources?.energy || 0)}</li>
          <li>Altanerite: {Math.floor(game.resources?.altanerite || 0)}</li>
          <li>Homainionite: {Math.floor(game.resources?.homainionite || 0)}</li>
        </ul>

        <div style={{ marginTop: 12 }}>Generators</div>
        <ul style={{ marginTop: 4 }}>
          <li>Solar Panels: {game.generators?.solarPanels || 0}</li>
          <li>Reactors: {game.generators?.reactors || 0}</li>
          <li>Miners: {game.generators?.miners || 0}</li>
        </ul>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <button onClick={click}>Click (+{game.clickPower} energy)</button>
          <button onClick={() => buy("solarPanels")}>Buy Solar Panel (50 energy)</button>
          <button onClick={() => buy("miners")}>Buy Miner (100 energy)</button>
          <button onClick={() => buy("reactors")}>Buy Reactor (300 energy, 5 Altanerite)</button>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>Scene</div>
        <div style={{ background: `url(${currentBG}) center/cover no-repeat`, border: "1px solid #1f2937", borderRadius: 8, height: 320, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 16, top: 140, width: 40, height: 40, borderRadius: 40, background: "#f59e0b" }} />
          {system?.planets?.map((p, i) => (
            <div key={i} title={p.name}
              style={{ position: "absolute", left: 80 + p.distance, top: 160 - p.size / 2, width: p.size, height: p.size, borderRadius: p.size, background: p.color }} />
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {!game.ship?.hasShip ? (
            <button onClick={buildShip}>Build Ship (500 energy, 10 Altanerite)</button>
          ) : game.location?.mode === "planet" ? (
            <button onClick={launch}>Launch to Space</button>
          ) : (
            <>
              <button onClick={() => land(game.location?.planet)}>Land on Current Planet</button>
              <a href="/portal/map" style={{ marginLeft: 8 }}>Open Map</a>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default IdleGame;


