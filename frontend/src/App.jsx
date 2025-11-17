 
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [view, setView] = useState("login"); // "login" | "register" | "dashboard"

  useEffect(() => {
    if (user) {
      setView("dashboard");
    } else {
      setView("login");
    }
  }, [user]);

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }
  function handleLogout() {
    setUser(null);
    localStorage.removeItem("user");
    setView("login");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        {user && <button className="btn small" onClick={handleLogout}>Logout</button>}
      </header>

      <main className="container">
        {!user && view === "login" && (
          <>
            <Login onLogin={handleLogin} switchToRegister={() => setView("register")} apiBase={API_BASE}/>
          </>
        )}

        {!user && view === "register" && (
          <Register switchToLogin={() => setView("login")} apiBase={API_BASE}/>
        )}

        {user && (
          <Dashboard user={user} apiBase={API_BASE} onUpdateUser={handleLogin} />
        )}
      </main>
    </div>
  );
}
