import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import calculateRecipeCost from '../utils/RecipeCostCalculator';

// Simple POS view for cashiers: list recipes and a small order calculator
const CashierPOS = ({ user: initialUser }) => {
  const [recipes, setRecipes] = useState([]);
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState(initialUser || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // fetch current user from auth endpoint
      fetch('/api/auth', { method: 'GET', credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          // Only allow cashiers on this page
          if (data.user?.role === 'cashier') {
            setUser(data.user);
          } else if (data.user?.role === 'manager') {
            navigate('/app');
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null));
      return;
    }
    // If user role is manager, redirect to app
    if (user.role === 'manager') {
      navigate('/app');
      return;
    }
    const managerId = user?.role === 'cashier' ? user.manager_id : user?.id;
    if (!managerId) return;
    fetch(`/api/recipes-get?userId=${managerId}`)
      .then(r => r.json())
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]));
  }, [user, navigate]);

  const addRecipe = (r) => {
    const costs = calculateRecipeCost(r);
    const selling = costs.sellingPrice || 0;
    const item = { id: r.id, name: r.name || r.title || 'Recipe', price: selling };
    setOrder([...order, item]);
  };

  const subtotal = order.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const total = subtotal + (subtotal * (taxPercent / 100)) - Number(discount || 0);
  const [tendered, setTendered] = useState('');
  const change = Number(tendered || 0) - total;

  const handleLogout = () => {
    document.cookie = 'user_id=; Max-Age=0; Path=/;';
    navigate('/auth');
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="card-title">Cashier POS</h2>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '8px 12px', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: 6, 
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h3>Recipes</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {recipes.map(r => (
              <div key={r.id} className="recipe-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name || r.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>${calculateRecipeCost(r).sellingPrice.toFixed(2)}</div>
                </div>
                <button className="btn btn-primary" onClick={() => addRecipe(r)}>Add</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 360 }}>
          <h3>Order</h3>
          <div style={{ minHeight: 120, border: '1px solid #e5e7eb', padding: 8, borderRadius: 6 }}>
            {order.length === 0 && <div style={{ color: '#6b7280' }}>No items</div>}
            {order.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>{it.name}</div>
                <div>{Number(it.price || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><div>Subtotal</div><div>{subtotal.toFixed(2)}</div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div>Tax %</div>
              <input value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value||0))} style={{ width: 80 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div>Discount</div>
              <input value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: 80 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
              <div>Total</div>
              <div>{Number(total || 0).toFixed(2)}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 6 }}>Tendered</div>
              <input value={tendered} onChange={e => setTendered(e.target.value)} style={{ width: '100%' }} />
              <div style={{ marginTop: 8 }}>Change: {Number(change || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierPOS;
