import React from "react";
import Navbar from "./Navbar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main>{children}</main>
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">◆ Altanian Industries</div>
          <div className="footer__note">
            Built with curiosity, persistence, and plenty of caffeine.
          </div>
          <div className="footer__copyright">
            © {new Date().getFullYear()} Alexander Konopelski. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

