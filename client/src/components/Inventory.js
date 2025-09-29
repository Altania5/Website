import React, { useEffect, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const Inventory = () => {
  const [inv, setInv] = useState(null);
  const [alloc, setAlloc] = useState(0);
  const [queue, setQueue] = useState([]);

  const load = async () => {
    const token = localStorage.getItem("token") || "";
    const res = await axios.get("/api/game/state", { headers: { Authorization: `Bearer ${token}` } });
    setInv(res.data.game.inventory);
    setAlloc(res.data.game.energyAllocation?.craftingPct || 0);
    setQueue(res.data.game.craftingQueue || []);
  };

  useEffect(() => { load(); }, []);

  const saveAlloc = async () => {
    const token = localStorage.getItem("token") || "";
    await axios.post("/api/game/allocate-energy", { craftingPct: alloc }, { headers: { Authorization: `Bearer ${token}` } });
    alert("Saved");
  };

  const addJob = async (type, energyRequired) => {
    const token = localStorage.getItem("token") || "";
    await axios.post("/api/game/craft", { type, energyRequired }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const cancelJob = async (index) => {
    const token = localStorage.getItem("token") || "";
    await axios.post("/api/game/cancel-craft", { index }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  if (!inv) return null;

  const entries = Object.entries(inv);

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Inventory</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{k}</div>
            <div>{Math.floor(v)}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>Automation</h4>
        <div>Energy to crafting machines</div>
        <input type="range" min={0} max={100} value={alloc} onChange={(e) => setAlloc(Number(e.target.value))} /> {alloc}%
        <div>
          <button onClick={saveAlloc}>Save Allocation</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <h5 style={{ margin: 0 }}>Crafting Queue</h5>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => addJob("plastic", 200)}>Queue Plastic (200 energy)</button>
            <button onClick={() => addJob("glass", 200)}>Queue Glass (200 energy)</button>
            <button onClick={() => addJob("fuel", 500)}>Queue Fuel (500 energy)</button>
          </div>
          {/* Queue list */}
          <div style={{ marginTop: 8 }}>
            {queue.length === 0 ? (
              <div>No active jobs</div>
            ) : (
              queue.map((job, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1f2937", borderRadius: 6, padding: "6px 10px", marginBottom: 6 }}>
                  <div>
                    <strong>{job.type}</strong> — remaining energy: {Math.ceil(job.remainingEnergy)}
                  </div>
                  <button onClick={() => cancelJob(i)}>Cancel</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;


