 
import React, { useState } from "react";

export default function AddTransaction({ onAdd, onTopUp }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [note, setNote] = useState("");

  function reset() {
    setAmount(""); setCategory("general"); setNote(""); setType("expense");
  }

  async function submit(e) {
    e.preventDefault();
    if (!amount || isNaN(amount)) return alert("Valid amount required");
    await onAdd({ amount: parseFloat(amount), type, category, note });
    reset();
  }

  async function topUp(e) {
    e.preventDefault();
    if (!amount || isNaN(amount)) return alert("Valid amount required");
    await onTopUp(parseFloat(amount));
    reset();
  }

  return (
    <div className="card">
      <h3>Add transaction</h3>
      <form onSubmit={submit}>
        <label>Type</label>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <label>Amount</label>
        <input value={amount} onChange={e=>setAmount(e.target.value)} />

        <label>Category</label>
        <input value={category} onChange={e=>setCategory(e.target.value)} />

        <label>Note</label>
        <input value={note} onChange={e=>setNote(e.target.value)} />

        <div className="row" style={{marginTop:10}}>
          <button className="btn" type="submit">Add</button>
          {/* <button className="btn secondary" onClick={topUp}>Add Money (Top-up)</button> */}
        </div>
      </form>
    </div>
  );
}
