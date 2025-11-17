 
import React, { useState } from "react";

export default function Register({ switchToLogin, apiBase }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, password })
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg(d.error || "Registration failed");
        return;
      }
      setMsg("Registered. Please login.");
      setTimeout(()=> switchToLogin(), 900);
    } catch (err) {
      setMsg("Network error");
    }
  }

  return (
    <div className="login-box card">
      <h2 className="header-small">Register</h2>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {msg && <div className="small-muted">{msg}</div>}
        <div className="row">
          <button className="btn" type="submit">Create account</button>
          <button type="button" className="btn secondary" onClick={switchToLogin}>Back to login</button>
        </div>
      </form>
    </div>
  );
}
