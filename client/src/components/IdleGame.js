import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import GameNav from "./GameNav";
import useGameLoop from "../hooks/useGameLoop";
import useToast from "../hooks/useToast";
import ToastContainer from "./Toast";

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
  const [system, setSystem] = useState(null);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const { pauseLoop, resumeLoop } = useGameLoop(2000);
  const { toasts, removeToast, success, error: showError } = useToast();

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

  const loadSystem = async () => {
    try {
      const res = await axios.get("/api/game/system", { headers: tokenHeader });
      setSystem(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchState();
    loadSystem();
  }, []);

  const buildShip = async () => {
    try {
      const res = await axios.post(
        "/api/game/build-ship",
        {},
        { headers: tokenHeader },
      );
      setGame(res.data.game);
      success("🚀 Ship built successfully!");
    } catch (e) {
      showError(e?.response?.data?.error || "Build failed");
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
      success("🚀 Launched into space!");
    } catch (e) {
      showError(e?.response?.data?.error || "Launch failed");
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
      success(`🌍 Landed on ${planetName}!`);
    } catch (e) {
      showError(e?.response?.data?.error || "Landing failed");
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <GameNav />
      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={pauseLoop}
          style={{ padding: "4px 8px", fontSize: 12, background: "#f59e0b", color: "white", border: "none", borderRadius: 4 }}
        >
          ⏸️ Pause
        </button>
        <button
          onClick={resumeLoop}
          style={{ padding: "4px 8px", fontSize: 12, background: "#10b981", color: "white", border: "none", borderRadius: 4 }}
        >
          ▶️ Resume
        </button>
        <span style={{ fontSize: 12, color: "rgba(226,232,240,0.6)" }}>
          Game loop: Active
        </span>
      </div>
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
              {game.ship?.hasShip && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          "/api/game/upgrade-ship",
                          {},
                          { headers: tokenHeader },
                        );
                        setGame(res.data.game);
                      } catch (e) {
                        alert(e?.response?.data?.error || "Upgrade failed");
                      }
                    }}
                    disabled={
                      !canAfford({
                        energy: game.ship.level * 500,
                        altanerite: Math.floor(game.ship.level / 2),
                      })
                    }
                    style={{ fontSize: 12, padding: "4px 8px" }}
                  >
                    Upgrade Ship ({game.ship.level * 500} Energy, {Math.floor(game.ship.level / 2)} Altanerite)
                  </button>
                </div>
              )}
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
                <div style={{ textAlign: "right" }}>
                  <strong>
                    {Math.floor(game.resources?.energy || 0).toLocaleString()}
                  </strong>
                  <div style={{ fontSize: 11, color: "rgba(226,232,240,0.6)" }}>
                    +{Math.floor((game.generators?.solarPanels || 0) * 1.5 + (game.generators?.reactors || 0) * 8 + 2)}/s
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Altanerite</span>
                <div style={{ textAlign: "right" }}>
                  <strong>{Math.floor(game.resources?.altanerite || 0)}</strong>
                  <div style={{ fontSize: 11, color: "rgba(226,232,240,0.6)" }}>
                    +{((game.generators?.miners || 0) * 0.3).toFixed(1)}/s
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Homainionite</span>
                <div style={{ textAlign: "right" }}>
                  <strong>{Math.floor(game.resources?.homainionite || 0)}</strong>
                  <div style={{ fontSize: 11, color: "rgba(226,232,240,0.6)" }}>
                    +{((game.generators?.miners || 0) * 0.08).toFixed(2)}/s
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                href="/portal/energy"
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
                        <span>{entry.key}</span>
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
              background: `url(${currentBG}) center/cover no-repeat`,
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.25)",
              height: 320,
              position: "relative",
              overflow: "hidden",
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
            {system?.planets?.map((p, i) => (
              <div
                key={i}
                title={p.name}
                style={{
                  position: "absolute",
                  left: 80 + p.distance,
                  top: 160 - p.size / 2,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size,
                  background: p.color,
                  opacity: p.name === game.location?.planet ? 1 : 0.7,
                  boxShadow:
                    p.name === game.location?.planet
                      ? "0 0 12px rgba(96,165,250,0.65)"
                      : "none",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!game.ship?.hasShip ? (
              <button onClick={buildShip}>
                Build Ship (300 energy, 5 Altanerite)
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
