import type { JSX } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import HelpwiseHome from "./pages/HelpwiseHome";
import Enrolled from "./pages/Enrolled";
import ClassDetail from "./pages/ClassDetail";
import ProtectedRoute from "./auth/ProtectedRoute";

function Loading() {
  return <div style={{ padding: 24 }}>Loading…</div>;
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;

  if (user) {
    const back = (location.state as any)?.from?.pathname || "/helpwise";
    return <Navigate to={back} replace />;
  }
  return children;
}

function Shell({ children }: { children: JSX.Element }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Shell><Home /></Shell>} />

      <Route
        path="/login"
        element={
          <Shell>
            <GuestOnly>
              <Login />
            </GuestOnly>
          </Shell>
        }
      />
      <Route
        path="/signup"
        element={
          <Shell>
            <GuestOnly>
              <Signup />
            </GuestOnly>
          </Shell>
        }
      />

      <Route
        path="/helpwise"
        element={
          <Shell>
            <ProtectedRoute>
              <HelpwiseHome />
            </ProtectedRoute>
          </Shell>
        }
      />
      <Route
        path="/enrolled"
        element={
          <Shell>
            <ProtectedRoute>
              <Enrolled />
            </ProtectedRoute>
          </Shell>
        }
      />
      <Route
        path="/class/:code"   
        element={
          <Shell>
            <ProtectedRoute>
              <ClassDetail />
            </ProtectedRoute>
          </Shell>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
