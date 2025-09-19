import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'PHP', label: 'PHP (₱)' },
];

const InventoryManager = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem }) => {
  const [currency, setCurrency] = React.useState('USD');
  const currencySymbol = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', PHP: '₱'
  }[currency] || '$';

  // Handler for saving inventory to Neon DB
  const handleSaveInventory = async () => {
    try {
      const response = await fetch('/api/inventory-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory }),
      });
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Inventory saved!');
      } else {
        alert('Failed to save inventory.');
      }
    } catch (error) {
      alert('Error saving inventory.');
    }
  };
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Inventory Management</h2>
        <div className="inventory-header-controls">
          <label htmlFor="currency-select" style={{ fontWeight: 500 }}>Currency:</label>
          <select
            id="currency-select"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="form-input"
            style={{ minWidth: '100px' }}
          >
            {currencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={addInventoryItem} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Item</span>
          </button>
          <button onClick={handleSaveInventory} className="btn btn-success" style={{ marginLeft: '1rem' }}>
            <span>Save to Database</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Unit</th>
              <th>Cost per Unit</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateInventoryItem(item.id, 'name', e.target.value)}
                    placeholder="Item name"
                    className="form-input"
                  />
                </td>
                <td>
                  <select
                    value={item.unit}
                    onChange={e => updateInventoryItem(item.id, 'unit', e.target.value)}
                    className="form-input"
                  >
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="cup">cup</option>
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="piece">piece</option>
                  </select>
                </td>
                <td>
                  <div className="form-input-icon">
                    <span className="icon" style={{ marginRight: '0.5rem', color: '#6b7280' }}>{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.cost}
                      onChange={e => updateInventoryItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>
                </td>
                <td>
                  <select
                    value={item.category}
                    onChange={e => updateInventoryItem(item.id, 'category', e.target.value)}
                    className="form-input"
                  >
                    <option value="ingredients">Ingredients</option>
                    <option value="packaging">Packaging</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
