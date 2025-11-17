 
import React from "react";

export default function TransactionList({ transactions, onDelete }) {
  return (
    <div className="card">
      <h3>Transactions</h3>
      <div className="tx-list">
        {transactions.length === 0 && <div className="small-muted">No transactions yet.</div>}
        {transactions.map(tx => (
          <div key={tx.id} className="tx-item">
            <div>
              <div><strong className={`tx-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>{tx.type === 'income' ? '+' : '-'} ₹{Number(tx.amount).toFixed(2)}</strong></div>
              <div className="small-muted">{tx.category} • {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}</div>
              {tx.note && <div className="notes">{tx.note}</div>}
            </div>
            <div className="actions">
              <button className="btn small secondary" onClick={()=> onDelete(tx.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
