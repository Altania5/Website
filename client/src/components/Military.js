import React, { useEffect, useMemo, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const defaultFleet = {
  mainShips: 0,
  commShips: 0,
  surveillanceShips: 0,
  supportWings: 0,
  alexandriteArmy: { count: 0, level: 1 },
  topazTroopers: { count: 0, level: 1 },
  nephriteNavy: { count: 0, level: 1 },
};

const Military = () => {
  const [fleet, setFleet] = useState(defaultFleet);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState({
    nephrite: false,
    alexandrite: false,
    topaz: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/game/state", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFleet({ ...defaultFleet, ...(res.data.game.fleet || {}) });
        setError("");
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load fleet");
      }
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token") || "";
      await axios.post("/api/game/save-fleet", fleet, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLastSaved(new Date());
      setError("");
    } catch (e) {
      setError(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const num = (v) => Math.max(0, Number(v || 0));
  const computedPower = useMemo(() => {
    const navyPower =
      fleet.mainShips * 5 +
      fleet.supportWings * 3 +
      fleet.commShips * 2 +
      fleet.surveillanceShips * 2;
    const nephritePower =
      fleet.nephriteNavy.count * (fleet.nephriteNavy.level * 2.5);
    const topazPower =
      fleet.topazTroopers.count * 1.5 * fleet.topazTroopers.level;
    const alexPower =
      fleet.alexandriteArmy.count * (fleet.alexandriteArmy.level * 2);
    return Math.round(navyPower + topazPower + alexPower + nephritePower);
  }, [fleet]);

  const nephriteReadiness = useMemo(() => {
    const count = fleet.nephriteNavy.count;
    const level = fleet.nephriteNavy.level;
    if (count === 0) return "No command ships ready";
    if (count < 3) return "Minimal command presence";
    if (count < 6) return `Standard fleet ready (Lvl ${level})`;
    return `Expeditionary fleet ready (Lvl ${level})`;
  }, [fleet.nephriteNavy]);

  const topazBoost = useMemo(() => {
    const { count, level } = fleet.topazTroopers;
    if (!count) return "No harvesting bonuses";
    const speedBoost = (1 + count * 0.02).toFixed(2);
    const qualityBoost = (1 + (level - 1) * 0.12).toFixed(2);
    return `Harvest Speed ×${speedBoost} · Quality ×${qualityBoost}`;
  }, [fleet.topazTroopers]);

  const alexDoctrine = useMemo(() => {
    const { count, level } = fleet.alexandriteArmy;
    if (!count) return "No invasion corps ready";
    if (level < 3) return "Tactical strike teams active";
    if (level < 5) return "Orbital siege corps mobilized";
    return "Planetary conquest force deployed";
  }, [fleet.alexandriteArmy]);

  const upgradeConfig = {
    nephrite: (level) => 800 + Math.round(level * 450),
    alexandrite: (level) => 500 + Math.round(level * 320),
    topaz: (level) => 300 + Math.round(level * 180),
  };

  const canPay = (cost) => (gameResources) =>
    Number(gameResources.energy || 0) >= cost;

  const upgradeBranch = async (branch) => {
    try {
      setUpgrading((s) => ({ ...s, [branch]: true }));
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        "/api/game/upgrade-force",
        { branch },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFleet(res.data.game.fleet);
      setError("");
      setLastSaved(new Date());
    } catch (e) {
      setError(e?.response?.data?.error || "Upgrade failed");
    } finally {
      setUpgrading((s) => ({ ...s, [branch]: false }));
    }
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Military Forces</h3>
        <div>
          <span style={{ opacity: 0.75 }}>Projected Power:</span>{" "}
          <strong>{computedPower.toLocaleString()}</strong>
        </div>
      </div>
      {error ? (
        <div style={{ marginTop: 8, color: "#f87171" }}>{error}</div>
      ) : null}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
          display: "grid",
          gap: 8,
        }}
      >
        <div>
          <strong>Nephrite Navy Readiness:</strong> {nephriteReadiness}
        </div>
        <div>
          <strong>Topaz Trooper Harvest Bonuses:</strong> {topazBoost}
        </div>
        <div>
          <strong>Alexandrite Army Doctrine:</strong> {alexDoctrine}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
            display: "grid",
            gap: 12,
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>Nephrite Navy</h4>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "rgba(226,232,240,0.65)",
              }}
            >
              Command ships responsible for deep-space travel and fleet
              coordination. Building the flagship unlocks interstellar
              operations.
            </p>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "rgba(226,232,240,0.55)",
              }}
            >
              Construct the <strong>Command Ship</strong> to activate warp
              lanes, then scale additional capital hulls to escort future
              conquest fleets.
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Command Ships</span>
              <input
                type="number"
                value={fleet.nephriteNavy.count}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    nephriteNavy: {
                      ...fleet.nephriteNavy,
                      count: num(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>Command Doctrine Level</span>
              <input
                type="number"
                value={fleet.nephriteNavy.level}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    nephriteNavy: {
                      ...fleet.nephriteNavy,
                      level: Math.max(1, num(e.target.value)),
                    },
                  })
                }
              />
            </label>
          </div>
          <button
            onClick={() => upgradeBranch("nephrite")}
            disabled={upgrading.nephrite}
            style={{ marginTop: 8 }}
            title={`Cost: ${upgradeConfig.nephrite(
              fleet.nephriteNavy.level,
            )} energy`}
          >
            {upgrading.nephrite ? "Upgrading..." : "Upgrade Doctrine"}
          </button>
        </div>
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <div>
            <h4 style={{ marginTop: 0 }}>Alexandrite Army</h4>
            <p
              style={{
                margin: "4px 0 12px",
                fontSize: 12,
                color: "rgba(226,232,240,0.65)",
              }}
            >
              Elite forces trained for planetary sieges and ground invasion
              campaigns.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              <span>Division Count</span>
              <input
                type="number"
                value={fleet.alexandriteArmy.count}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    alexandriteArmy: {
                      ...fleet.alexandriteArmy,
                      count: num(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              <span>Invasion Doctrine Level</span>
              <input
                type="number"
                value={fleet.alexandriteArmy.level}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    alexandriteArmy: {
                      ...fleet.alexandriteArmy,
                      level: Math.max(1, num(e.target.value)),
                    },
                  })
                }
              />
            </label>
          </div>
          <button
            onClick={() => upgradeBranch("alexandrite")}
            disabled={upgrading.alexandrite}
            style={{ marginTop: 8 }}
            title={`Cost: ${upgradeConfig.alexandrite(
              fleet.alexandriteArmy.level,
            )} energy`}
          >
            {upgrading.alexandrite ? "Upgrading..." : "Upgrade Doctrine"}
          </button>
        </div>
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <div>
            <h4 style={{ marginTop: 0 }}>Topaz Troopers</h4>
            <p
              style={{
                margin: "4px 0 12px",
                fontSize: 12,
                color: "rgba(226,232,240,0.65)",
              }}
            >
              Planetary specialists that enhance harvesting speed and resource
              quality across occupied worlds.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              <span>Trooper Companies</span>
              <input
                type="number"
                value={fleet.topazTroopers.count}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    topazTroopers: {
                      ...fleet.topazTroopers,
                      count: num(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              <span>Planetary Optimization Level</span>
              <input
                type="number"
                value={fleet.topazTroopers.level}
                onChange={(e) =>
                  setFleet({
                    ...fleet,
                    topazTroopers: {
                      ...fleet.topazTroopers,
                      level: Math.max(1, num(e.target.value)),
                    },
                  })
                }
              />
            </label>
          </div>
          <button
            onClick={() => upgradeBranch("topaz")}
            disabled={upgrading.topaz}
            style={{ marginTop: 8 }}
            title={`Cost: ${upgradeConfig.topaz(
              fleet.topazTroopers.level,
            )} energy`}
          >
            {upgrading.topaz ? "Upgrading..." : "Optimize Operations"}
          </button>
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </button>
        {lastSaved ? (
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Last saved {lastSaved.toLocaleTimeString()}
          </span>
        ) : null}
        <button
          onClick={() => window.location.reload()}
          style={{ marginLeft: "auto" }}
        >
          Reload Fleet
        </button>
      </div>
    </div>
  );
};

export default Military;
