import React, { useEffect, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

// Dynamic inventory categorization based on actual game mechanics
const categorizeItem = (key) => {
  // Refined items (created by Alexandrite Army boost)
  if (key.startsWith("refined")) {
    return "Refined Materials";
  }
  
  // Basic resources (from planet harvesting)
  const basicResources = ["stone", "iron", "copper", "altanerite", "alexandrite"];
  if (basicResources.includes(key)) {
    return "Basic Resources";
  }
  
  // Industrial materials (from gas/ice planets)
  const industrialMaterials = ["fuel", "plastic", "glass", "water"];
  if (industrialMaterials.includes(key)) {
    return "Industrial Materials";
  }
  
  // Precious materials (rare drops)
  const precious = ["gold", "silver", "diamond"];
  if (precious.includes(key)) {
    return "Precious Materials";
  }
  
  // Organic materials
  const organic = ["wood", "coal", "dirt", "clay", "rope"];
  if (organic.includes(key)) {
    return "Organic Materials";
  }
  
  // Special/rare items
  const special = ["lava", "miscComputerParts", "homainionite"];
  if (special.includes(key)) {
    return "Special Items";
  }
  
  // Default category for unknown items
  return "Other";
};

const formatKey = (key) => {
  if (key.startsWith("refined")) {
    const base = key.replace(/^refined/, "");
    return `Refined ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const Inventory = () => {
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const res = await axios.get("/api/game/state", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInv(res.data.game.inventory);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#e2e8f0" }}>
        <GameNav />
        <div>Loading inventory...</div>
      </div>
    );
  }

  if (!inv) {
    return (
      <div style={{ color: "#e2e8f0" }}>
        <GameNav />
        <div style={{ color: "#f87171" }}>Failed to load inventory</div>
      </div>
    );
  }

  // Group inventory items dynamically
  const grouped = Object.entries(inv)
    .filter(([key, value]) => value > 0) // Only show items with quantity > 0
    .map(([key, value]) => ({
      key,
      value: Number(value),
      category: categorizeItem(key),
    }))
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  // Sort categories by priority
  const categoryOrder = [
    "Basic Resources",
    "Industrial Materials", 
    "Refined Materials",
    "Precious Materials",
    "Organic Materials",
    "Special Items",
    "Other"
  ];

  const sortedCategories = categoryOrder.filter(cat => grouped[cat]?.length > 0);

  const totalUnits = Object.values(inv).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Inventory</h3>
        <button onClick={load} style={{ padding: "6px 12px" }}>
          Refresh
        </button>
      </div>
      
      <div style={{ marginBottom: 16, color: "rgba(226,232,240,0.8)" }}>
        Total Items: <strong>{Math.floor(totalUnits).toLocaleString()}</strong>
        {Object.keys(grouped).length > 0 && (
          <span style={{ marginLeft: 16 }}>
            Categories: <strong>{Object.keys(grouped).length}</strong>
          </span>
        )}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px 20px",
          color: "rgba(226,232,240,0.6)",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 12,
          background: "rgba(15,23,42,0.7)"
        }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Empty Inventory</div>
          <div>Visit planets and harvest resources to collect items!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {sortedCategories.map((category) => {
            const items = grouped[category];
            const categoryTotal = items.reduce((sum, item) => sum + item.value, 0);
            
            return (
              <div
                key={category}
                style={{
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 12,
                  background: "rgba(15,23,42,0.7)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "rgba(148,163,184,0.12)",
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(148,163,184,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{category}</h4>
                    <span style={{ fontSize: 12, color: "rgba(226,232,240,0.65)" }}>
                      {categoryTotal.toLocaleString()} items
                    </span>
                  </div>
                </div>
                
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gap: 8 }}>
                    {items
                      .sort((a, b) => b.value - a.value) // Sort by quantity descending
                      .map((item) => (
                        <div
                          key={item.key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: "rgba(148,163,184,0.08)",
                            border: "1px solid rgba(148,163,184,0.15)",
                            transition: "all 0.2s ease",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(148,163,184,0.12)";
                            e.target.style.borderColor = "rgba(148,163,184,0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(148,163,184,0.08)";
                            e.target.style.borderColor = "rgba(148,163,184,0.15)";
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>
                            {formatKey(item.key)}
                          </span>
                          <span style={{ 
                            color: "rgba(226,232,240,0.8)",
                            fontWeight: 600 
                          }}>
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
