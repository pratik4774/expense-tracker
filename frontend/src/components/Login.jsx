 
import React, { useState } from "react";

export default function Login({ onLogin, switchToRegister, apiBase }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Login failed");
        return;
      }
      onLogin(data.user);
    } catch (error) {
      setErr("Network error");
    }
  }

  return (
    <div className="login-box card">
      <h2 className="header-small">Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="small-muted">{err}</div>}
        <div className="row">
          <button className="btn" type="submit">Login</button>
          <button type="button" className="btn secondary" onClick={switchToRegister}>Register</button>
        </div>
      </form>
    </div>
  );
}
