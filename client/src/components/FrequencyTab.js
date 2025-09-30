import React, { useEffect, useRef, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const fuelOptions = [1, 5, 10, 25];

const FrequencyTab = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  const load = async () => {
    const res = await axios.get("/api/game/state", { headers: tokenHeader });
    setGame(res.data.game);
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(async () => {
      try {
        await axios.post("/api/game/tick", {}, { headers: tokenHeader });
        const res = await axios.get("/api/game/state", {
          headers: tokenHeader,
        });
        setGame(res.data.game);
      } catch {}
    }, 2000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fuel = async (amount) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/game/fm/fuel",
        { amount },
        { headers: tokenHeader },
      );
      setGame(res.data.game);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.error || "Fuel failed");
    } finally {
      setLoading(false);
    }
  };

  const setAuto = async (val) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/game/fm/auto",
        { autoFuel: val },
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } finally {
      setLoading(false);
    }
  };

  if (!game) return <div style={{ color: "#e2e8f0" }}>Loading FM...</div>;

  const alex = Math.floor(game.inventory?.alexandrite || 0);
  const buffer = Math.floor(game.fm?.fuelBuffer || 0);

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Frequency Manipulator</h3>
      {error ? (
        <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <div>Alexandrite available: {alex}</div>
          <div>Fuel buffer: {buffer}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Each alexandrite yields {game.fm?.energyPerAlex || 100} energy; burn
            rate ~{game.fm?.alexPerSecond || 0.1}/s.
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
            {fuelOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => fuel(amount)}
                disabled={loading || alex < amount}
              >
                Fuel {amount}
                {loading ? "…" : ""}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(game.fm?.autoFuel)}
                onChange={(e) => setAuto(e.target.checked)}
                disabled={loading}
              />{" "}
              Auto-fuel
            </label>
          </div>
        </div>
        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: 12,
            background: "#0b1220 url(/images/zwamshaGalaxy.gif) center/cover",
            display: "grid",
            gap: 8,
          }}
        >
          <div>Energy: {Math.floor(game.resources?.energy || 0)}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Frequency output adds {game.fm?.energyPerAlex || 100} energy per
            alexandrite burned.
          </div>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await axios.post(
                  "/api/game/tick",
                  {},
                  { headers: tokenHeader },
                );
                const res = await axios.get("/api/game/state", {
                  headers: tokenHeader,
                });
                setGame(res.data.game);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Pulsing…" : "Manual Pulse"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrequencyTab;
