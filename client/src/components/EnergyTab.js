import React, { useEffect, useRef, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const generatorCosts = {
  solarPanels: { energy: 25 },
  miners: { energy: 75 },
  reactors: { energy: 200, altanerite: 3 },
};

const EnergyTab = () => {
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  const canAfford = (cost) => {
    const energy = Number(game?.resources?.energy || 0);
    const altanerite = Number(game?.resources?.altanerite || 0);
    return energy >= (cost.energy || 0) && altanerite >= (cost.altanerite || 0);
  };

  const fetchState = async () => {
    try {
      const res = await axios.get("/api/game/state", { headers: tokenHeader });
      setGame(res.data.game);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load state");
    }
  };

  useEffect(() => {
    fetchState();
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

  const buy = async (type) => {
    try {
      const res = await axios.post(
        "/api/game/buy-generator",
        { type },
        { headers: tokenHeader },
      );
      setGame(res.data.game);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.error || "Purchase failed");
    }
  };

  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!game) return null;

  const energy = Math.floor(game.resources?.energy || 0);
  const altanerite = Math.floor(game.resources?.altanerite || 0);

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Power Operations</h3>
      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        Balance your energy grid, upgrade generators, and monitor production.
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              border: "1px solid #1f2937",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div>
              <strong>Energy</strong>: {energy.toLocaleString()}
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.6)" }}>
                +{Math.floor((game.generators?.solarPanels || 0) * 1.5 + (game.generators?.reactors || 0) * 8 + 2)}/s
              </div>
            </div>
            <div>
              <strong>Altanerite</strong>: {altanerite.toLocaleString()}
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.6)" }}>
                +{((game.generators?.miners || 0) * 0.3).toFixed(1)}/s
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>Generators</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(148,163,184,0.2)",
                    }}
                  >
                    <th style={{ paddingBottom: 6 }}>Type</th>
                    <th style={{ paddingBottom: 6 }}>Count</th>
                    <th style={{ paddingBottom: 6, textAlign: "right" }}>
                      Cost
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "solarPanels", label: "Solar Panels" },
                    { key: "miners", label: "Miners" },
                    { key: "reactors", label: "Reactors" },
                  ].map((row) => {
                    const cost = generatorCosts[row.key];
                    const costText = [
                      cost.energy ? `${cost.energy} Energy` : null,
                      cost.altanerite ? `${cost.altanerite} Altanerite` : null,
                    ]
                      .filter(Boolean)
                      .join(" / ");
                    return (
                      <tr
                        key={row.key}
                        style={{
                          borderTop: "1px solid rgba(148,163,184,0.12)",
                        }}
                      >
                        <td style={{ padding: "6px 0" }}>{row.label}</td>
                        <td style={{ padding: "6px 0" }}>
                          {game.generators?.[row.key] || 0}
                        </td>
                        <td style={{ padding: "6px 0", textAlign: "right" }}>
                          {costText}
                        </td>
                        <td style={{ padding: "6px 0", textAlign: "right" }}>
                          <button
                            onClick={() => buy(row.key)}
                            disabled={
                              energy < (cost.energy || 0) || 
                              altanerite < (cost.altanerite || 0)
                            }
                          >
                            Purchase
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
              Tip: Reactors consume Altanerite but provide the largest power
              boost.
            </div>
            {game.ship?.hasShip && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginTop: 0 }}>Ship Upgrades</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13 }}>
                    Current: Level {game.ship.level} • Range {game.ship.range}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          "/api/game/upgrade-ship",
                          {},
                          { headers: tokenHeader },
                        );
                        setGame(res.data.game);
                        setError("");
                      } catch (e) {
                        setError(e?.response?.data?.error || "Upgrade failed");
                      }
                    }}
                    disabled={
                      !canAfford({
                        energy: game.ship.level * 500,
                        altanerite: Math.floor(game.ship.level / 2),
                      })
                    }
                  >
                    Upgrade to Level {game.ship.level + 1} ({game.ship.level * 500} Energy, {Math.floor(game.ship.level / 2)} Altanerite)
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              border: "1px solid #1f2937",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <h4 style={{ marginTop: 0 }}>Generator Notes</h4>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
              <li>Solar Panels provide steady baseline energy.</li>
              <li>Miners unlock passive Altanerite and Homainionite income.</li>
              <li>Reactors consume Altanerite for high energy throughput.</li>
            </ul>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Scene</div>
          <div
            onClick={async () => {
              if (game.location?.mode === "planet") {
                try {
                  const res = await axios.post(
                    "/api/game/planet-click",
                    { planetName: game.location?.planet },
                    { headers: tokenHeader },
                  );
                  setGame(res.data.game);
                } catch (e) {
                  setError(e?.response?.data?.error || "Harvest failed");
                }
              }
            }}
            style={{
              background: `url(${
                game.location?.mode === "space"
                  ? "/images/space.gif"
                  : game.location?.planet?.toLowerCase() === "zwamsha"
                    ? "/images/zwamsha.gif"
                    : "/images/islands.gif"
              }) center/contain no-repeat`,
              border: "1px solid #1f2937",
              borderRadius: 8,
              height: 320,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: "rgba(15,23,42,0.8)",
            }}
            title="Click the planet to collect local resources"
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyTab;
