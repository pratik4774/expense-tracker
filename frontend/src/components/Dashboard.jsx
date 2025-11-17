 
import React, { useEffect, useState } from "react";
import AddTransaction from "./AddTransaction";
import TransactionList from "./TransactionList";

export default function Dashboard({ user, apiBase, onUpdateUser }) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(user.balance || 0);
  const userId = user.id;

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
    // eslint-disable-next-line
  }, []);

  async function fetchTransactions() {
    const res = await fetch(`${apiBase}/api/transactions?userId=${userId}`);
    const d = await res.json();
    if (res.ok) setTransactions(d.transactions || []);
  }

  async function fetchBalance() {
    const res = await fetch(`${apiBase}/api/balance?userId=${userId}`);
    const d = await res.json();
    if (res.ok) {
      setBalance(d.balance);
      onUpdateUser({ ...user, balance: d.balance });
    }
  }

  async function addTransaction(tx) {
    const res = await fetch(`${apiBase}/api/transactions`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ ...tx, userId })
    });
    const d = await res.json();
    if (res.ok) {
      setTransactions(prev => [d.transaction, ...prev]);
      setBalance(d.balance);
      onUpdateUser({ ...user, balance: d.balance });
    } else {
      alert(d.error || "Failed");
    }
  }

  async function deleteTransaction(txId) {
    const res = await fetch(`${apiBase}/api/transactions`, {
      method: "DELETE",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ txId, userId })
    });
    const d = await res.json();
    if (res.ok) {
      setTransactions(prev => prev.filter(t => t.id !== txId));
      setBalance(d.balance);
      onUpdateUser({ ...user, balance: d.balance });
    } else alert(d.error || "Delete failed");
  }

  async function topUp(amount) {
    const res = await fetch(`${apiBase}/api/balance`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ userId, amount })
    });
    const d = await res.json();
    if (res.ok) {
      setBalance(d.balance);
      onUpdateUser({ ...user, balance: d.balance });
    } else alert(d.error || "Top-up failed");
  }

  return (
    <div>
      <div className="top-stats">
        <div className="stat card">
          <div className="small-muted">Hello</div>
          <div style={{fontSize:20,fontWeight:700}}>{user.name}</div>
        </div>
        <div className="stat card">
          <div className="small-muted">Balance</div>
          <div style={{fontSize:20,fontWeight:700}}>₹ {balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <AddTransaction onAdd={addTransaction} onTopUp={topUp} />
        </div>
        <div className="col">
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </div>
      </div>
    </div>
  );
}
