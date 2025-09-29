import React, { useEffect, useState } from "react";
import GameNav from "./GameNav";
import axios from "axios";

const Military = () => {
  const [fleet, setFleet] = useState({ mainShips: 0, commShips: 0, surveillanceShips: 0, supportWings: 0, alexandriteArmy: { count: 0, level: 1 }, topazTroopers: { count: 0, level: 1 } });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/game/state", { headers: { Authorization: `Bearer ${token}` } });
        setFleet(res.data.game.fleet || fleet);
      } catch {}
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token") || "";
      await axios.post("/api/game/save-fleet", fleet, { headers: { Authorization: `Bearer ${token}` } });
      alert("Saved");
    } catch (e) {
      alert(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const num = (v) => Math.max(0, Number(v || 0));

  return (
    <div style={{ color: "#e2e8f0" }}>
      <GameNav />
      <h3>Military</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Nambulite Navy</h4>
          <label>Main Ships</label>
          <input type="number" value={fleet.mainShips} onChange={(e) => setFleet({ ...fleet, mainShips: num(e.target.value) })} />
          <label>Communication Ships</label>
          <input type="number" value={fleet.commShips} onChange={(e) => setFleet({ ...fleet, commShips: num(e.target.value) })} />
          <label>Surveillance Ships</label>
          <input type="number" value={fleet.surveillanceShips} onChange={(e) => setFleet({ ...fleet, surveillanceShips: num(e.target.value) })} />
          <label>Support Wings</label>
          <input type="number" value={fleet.supportWings} onChange={(e) => setFleet({ ...fleet, supportWings: num(e.target.value) })} />
        </div>
        <div style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Alexandrite Army</h4>
          <label>Count</label>
          <input type="number" value={fleet.alexandriteArmy.count} onChange={(e) => setFleet({ ...fleet, alexandriteArmy: { ...fleet.alexandriteArmy, count: num(e.target.value) } })} />
          <label>Level</label>
          <input type="number" value={fleet.alexandriteArmy.level} onChange={(e) => setFleet({ ...fleet, alexandriteArmy: { ...fleet.alexandriteArmy, level: num(e.target.value) } })} />
          <h4>Topaz Troopers</h4>
          <label>Count</label>
          <input type="number" value={fleet.topazTroopers.count} onChange={(e) => setFleet({ ...fleet, topazTroopers: { ...fleet.topazTroopers, count: num(e.target.value) } })} />
          <label>Level</label>
          <input type="number" value={fleet.topazTroopers.level} onChange={(e) => setFleet({ ...fleet, topazTroopers: { ...fleet.topazTroopers, level: num(e.target.value) } })} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Configuration"}</button>
      </div>
    </div>
  );
};

export default Military;


