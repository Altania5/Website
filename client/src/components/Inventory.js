import React, { useEffect, useMemo, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const GROUPS = {
  Resources: [
    "wood",
    "stone",
    "iron",
    "copper",
    "altanerite",
    "alexandrite",
    "homainionite",
  ],
  Materials: ["plastic", "glass", "fuel", "water", "lava"],
  Misc: [
    "gold",
    "silver",
    "diamond",
    "miscComputerParts",
    "coal",
    "dirt",
    "clay",
    "rope",
  ],
};

const groupInventory = (inventory) => {
  const baseGroups = Object.entries(GROUPS).map(([category, keys]) => ({
    category,
    entries: keys
      .filter((key) => inventory[key] !== undefined)
      .map((key) => ({ key, value: inventory[key] })),
  }));

  const groupedKeys = new Set(Object.values(GROUPS).flat());
  const otherEntries = Object.entries(inventory).filter(
    ([key]) => !groupedKeys.has(key),
  );

  if (otherEntries.length) {
    baseGroups.push({
      category: "Other",
      entries: otherEntries.map(([key, value]) => ({ key, value })),
    });
  }

  return baseGroups.filter((group) => group.entries.length > 0);
};

const formatKey = (key) => {
  if (key.startsWith("refined")) {
    const base = key.replace(/^refined/, "");
    return `Refined ${base}`;
  }
  return key;
};

const Inventory = () => {
  const [inv, setInv] = useState(null);
  const [alloc, setAlloc] = useState(0);
  const [queue, setQueue] = useState([]);

  const load = async () => {
    const token = localStorage.getItem("token") || "";
    const res = await axios.get("/api/game/state", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInv(res.data.game.inventory);
    setAlloc(res.data.game.energyAllocation?.craftingPct || 0);
    setQueue(res.data.game.craftingQueue || []);
  };

  useEffect(() => {
    load();
  }, []);

  const saveAlloc = async () => {
    const token = localStorage.getItem("token") || "";
    await axios.post(
      "/api/game/allocate-energy",
      { craftingPct: alloc },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await load();
  };

  const addJob = async (type, energyRequired) => {
    const token = localStorage.getItem("token") || "";
    await axios.post(
      "/api/game/craft",
      { type, energyRequired },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await load();
  };

  const cancelJob = async (index) => {
    const token = localStorage.getItem("token") || "";
    await axios.post(
      "/api/game/cancel-craft",
      { index },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await load();
  };

  if (!inv) {
    return (
      <div style={{ color: "#e2e8f0" }}>
        <GameNav />
        <div>Loading inventory...</div>
      </div>
    );
  }

  const grouped = groupInventory(inv);
  const totalUnits = Object.values(inv).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3 style={{ margin: 0 }}>Inventory</h3>
      <div style={{ marginTop: 8, color: "rgba(226,232,240,0.8)" }}>
        Total Units: <strong>{Math.floor(totalUnits).toLocaleString()}</strong>
      </div>

      <table
        style={{
          marginTop: 16,
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid rgba(148,163,184,0.2)",
          background: "rgba(15,23,42,0.7)",
        }}
      >
        <thead>
          <tr style={{ background: "rgba(148,163,184,0.12)" }}>
            <th style={{ textAlign: "left", padding: "10px 12px" }}>
              Category
            </th>
            <th style={{ textAlign: "left", padding: "10px 12px" }}>
              Resource
            </th>
            <th style={{ textAlign: "right", padding: "10px 12px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {grouped
            .flatMap((group) =>
              group.entries.map(({ key, value }, index) => ({
                showCategory: index === 0,
                category: group.category,
                key,
                value,
                total:
                  index === 0
                    ? group.entries.reduce(
                        (s, entry) => s + Number(entry.value || 0),
                        0,
                      )
                    : null,
                span: group.entries.length,
              })),
            )
            .map((row, index) => (
              <tr
                key={`${row.category || "none"}-${row.key}-${index}`}
                style={{ borderTop: "1px solid rgba(148,163,184,0.15)" }}
              >
                {row.showCategory ? (
                  <td
                    rowSpan={row.span}
                    style={{
                      padding: "10px 12px",
                      fontWeight: 600,
                      verticalAlign: "top",
                    }}
                  >
                    {row.category}
                    <div style={{ fontSize: 12, opacity: 0.65 }}>
                      {row.total?.toLocaleString()} total
                    </div>
                  </td>
                ) : null}
                <td
                  style={{
                    padding: "10px 12px",
                    textTransform: "capitalize",
                  }}
                >
                  {formatKey(row.key)}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {Math.floor(row.value).toLocaleString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
