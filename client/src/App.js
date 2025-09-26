import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import About from "./components/About";
import Altania from "./components/Altania";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/altania" element={<Altania />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
