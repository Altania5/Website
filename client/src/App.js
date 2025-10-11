import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Projects from "./components/Projects";
import About from "./components/About";
import Altania from "./components/Altania";
import Login from "./components/Login";
import RequireAuth from "./components/RequireAuth";
import PortalLayout from "./components/PortalLayout";
import Dashboard from "./components/Dashboard";
import RequireRole from "./components/RequireRole";
import AdminLayout from "./components/AdminLayout";
import AdminHome from "./components/AdminHome";
import IdleGame from "./components/IdleGame";
import GalaxyMap from "./components/GalaxyMap";
import Military from "./components/Military";
import Inventory from "./components/Inventory";
import GameSettings from "./components/GameSettings";
import PortalHome from "./components/PortalHome";
import EnergyTab from "./components/EnergyTab";
import FrequencyTab from "./components/FrequencyTab";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/altania" element={<Altania />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/portal"
            element={
              <RequireAuth>
                <PortalLayout>
                  <Dashboard />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/home"
            element={
              <RequireAuth>
                <PortalLayout>
                  <PortalHome />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/energy"
            element={
              <RequireAuth>
                <PortalLayout>
                  <EnergyTab />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/frequency"
            element={
              <RequireAuth>
                <PortalLayout>
                  <FrequencyTab />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/game"
            element={
              <RequireAuth>
                <PortalLayout>
                  <IdleGame />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/map"
            element={
              <RequireAuth>
                <PortalLayout>
                  <GalaxyMap />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/military"
            element={
              <RequireAuth>
                <PortalLayout>
                  <Military />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/inventory"
            element={
              <RequireAuth>
                <PortalLayout>
                  <Inventory />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/portal/settings"
            element={
              <RequireAuth>
                <PortalLayout>
                  <GameSettings />
                </PortalLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              </RequireRole>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
