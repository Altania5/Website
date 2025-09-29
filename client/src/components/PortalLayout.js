import React from "react";

const PortalLayout = ({ children }) => {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f1a", color: "#fff" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Portal</div>
        <button onClick={logout} style={{ background: "#1e293b", color: "#fff", border: 0, padding: "8px 12px", borderRadius: 6 }}>Logout</button>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
};

export default PortalLayout;


