import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import GameNav from "./GameNav";
import useGameLoop from "../hooks/useGameLoop";
import useToast from "../hooks/useToast";
import ToastContainer from "./Toast";

// Removed unused boostSummary function

const IdleGame = () => {
  const [game, setGame] = useState(null);
  const [system, setSystem] = useState(null);
  const [error, setError] = useState("");
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    clicks: 0,
    resourcesGained: {},
    startTime: Date.now(),
    lastClicks: [],
    highestDrop: 0
  });
  const [recentHarvests, setRecentHarvests] = useState([]);
  const [autoHarvest, setAutoHarvest] = useState(false);
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

  const fetchState = useCallback(async () => {
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
  }, [tokenHeader]);

  const loadSystem = useCallback(async () => {
    try {
      const res = await axios.get("/api/game/system", { headers: tokenHeader });
      setSystem(res.data);
    } catch (e) {
      console.error("Failed to load system:", e);
    }
  }, [tokenHeader]);

  useEffect(() => {
    fetchState();
    loadSystem();
    
    // Load auto-harvest preference
    const savedAutoHarvest = localStorage.getItem("autoHarvest") === "true";
    setAutoHarvest(savedAutoHarvest);
  }, [fetchState, loadSystem]);

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

  const handlePlanetClick = useCallback(async (count = 1) => {
    if (!game?.location || game.location.mode !== "planet") {
      showError("You must be on a planet to harvest!");
      return;
    }

    try {
      setIsHarvesting(true);
      const res = await axios.post(
        "/api/game/planet-click",
        { planetName: game.location.planet, count },
        { headers: tokenHeader },
      );
      
      setGame(res.data.game);
      
      // Update session stats
      setSessionStats(prev => {
        const newClicks = prev.clicks + count;
        const newLastClicks = [...prev.lastClicks, Date.now()].slice(-10);
        const newResourcesGained = { ...prev.resourcesGained };
        
        // Add gained resources
        res.data.gains?.forEach(gain => {
          newResourcesGained[gain.key] = (newResourcesGained[gain.key] || 0) + gain.amount;
        });
        
        // Track highest drop
        const highestDrop = Math.max(
          prev.highestDrop,
          ...res.data.gains.map(g => g.amount)
        );
        
        return {
          ...prev,
          clicks: newClicks,
          lastClicks: newLastClicks,
          resourcesGained: newResourcesGained,
          highestDrop
        };
      });
      
      // Add to recent harvests
      const harvestEntry = {
        id: Date.now(),
        timestamp: new Date(),
        gains: res.data.gains || [],
        drops: res.data.drops || [],
        gatherBoost: res.data.gatherBoost || 1,
        qualityBoost: res.data.qualityBoost || 1
      };
      
      setRecentHarvests(prev => [harvestEntry, ...prev].slice(0, 5));
      
      // Show floating numbers animation
      res.data.gains?.forEach(gain => {
        showFloatingNumber(gain.key, gain.amount);
      });
      
      if (count === 1) {
        success(`Harvested ${res.data.gains?.length || 0} resources!`);
      } else {
        success(`Harvested ${count} times!`);
      }
      
    } catch (e) {
      showError(e?.response?.data?.error || "Harvest failed");
    } finally {
      setIsHarvesting(false);
    }
  }, [game?.location, showError, tokenHeader, showFloatingNumber, success]);

  const showFloatingNumber = (resourceKey, amount) => {
    // Create floating number element
    const floatingEl = document.createElement('div');
    floatingEl.textContent = `+${amount} ${resourceKey}`;
    floatingEl.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      color: ${getResourceColor(resourceKey)};
      font-weight: bold;
      font-size: 14px;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
      animation: floatUp 2s ease-out forwards;
    `;
    
    // Position near planet
    const planetEl = document.querySelector('.clickable-planet');
    if (planetEl) {
      const rect = planetEl.getBoundingClientRect();
      floatingEl.style.left = (rect.left + rect.width / 2) + 'px';
      floatingEl.style.top = (rect.top + rect.height / 2) + 'px';
    } else {
      floatingEl.style.left = '50%';
      floatingEl.style.top = '50%';
    }
    
    document.body.appendChild(floatingEl);
    
    // Remove after animation
    setTimeout(() => {
      if (floatingEl.parentNode) {
        floatingEl.parentNode.removeChild(floatingEl);
      }
    }, 2000);
  };

  const getResourceColor = (resourceKey) => {
    if (resourceKey.startsWith("refined")) return "#facc15";
    if (["diamond", "gold", "silver"].includes(resourceKey)) return "#fbbf24";
    if (["alexandrite", "altanerite"].includes(resourceKey)) return "#a78bfa";
    if (["iron", "copper"].includes(resourceKey)) return "#f59e0b";
    return "#e2e8f0";
  };

  const toggleAutoHarvest = () => {
    const newAutoHarvest = !autoHarvest;
    setAutoHarvest(newAutoHarvest);
    localStorage.setItem("autoHarvest", newAutoHarvest.toString());
    
    if (newAutoHarvest) {
      success("Auto-harvest enabled!");
    } else {
      success("Auto-harvest disabled!");
    }
  };

  // Auto-harvest effect
  useEffect(() => {
    if (!autoHarvest || !game?.location || game.location.mode !== "planet") {
      return;
    }
    
    const interval = setInterval(() => {
      handlePlanetClick(1);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [autoHarvest, game?.location, handlePlanetClick]);

  const currentBG =
    game?.location?.mode === "space"
      ? "/images/space.gif"
      : "/images/zwamsha.gif";
  const planetLoot = useMemo(
    () => game?.location?.planetLoot || [],
    [game?.location?.planetLoot],
  );
  const isOnPlanet = game?.location?.mode === "planet";

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
            {/* Session Stats */}
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 12,
                background: "rgba(148,163,184,0.08)",
                display: "grid",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "rgba(226,232,240,0.6)",
                  marginBottom: 4,
                }}
              >
                Session Stats
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Time Played:</span>
                  <span style={{ fontWeight: "bold" }}>
                    {Math.floor((Date.now() - sessionStats.startTime) / 60000)}m
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total Clicks:</span>
                  <span style={{ fontWeight: "bold", color: "#10b981" }}>
                    {sessionStats.clicks}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Resources Gained:</span>
                  <span style={{ fontWeight: "bold" }}>
                    {Object.keys(sessionStats.resourcesGained).length}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Highest Drop:</span>
                  <span style={{ fontWeight: "bold", color: "#f59e0b" }}>
                    {sessionStats.highestDrop}
                  </span>
                </div>
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

          {/* Recent Harvests Panel */}
          {recentHarvests.length > 0 && (
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
                <h4 style={{ margin: 0 }}>Recent Harvests</h4>
                <span style={{ fontSize: 12, color: "rgba(226,232,240,0.6)" }}>
                  Last 5
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {recentHarvests.map((harvest) => (
                  <div
                    key={harvest.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "rgba(148,163,184,0.08)",
                      border: "1px solid rgba(148,163,184,0.16)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "rgba(226,232,240,0.8)" }}>
                        {harvest.timestamp.toLocaleTimeString()}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(226,232,240,0.6)" }}>
                        {harvest.gains.length} resources • 
                        {harvest.gatherBoost > 1 && ` ${harvest.gatherBoost.toFixed(1)}x speed`}
                        {harvest.qualityBoost > 1 && ` • ${harvest.qualityBoost.toFixed(1)}x quality`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {harvest.gains.slice(0, 3).map((gain, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 10,
                            color: getResourceColor(gain.key),
                            fontWeight: "bold",
                          }}
                        >
                          +{gain.amount}
                        </span>
                      ))}
                      {harvest.gains.length > 3 && (
                        <span style={{ fontSize: 10, color: "rgba(226,232,240,0.6)" }}>
                          +{harvest.gains.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                href="/portal/energy"
                className="btn"
                style={{ textAlign: "center" }}
              >
                Manage Power Systems
              </a>
              <a
                href="/portal/military"
                className="btn"
                style={{ textAlign: "center" }}
              >
                Military Forces
              </a>
              <a
                href="/portal/inventory"
                className="btn"
                style={{ textAlign: "center" }}
              >
                View Inventory
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
              {/* Active Boost Indicators */}
              {game?.fleet && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(148,163,184,0.75)",
                    background: "rgba(148,163,184,0.08)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "grid",
                    gap: 4,
                  }}
                >
                  {game.fleet.topazTroopers?.count > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>⚡ Gather Speed:</span>
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>
                        {(1 + game.fleet.topazTroopers.count * 0.1).toFixed(1)}x
                      </span>
                    </div>
                  )}
                  {game.fleet.alexandriteArmy?.count > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>✨ Quality Boost:</span>
                      <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>
                        {(1 + game.fleet.alexandriteArmy.count * 0.15).toFixed(1)}x
                      </span>
                    </div>
                  )}
                  {game.fleet.nephriteNavy?.count > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>🚀 Navy Power:</span>
                      <span style={{ color: "#3b82f6", fontWeight: "bold" }}>
                        Level {game.fleet.nephriteNavy.level}
                      </span>
                    </div>
                  )}
                  {!game.fleet.topazTroopers?.count && !game.fleet.alexandriteArmy?.count && !game.fleet.nephriteNavy?.count && (
                    <div style={{ fontStyle: "italic", opacity: 0.6 }}>
                      No active military boosts
                    </div>
                  )}
                </div>
              )}
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
            {/* Large Clickable Planet */}
            {game?.location?.mode === "planet" && (
              <div
                className="clickable-planet"
                onClick={() => handlePlanetClick(1)}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  cursor: isHarvesting ? "wait" : "pointer",
                  border: "3px solid rgba(148,163,184,0.3)",
                  transition: "all 0.2s ease",
                  animation: "planetIdle 4s ease-in-out infinite",
                  backgroundImage: `url(${
                    game.location.planet?.toLowerCase() === "zwamsha"
                      ? "/images/zwamsha.gif"
                      : system?.planets?.find(p => p.name === game.location.planet)?.type === "altanerite"
                      ? "/images/altanerite-planet.gif"
                      : system?.planets?.find(p => p.name === game.location.planet)?.type === "homainionite"
                      ? "/images/homainionite-planet.gif"
                      : system?.planets?.find(p => p.name === game.location.planet)?.type === "gas"
                      ? "/images/gas-planet.gif"
                      : system?.planets?.find(p => p.name === game.location.planet)?.type === "ice"
                      ? "/images/ice-planet.gif"
                      : "/images/islands.gif"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 0 20px rgba(56,189,248,0.3)",
                  opacity: isHarvesting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isHarvesting) {
                    e.target.style.border = "3px solid #60a5fa";
                    e.target.style.boxShadow = "0 0 30px rgba(96,165,250,0.5)";
                    e.target.style.transform = "translate(-50%, -50%) scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHarvesting) {
                    e.target.style.border = "3px solid rgba(148,163,184,0.3)";
                    e.target.style.boxShadow = "0 0 20px rgba(56,189,248,0.3)";
                    e.target.style.transform = "translate(-50%, -50%) scale(1)";
                  }
                }}
                onMouseDown={(e) => {
                  if (!isHarvesting) {
                    e.target.style.animation = "planetPulse 0.3s ease-out";
                    setTimeout(() => {
                      e.target.style.animation = "planetIdle 4s ease-in-out infinite";
                    }, 300);
                  }
                }}
              >
                {/* Auto-harvest indicator */}
                {autoHarvest && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      background: "#10b981",
                      color: "white",
                      fontSize: 10,
                      fontWeight: "bold",
                      padding: "2px 6px",
                      borderRadius: 10,
                      border: "2px solid rgba(15,23,42,0.8)",
                    }}
                  >
                    AUTO
                  </div>
                )}
                
                {/* Planet name */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 12,
                    color: "#e2e8f0",
                    fontWeight: "bold",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {game.location.planet}
                </div>
              </div>
            )}
            
            {/* Space mode indicator */}
            {game?.location?.mode === "space" && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 16,
                  color: "rgba(226,232,240,0.6)",
                  textAlign: "center",
                  background: "rgba(15,23,42,0.8)",
                  padding: "20px",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.2)",
                }}
              >
                <div style={{ marginBottom: 8 }}>🚀 In Space</div>
                <div style={{ fontSize: 12 }}>
                  Land on a planet to start harvesting
                </div>
              </div>
            )}
          </div>
          {/* Multi-click buttons and actions */}
          {game?.location?.mode === "planet" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <button
                  onClick={() => handlePlanetClick(5)}
                  disabled={isHarvesting}
                  style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    opacity: isHarvesting ? 0.5 : 1,
                    cursor: isHarvesting ? "not-allowed" : "pointer",
                  }}
                >
                  Gather ×5
                </button>
                <button
                  onClick={() => handlePlanetClick(10)}
                  disabled={isHarvesting}
                  style={{
                    padding: "8px 16px",
                    background: "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    opacity: isHarvesting ? 0.5 : 1,
                    cursor: isHarvesting ? "not-allowed" : "pointer",
                  }}
                >
                  Gather ×10
                </button>
                <button
                  onClick={() => handlePlanetClick(25)}
                  disabled={isHarvesting}
                  style={{
                    padding: "8px 16px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    opacity: isHarvesting ? 0.5 : 1,
                    cursor: isHarvesting ? "not-allowed" : "pointer",
                  }}
                >
                  Gather ×25
                </button>
                <button
                  onClick={toggleAutoHarvest}
                  style={{
                    padding: "8px 16px",
                    background: autoHarvest ? "#10b981" : "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  {autoHarvest ? "Auto ON" : "Auto OFF"}
                </button>
              </div>
              
              {/* Session stats */}
              <div style={{ 
                fontSize: 11, 
                color: "rgba(226,232,240,0.6)",
                display: "flex",
                gap: 16,
                flexWrap: "wrap"
              }}>
                <span>Clicks: {sessionStats.clicks}</span>
                <span>Highest Drop: {sessionStats.highestDrop}</span>
                <span>
                  Speed: {sessionStats.lastClicks.length > 1 
                    ? ((sessionStats.lastClicks.length - 1) / 
                       ((sessionStats.lastClicks[sessionStats.lastClicks.length - 1] - sessionStats.lastClicks[0]) / 1000)).toFixed(1)
                    : 0}/s
                </span>
              </div>
            </div>
          )}
          
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
