import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const boostSummary = (game) => {
  if (!game?.fleet) return null;
  const lines = [];
  if (game.fleet.topazTroopers?.count) {
    lines.push("Topaz Troopers accelerate planetary harvesting");
  }
  if (game.fleet.alexandriteArmy?.count) {
    lines.push("Alexandrite Army increases refined resource finds");
  }
  if (!lines.length) return null;
  return lines.join(" • ");
};

const IdleGame = () => {
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const [isHarvesting, setIsHarvesting] = useState(false);

  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  const startGame = async (nationName) => {
    await axios.post(
      "/api/game/start",
      { nationName: nationName || "Altanian Colony" },
      { headers: tokenHeader },
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
          const res2 = await axios.get("/api/game/state", {
            headers: tokenHeader,
          });
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
      const res = await axios.post(
        "/api/game/tick",
        {},
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } catch {}
  };

  const buy = async (type) => {
    try {
      const res = await axios.post(
        "/api/game/buy-generator",
        { type },
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Purchase failed");
    }
  };

  useEffect(() => {
    fetchState();
    timerRef.current = setInterval(tick, 2000);
    return () => clearInterval(timerRef.current);
  }, []);

  const buildShip = async () => {
    try {
      const res = await axios.post(
        "/api/game/build-ship",
        {},
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Build failed");
    }
  };

  const launch = async () => {
    try {
      const res = await axios.post(
        "/api/game/launch",
        {},
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Launch failed");
    }
  };

  const land = async (planetName) => {
    try {
      const res = await axios.post(
        "/api/game/land",
        { planetName },
        { headers: tokenHeader },
      );
      setGame(res.data.game);
    } catch (e) {
      alert(e?.response?.data?.error || "Landing failed");
    }
  };

  const currentBG =
    game?.location?.mode === "space"
      ? "/images/space.gif"
      : "/images/zwamsha.gif";
  const planetLoot = useMemo(
    () => game?.location?.planetLoot || [],
    [game?.location?.planetLoot],
  );
  const isOnPlanet = game?.location?.mode === "planet";
  const boosts = boostSummary(game);

  const canAfford = (cost) => {
    const energy = Number(game.resources?.energy || 0);
    const altanerite = Number(game.resources?.altanerite || 0);
    return energy >= (cost.energy || 0) && altanerite >= (cost.altanerite || 0);
  };

  if (error) return <div style={{ color: "#f87171" }}>{error}</div>;
  if (!game) return <div style={{ color: "#e2e8f0" }}>Loading game...</div>;

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: 16,
              padding: 18,
              background: "rgba(15,23,42,0.75)",
              boxShadow: "0 16px 38px rgba(15,23,42,0.45)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "rgba(226,232,240,0.6)",
              }}
            >
              Nation
            </div>
            <h3 style={{ margin: "6px 0 0" }}>{game.nationName}</h3>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div>
                <strong>Status:</strong>{" "}
                {game.location?.mode === "space"
                  ? "In Space"
                  : `On ${game.location?.planet}`}
              </div>
              <div>
                <strong>Ship:</strong>{" "}
                {game.ship?.hasShip
                  ? `Lv ${game.ship.level} • Range ${game.ship.range}`
                  : "None"}
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                background: "rgba(148,163,184,0.08)",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Energy</span>
                <strong>
                  {Math.floor(game.resources?.energy || 0).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Altanerite</span>
                <strong>{Math.floor(game.resources?.altanerite || 0)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Homainionite</span>
                <strong>{Math.floor(game.resources?.homainionite || 0)}</strong>
              </div>
            </div>
          </div>

          {/* High-Tier Items Panel */}
          {game.inventory && Object.keys(game.inventory).length > 0 && (
            <div
              style={{
                border: "1px solid rgba(148,163,184,0.18)",
                borderRadius: 16,
                padding: 18,
                background: "rgba(15,23,42,0.75)",
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>High-Tier Items</h4>
                <a 
                  href="/portal/inventory" 
                  style={{ 
                    fontSize: 12, 
                    color: "#38bdf8",
                    textDecoration: "none"
                  }}
                >
                  View All
                </a>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(game.inventory)
                  .filter(([key, value]) => value > 0)
                  .sort((a, b) => {
                    // Sort by item rarity/value
                    const getItemValue = (key) => {
                      if (key.startsWith("refined")) return 100;
                      if (["diamond", "gold", "silver"].includes(key)) return 80;
                      if (["alexandrite", "altanerite"].includes(key)) return 60;
                      if (["iron", "copper"].includes(key)) return 40;
                      if (["stone", "fuel", "plastic", "glass", "water"].includes(key)) return 20;
                      return 10;
                    };
                    return getItemValue(b[0]) - getItemValue(a[0]);
                  })
                  .slice(0, 5) // Show top 5 items
                  .map(([key, value]) => {
                    const formatKey = (key) => {
                      if (key.startsWith("refined")) {
                        const base = key.replace(/^refined/, "");
                        return `Refined ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
                      }
                      return key.charAt(0).toUpperCase() + key.slice(1);
                    };
                    
                    const getItemColor = (key) => {
                      if (key.startsWith("refined")) return "#facc15";
                      if (["diamond", "gold", "silver"].includes(key)) return "#fbbf24";
                      if (["alexandrite", "altanerite"].includes(key)) return "#a78bfa";
                      if (["iron", "copper"].includes(key)) return "#f59e0b";
                      return "rgba(226,232,240,0.8)";
                    };

                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 8px",
                          borderRadius: 8,
                          background: "rgba(148,163,184,0.05)",
                          border: "1px solid rgba(148,163,184,0.1)",
                        }}
                      >
                        <span style={{ 
                          color: getItemColor(key),
                          fontWeight: 500,
                          fontSize: 13
                        }}>
                          {formatKey(key)}
                        </span>
                        <span style={{ 
                          color: "rgba(226,232,240,0.8)",
                          fontWeight: 600,
                          fontSize: 13
                        }}>
                          {Math.floor(value).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                {Object.entries(game.inventory).filter(([key, value]) => value > 0).length === 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    color: "rgba(226,232,240,0.6)",
                    fontSize: 12,
                    padding: "8px"
                  }}>
                    No items collected yet
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 16,
              padding: 18,
              background: "rgba(15,23,42,0.75)",
              display: "grid",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0 }}>Generators</h4>
              <span style={{ fontSize: 12, color: "rgba(226,232,240,0.65)" }}>
                Passive Production
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Solar Panels</span>
                <strong>{game.generators?.solarPanels || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Miners</span>
                <strong>{game.generators?.miners || 0}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Reactors</span>
                <strong>{game.generators?.reactors || 0}</strong>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <a
                href="/portal/frequency"
                className="btn"
                style={{ textAlign: "center" }}
              >
                Manage Power Systems
              </a>
            </div>
          </div>

          {isOnPlanet ? (
            <div
              style={{
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 16,
                padding: 18,
                background: "rgba(15,23,42,0.75)",
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>Planet Harvesting</h4>
                <span
                  style={{
                    fontSize: 12,
                    color: isHarvesting ? "#38bdf8" : "rgba(226,232,240,0.65)",
                  }}
                >
                  {isHarvesting ? "Gathering..." : "Ready"}
                </span>
              </div>
              {boosts ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(148,163,184,0.75)",
                    background: "rgba(148,163,184,0.08)",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  {boosts}
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href="/portal/home"
                  className="btn"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Open Harvest Interface
                </a>
                <button
                  onClick={async () => {
                    try {
                      setIsHarvesting(true);
                      const res = await axios.post(
                        "/api/game/planet-click",
                        { planetName: game.location?.planet, count: 3 },
                        { headers: tokenHeader },
                      );
                      setGame(res.data.game);
                    } catch (e) {
                    } finally {
                      setIsHarvesting(false);
                    }
                  }}
                  style={{ minWidth: 120 }}
                >
                  Quick Gather ×3
                </button>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "rgba(226,232,240,0.65)",
                    marginBottom: 6,
                  }}
                >
                  Loot Preview
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {planetLoot.length === 0 ? (
                    <div style={{ color: "rgba(226,232,240,0.6)" }}>
                      Travel to a planet to reveal its loot table.
                    </div>
                  ) : (
                    planetLoot.map((entry) => (
                      <div
                        key={entry.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: "1px solid rgba(148,163,184,0.18)",
                          borderRadius: 10,
                          padding: "8px 10px",
                        }}
                      >
                        <span style={{ textTransform: "capitalize" }}>
                          {entry.key}
                        </span>
                        <span style={{ color: "rgba(226,232,240,0.75)" }}>
                          {entry.min} – {entry.max}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 20,
            padding: 18,
            background:
              "radial-gradient(circle at top, rgba(56,189,248,0.18), rgba(15,23,42,0.9))",
            position: "relative",
            boxShadow: "0 28px 60px rgba(15,23,42,0.55)",
            display: "grid",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: "rgba(226,232,240,0.65)",
              }}
            >
              System
            </span>
            <a href="/portal/map" style={{ fontSize: 12, color: "#38bdf8" }}>
              View Map
            </a>
          </div>
          <div
            style={{
              background: `url(${currentBG}) center/contain no-repeat`,
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.25)",
              height: 320,
              position: "relative",
              overflow: "hidden",
              backgroundColor: "rgba(15,23,42,0.8)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 16,
                top: 140,
                width: 40,
                height: 40,
                borderRadius: 40,
                background: "#f59e0b",
              }}
            />
            {/* Placeholder planets - system data removed to fix unused variable */}
            <div
              style={{
                position: "absolute",
                left: 120,
                top: 160,
                width: 20,
                height: 20,
                borderRadius: 20,
                background: "#60a5fa",
                opacity: 0.7,
              }}
              title="Planet 1"
            />
            <div
              style={{
                position: "absolute",
                left: 180,
                top: 150,
                width: 16,
                height: 16,
                borderRadius: 16,
                background: "#34d399",
                opacity: 0.7,
              }}
              title="Planet 2"
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!game.ship?.hasShip ? (
              <button onClick={buildShip}>
                Build Ship (500 energy, 10 Altanerite)
              </button>
            ) : game.location?.mode === "planet" ? (
              <button onClick={launch}>Launch to Space</button>
            ) : (
              <>
                <button onClick={() => land(game.location?.planet)}>
                  Land on Current Planet
                </button>
                <button onClick={() => (window.location.href = "/portal/home")}>
                  Dock at Colony
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleGame;
