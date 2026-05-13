import React, { useState } from 'react';

const CashierLogin = ({ onStartShift }) => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (!name.trim()) return setMessage('Please enter cashier name');
    // For now store cashier info in sessionStorage for the session
    const cashier = { name: name.trim(), employeeId: employeeId.trim(), startedAt: new Date().toISOString() };
    try {
      sessionStorage.setItem('cashier', JSON.stringify(cashier));
      setMessage(`Cashier ${cashier.name} signed in`);
      if (onStartShift) onStartShift(cashier);
    } catch {
      setMessage('Failed to start shift');
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Cashier Login</h2>
      <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="form-input"
          placeholder="Cashier name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Employee ID (optional)"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" type="submit">Start Shift</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setName(''); setEmployeeId(''); setMessage(''); }}>Clear</button>
        </div>
        {message && <div style={{ marginTop: 8 }}>{message}</div>}
      </form>
    </div>
  );
};

export default CashierLogin;
