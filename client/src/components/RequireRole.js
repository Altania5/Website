import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const RequireRole = ({ role, children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const roles = res.data?.user?.roles || [];
        setAuthorized(roles.includes(role));
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  if (loading) return null;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
};

export default RequireRole;


