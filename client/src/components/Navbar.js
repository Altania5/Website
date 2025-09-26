import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
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
          <a href="/#resume">Résumé</a>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
