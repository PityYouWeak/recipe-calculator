import React from 'react';
import InventoryItem from '../models/InventoryItem';

const InventoryManager = ({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Inventory Management</h2>
        <button onClick={addInventoryItem} className="btn btn-primary">
          Add Item
        </button>
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
                  <input
                    type="number"
                    step="0.01"
                    value={item.cost}
                    onChange={e => updateInventoryItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
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
                  <button onClick={() => deleteInventoryItem(item.id)} className="btn btn-danger">
                    Delete
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
