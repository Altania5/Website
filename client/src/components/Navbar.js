import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects">Projects</NavLink>
          </li>
          <li>
            <NavLink to="/about">About Me</NavLink>
          </li>
          <li>
            <NavLink to="/altania">Altania</NavLink>
          </li>
          <li>
            <a href="/#skills">Skills</a>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>
        </ul>
        <div className="animated-line"></div>
      </div>
    </nav>
  );
};

export default Navbar;
