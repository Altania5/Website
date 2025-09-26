import React, { useState } from "react";
import axios from "axios";
import "./Altania.css";

const Altania = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post("/api/auth/login", { username, password });
      if (response.data?.success) {
        setMessage({ type: "success", text: "Login successful!" });
      } else {
        setMessage({ type: "error", text: "Invalid username or password." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Login failed. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="altania">
      <header className="hero">
        <div className="container">
          <h1>Altania Login</h1>
          <p>Login for the Altania Database</p>
        </div>
      </header>
      <section className="container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={event => setUsername(event.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {message && (
            <p className={`message ${message.type}`}>{message.text}</p>
          )}
        </form>
      </section>
      <footer className="footer">
        <p>&copy; 2025 Alexander Konopelski</p>
      </footer>
    </div>
  );
};

export default Altania;
