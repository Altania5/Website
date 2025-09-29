import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        setAuthorized(true);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
};

export default RequireAuth;


