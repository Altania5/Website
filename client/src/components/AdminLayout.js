import React from "react";

const AdminLayout = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#fff" }}>
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ margin: 0 }}>Admin</h2>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
};

export default AdminLayout;


