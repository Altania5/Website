import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      window.location.href = "/portal";
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    setError("");
    try {
      const res = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
      });
      alert(`Logged in as ${res.data.user.email}`);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch profile");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {token ? (
        <div style={{ marginTop: 16 }}>
          <button onClick={fetchMe}>Check Profile</button>
        </div>
      ) : null}
      {error ? (
        <div style={{ marginTop: 12, color: "#b00020" }}>{error}</div>
      ) : null}
    </div>
  );
};

export default Login;


