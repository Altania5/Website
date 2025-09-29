import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(Boolean(token));
    const onStorage = () => setLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <div className="navbar__logo">◆</div>
          <div className="navbar__identity">
            <span className="navbar__name">Alexander Konopelski</span>
            <span className="navbar__role">Software Engineer</span>
          </div>
        </div>
        <nav className="navbar__links">
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
          {loggedIn ? <NavLink to="/portal">Dashboard</NavLink> : <NavLink to="/login">Login</NavLink>}
          {/* Optionally show Admin link if token exists; page guard enforces actual access */}
          {loggedIn ? <NavLink to="/admin">Admin</NavLink> : null}
          <a href="/#resume">Résumé</a>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
