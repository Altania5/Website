import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import GameNav from "./GameNav";

const planetColorMap = {
  // Basic resources
  stone: "#cbd5e1",
  iron: "#94a3b8", 
  copper: "#f59e0b",
  altanerite: "#a78bfa",
  alexandrite: "#60a5fa",
  
  // Industrial materials
  fuel: "#facc15",
  plastic: "#fef08a",
  glass: "#e5e7eb",
  water: "#93c5fd",
  
  // Refined materials (created by Alexandrite Army)
  refinedStone: "#e2e8f0",
  refinedIron: "#cbd5e1",
  refinedCopper: "#fbbf24",
  refinedAltanerite: "#c4b5fd",
  refinedAlexandrite: "#93c5fd",
  
  // Default color for unknown items
  default: "#a7f3d0",
};

const prettyKey = (key) => {
  if (key.startsWith("refined")) {
    const base = key.replace(/^refined/, "");
    return `Refined ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const PortalHome = () => {
  const [game, setGame] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const floaterId = useRef(0);
  const surfaceRef = useRef(null);

  const loadState = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await axios.get("/api/game/state", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGame(res.data.game);
    } catch {}
  };

  useEffect(() => {
    loadState();
  }, []);

  const activePlanet = game?.location?.planet || "";

  const lootSummary = useMemo(() => {
    if (!game || !game.location?.planetLoot) return [];
    return game.location.planetLoot;
  }, [game]);

  const boostsSummary = useMemo(() => {
    if (!game || !game.fleet) return null;
    const summary = [];
    const topaz = game.fleet.topazTroopers;
    const alex = game.fleet.alexandriteArmy;
    if (topaz?.count) {
      summary.push("Topaz Troopers accelerate harvest operations");
    }
    if (alex?.count) {
      summary.push("Alexandrite Army enhances refined find rate");
    }
    return summary.length ? summary.join(" • ") : null;
  }, [game?.fleet]);

  const emitFloaters = (drops, anchor) => {
    if (!surfaceRef.current || drops.length === 0) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const baseX = anchor?.x ?? rect.width / 2;
    const baseY = anchor?.y ?? rect.height / 2;
    drops.slice(0, 4).forEach((drop, index) => {
      const id = floaterId.current++;
      const jitterX = baseX + index * 18 - 16;
      const jitterY = baseY - index * 26;
      const color = drop.refined
        ? "#facc15"
        : planetColorMap[drop.key.replace(/^refined/i, "").toLowerCase()] ||
          planetColorMap.default;
      setFloaters((f) => [
        ...f,
        {
          id,
          text: `+${drop.amount} ${prettyKey(drop.key)}`,
          x: jitterX,
          y: jitterY,
          color,
        },
      ]);
      setTimeout(
        () => setFloaters((f) => f.filter((x) => x.id !== id)),
        1400 + index * 150,
      );
    });
  };

  const harvest = async (harvestCount = 1, anchor) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        "/api/game/planet-click",
        { planetName: game.location?.planet, count: harvestCount },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGame(res.data.game);
      const drops = res.data.drops || [];
      emitFloaters(drops, anchor);
    } catch {}
  };

  const onSurfaceClick = (event) => {
    if (!surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    harvest(1, { x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const onSurfaceDoubleClick = (event) => {
    if (!surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    harvest(5, { x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const triggerHarvest = (amount) => {
    if (!surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    harvest(amount, { x: rect.width / 2, y: rect.height / 2 });
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3 style={{ marginBottom: 16 }}>Colony Control</h3>
      {game ? (
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "minmax(0, 340px) 1fr",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.25)",
                background: "rgba(15,23,42,0.72)",
                boxShadow: "0 12px 32px rgba(15,23,42,0.45)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "rgba(226,232,240,0.65)",
                  marginBottom: 6,
                }}
              >
                Nation
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {game.nationName}
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
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
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(148,163,184,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "rgba(148,163,184,0.7)",
                  }}
                >
                  Resources
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Energy</span>
                    <div style={{ textAlign: "right" }}>
                      <strong>
                        {Math.floor(game.resources?.energy || 0).toLocaleString()}
                      </strong>
                      <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                        +{Math.floor((game.generators?.solarPanels || 0) * 1.5 + (game.generators?.reactors || 0) * 8 + 2)}/s
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Altanerite</span>
                    <div style={{ textAlign: "right" }}>
                      <strong>
                        {Math.floor(game.resources?.altanerite || 0)}
                      </strong>
                      <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                        +{((game.generators?.miners || 0) * 0.3).toFixed(1)}/s
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Homainionite</span>
                    <div style={{ textAlign: "right" }}>
                      <strong>
                        {Math.floor(game.resources?.homainionite || 0)}
                      </strong>
                      <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                        +{((game.generators?.miners || 0) * 0.08).toFixed(2)}/s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.2)",
                background: "rgba(15,23,42,0.72)",
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
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: "rgba(148,163,184,0.65)",
                    }}
                  >
                    Current Planet
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {activePlanet}
                  </div>
                </div>
                <button style={{ padding: "6px 12px" }} onClick={loadState}>
                  Sync
                </button>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "rgba(148,163,184,0.65)",
                    marginBottom: 6,
                  }}
                >
                  Loot Table
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {lootSummary.length === 0 ? (
                    <div style={{ color: "rgba(226,232,240,0.6)" }}>
                      Land on a planet to reveal its drops.
                    </div>
                  ) : (
                    lootSummary.map((loot) => (
                      <div
                        key={loot.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "rgba(148,163,184,0.08)",
                          border: "1px solid rgba(148,163,184,0.16)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 8,
                              background:
                                planetColorMap[loot.key] ||
                                planetColorMap.default,
                            }}
                          />
                          <span>{loot.key}</span>
                        </div>
                        <span style={{ color: "rgba(226,232,240,0.7)" }}>
                          {loot.min} – {loot.max}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {boostsSummary ? (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(148,163,184,0.08)",
                      border: "1px solid rgba(148,163,184,0.16)",
                      fontSize: 12,
                      color: "rgba(226,232,240,0.8)",
                    }}
                    title="Military forces can enhance yield and quality of gathered resources."
                  >
                    {boostsSummary}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => triggerHarvest(1)}
                  style={{ padding: "10px 12px" }}
                >
                  Gather Once
                </button>
                <button
                  onClick={() => triggerHarvest(5)}
                  style={{ padding: "10px 12px" }}
                >
                  Quick Gather ×5
                </button>
                <button
                  onClick={() => triggerHarvest(10)}
                  style={{ padding: "10px 12px" }}
                >
                  Expedition ×10
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {!game.ship?.hasShip ? (
                <a
                  className="btn"
                  href="/portal/energy"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Earn energy and build your first ship
                </a>
              ) : game.location?.mode === "planet" ? (
                <a
                  className="btn"
                  href="/portal/energy"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Prepare for launch
                </a>
              ) : (
                <a
                  className="btn"
                  href="/portal/map"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Open Map
                </a>
              )}
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: 20,
              background:
                "radial-gradient(circle at top, rgba(56,189,248,0.18), rgba(15,23,42,0.9))",
              padding: 18,
              position: "relative",
              boxShadow: "0 24px 60px rgba(15,23,42,0.55)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.7)",
                marginBottom: 12,
              }}
            >
              Planet Surface
            </div>
            <div
              ref={surfaceRef}
              onClick={onSurfaceClick}
              onDoubleClick={onSurfaceDoubleClick}
              style={{
                height: 360,
                borderRadius: 18,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid rgba(148,163,184,0.3)",
                background: `url(${activePlanet.toLowerCase() === "zwamsha" ? "/images/zwamsha.gif" : "/images/islands.gif"}) center/contain no-repeat`,
                backgroundColor: "rgba(15,23,42,0.8)",
              }}
              title="Click to gather, double click for burst harvest"
            >
              {floaters.map((f) => (
                <div
                  key={f.id}
                  style={{
                    position: "absolute",
                    left: f.x,
                    top: f.y,
                    color: f.color,
                    fontWeight: 800,
                    textShadow: "0 1px 2px rgba(0,0,0,0.75)",
                    animation: "riseUp 1.4s ease-out forwards",
                    pointerEvents: "none",
                  }}
                >
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PortalHome;
