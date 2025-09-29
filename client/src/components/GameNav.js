import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle = { marginRight: 12 };

const GameNav = () => {
  return (
    <div style={{ marginBottom: 12 }}>
      <NavLink to="/portal/home" style={linkStyle}>Home</NavLink>
      <NavLink to="/portal/frequency" style={linkStyle}>Energy</NavLink>
      <NavLink to="/portal/map" style={linkStyle}>Map</NavLink>
      <NavLink to="/portal/military" style={linkStyle}>Military</NavLink>
      <NavLink to="/portal/inventory" style={linkStyle}>Inventory</NavLink>
      <NavLink to="/portal/settings" style={linkStyle}>Settings</NavLink>
    </div>
  );
};

export default GameNav;


