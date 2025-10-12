import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  marginRight: 12,
  padding: "6px 12px",
  borderRadius: 8,
  fontWeight: 500,
  textDecoration: "none",
  color: isActive ? "#0f172a" : "#e2e8f0",
  background: isActive
    ? "linear-gradient(135deg, rgba(96,165,250,0.85), rgba(139,92,246,0.75))"
    : "rgba(15,23,42,0.6)",
  border: "1px solid rgba(148,163,184,0.35)",
  boxShadow: isActive ? "0 6px 14px rgba(79,70,229,0.25)" : "none",
  transition: "all 0.18s ease",
});

const GameNav = () => {
  return (
    <div
      style={{
        marginBottom: 20,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        padding: "8px 12px",
        background: "rgba(15, 23, 42, 0.6)",
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.2)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <NavLink to="/portal/home" style={linkStyle}>
        Home
      </NavLink>
      <NavLink to="/portal/energy" style={linkStyle}>
        Energy
      </NavLink>
      <NavLink to="/portal/frequency" style={linkStyle}>
        Frequency
      </NavLink>
      <NavLink to="/portal/map" style={linkStyle}>
        Map
      </NavLink>
      <NavLink to="/portal/military" style={linkStyle}>
        Military
      </NavLink>
      <NavLink to="/portal/inventory" style={linkStyle}>
        Inventory
      </NavLink>
      <NavLink to="/portal/game-v2" style={linkStyle}>
        WebGL Game
      </NavLink>
    </div>
  );
};

export default GameNav;
