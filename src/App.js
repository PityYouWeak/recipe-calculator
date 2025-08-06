import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Package, DollarSign, TrendingUp, Save, Download } from 'lucide-react';
import './App.css';

const RecipeCostCalculator = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState({
    name: '',
    ingredients: [],
    laborHours: 0,
    laborRate: 15,
    overheadPercent: 10,
    markupPercent: 50,
    wastePercent: 5
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    setInventory(savedInventory);
    setRecipes(savedRecipes);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  const addInventoryItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      unit: 'oz',
      cost: 0,
      category: 'ingredients'
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (id, field, value) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteInventoryItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const addIngredientToRecipe = (inventoryItem) => {
    const existingIngredient = currentRecipe.ingredients.find(ing => ing.id === inventoryItem.id);
    if (!existingIngredient) {
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: [...currentRecipe.ingredients, {
          ...inventoryItem,
          quantity: 1
        }]
      });
    }
  };

  const updateRecipeIngredient = (id, field, value) => {
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.map(ing =>
        ing.id === id ? { ...ing, [field]: parseFloat(value) || 0 } : ing
      )
    });
  };

  const removeRecipeIngredient = (id) => {
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id)
    });
  };

  const calculateRecipeCost = () => {
    const ingredientCost = currentRecipe.ingredients.reduce((total, ing) => {
      return total + (ing.cost * ing.quantity);
    }, 0);

    const wasteAdjustedCost = ingredientCost * (1 + currentRecipe.wastePercent / 100);
    const laborCost = currentRecipe.laborHours * currentRecipe.laborRate;
    const baseCost = wasteAdjustedCost + laborCost;
    const overheadCost = baseCost * (currentRecipe.overheadPercent / 100);
    const totalCost = baseCost + overheadCost;
    const sellingPrice = totalCost * (1 + currentRecipe.markupPercent / 100);
    const profit = sellingPrice - totalCost;

    return {
      ingredientCost,
      wasteAdjustedCost,
      laborCost,
      overheadCost,
      totalCost,
      sellingPrice,
      profit,
      profitMargin: (profit / sellingPrice) * 100
    };
  };

  const saveRecipe = () => {
    if (!currentRecipe.name.trim()) {
      alert('Please enter a recipe name');
      return;
    }
    
    const recipeToSave = {
      ...currentRecipe,
      id: currentRecipe.id || Date.now(),
      createdAt: new Date().toISOString(),
      cost: calculateRecipeCost()
    };

    const existingIndex = recipes.findIndex(r => r.id === recipeToSave.id);
    if (existingIndex >= 0) {
      setRecipes(recipes.map((r, i) => i === existingIndex ? recipeToSave : r));
    } else {
      setRecipes([...recipes, recipeToSave]);
    }

    // Reset current recipe
    setCurrentRecipe({
      name: '',
      ingredients: [],
      laborHours: 0,
      laborRate: 15,
      overheadPercent: 10,
      markupPercent: 50,
      wastePercent: 5
    });

    alert('Recipe saved successfully!');
  };

  const loadRecipe = (recipe) => {
    setCurrentRecipe(recipe);
    setActiveTab('recipes');
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const exportData = () => {
    const data = { inventory, recipes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-cost-data.json';
    a.click();
  };

  const costs = calculateRecipeCost();

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-title">
            <Calculator className="header-icon" />
            <h1>Recipe Cost Calculator</h1>
          </div>
          <button onClick={exportData} className="btn btn-success">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-container">
        <div className="nav-tabs">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'recipes', label: 'Recipe Builder', icon: Calculator },
            { id: 'saved', label: 'Saved Recipes', icon: Save },
            { id: 'analytics', label: 'Cost Analysis', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="content-container">
        {/* Help Section */}
        <div className="help-section">
          <h3 className="help-title">💡 Cost Calculation Guide</h3>
          <div className="help-grid">
            <div className="help-card">
              <h4>Overhead Costs</h4>
              <p>Fixed business expenses like rent, utilities, insurance, equipment depreciation. Typically 10-20% for small businesses.</p>
            </div>
            <div className="help-card">
              <h4>Waste Factor</h4>
              <p>Account for spillage, trimming, spoilage, or measurement errors during production. Usually 3-10% depending on process.</p>
            </div>
            <div className="help-card">
              <h4>Markup %</h4>
              <p>Your desired profit margin. Food businesses typically use 50-200% markup depending on market and positioning.</p>
            </div>
          </div>
        </div>

        {activeTab === 'inventory' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Inventory Management</h2>
              <button onClick={addInventoryItem} className="btn btn-primary">
                <Plus size={16} />
                <span>Add Item</span>
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
                          onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                          placeholder="Item name"
                          className="form-input"
                        />
                      </td>
                      <td>
                        <select
                          value={item.unit}
                          onChange={(e) => updateInventoryItem(item.id, 'unit', e.target.value)}
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
                          <DollarSign className="icon" />
                          <input
                            type="number"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => updateInventoryItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="form-input"
                          />
                        </div>
                      </td>
                      <td>
                        <select
                          value={item.category}
                          onChange={(e) => updateInventoryItem(item.id, 'category', e.target.value)}
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
        )}

        {activeTab === 'recipes' && (
          <div className="grid grid-lg-3">
            {/* Recipe Builder */}
            <div className="card lg-col-span-2">
              <h2 className="card-title">Recipe Builder</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Recipe Name</label>
                  <input
                    type="text"
                    value={currentRecipe.name}
                    onChange={(e) => setCurrentRecipe({...currentRecipe, name: e.target.value})}
                    placeholder="Enter recipe name"
                    className="form-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Labor Hours</label>
                    <input
                      type="number"
                      step="0.25"
                      value={currentRecipe.laborHours}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, laborHours: parseFloat(e.target.value) || 0})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Labor Rate ($/hr)</label>
                    <input
                      type="number"
                      step="0.50"
                      value={currentRecipe.laborRate}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, laborRate: parseFloat(e.target.value) || 0})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Overhead %</label>
                    <p className="form-help">Fixed costs: rent, utilities, insurance, equipment</p>
                    <input
                      type="number"
                      step="1"
                      value={currentRecipe.overheadPercent}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, overheadPercent: parseFloat(e.target.value) || 0})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Markup %</label>
                    <p className="form-help">Profit margin added to total cost</p>
                    <input
                      type="number"
                      step="1"
                      value={currentRecipe.markupPercent}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, markupPercent: parseFloat(e.target.value) || 0})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Waste %</label>
                    <p className="form-help">Spillage, trimming, spoilage during production</p>
                    <input
                      type="number"
                      step="1"
                      value={currentRecipe.wastePercent}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, wastePercent: parseFloat(e.target.value) || 0})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>Add Ingredients</h3>
                  <div className="ingredient-list">
                    {inventory.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addIngredientToRecipe(item)}
                        className="ingredient-button"
                      >
                        <div className="ingredient-name">{item.name}</div>
                        <div className="ingredient-price">${item.cost.toFixed(2)} per {item.unit}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>Recipe Ingredients</h3>
                  <div>
                    {currentRecipe.ingredients.map(ing => (
                      <div key={ing.id} className="recipe-ingredient">
                        <div className="recipe-ingredient-info">
                          <div className="ingredient-name">{ing.name}</div>
                          <div className="ingredient-price">${ing.cost.toFixed(2)} per {ing.unit}</div>
                        </div>
                        <div className="recipe-ingredient-controls">
                          <input
                            type="number"
                            step="0.1"
                            value={ing.quantity}
                            onChange={(e) => updateRecipeIngredient(ing.id, 'quantity', e.target.value)}
                            className="quantity-input"
                          />
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{ing.unit}</span>
                          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', minWidth: '4rem' }}>
                            ${(ing.cost * ing.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeRecipeIngredient(ing.id)}
                            className="btn btn-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={saveRecipe} className="btn btn-primary btn-full">
                  <Save size={20} />
                  <span>Save Recipe</span>
                </button>
              </div>
            </div>

            {/* Cost Calculation */}
            <div className="cost-breakdown">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1.5rem' }}>Cost Breakdown</h3>
              
              <div>
                <div className="cost-item">
                  <span className="cost-label">Raw Ingredients</span>
                  <span className="cost-value">${costs.ingredientCost.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">+ Waste ({currentRecipe.wastePercent}%)</span>
                  <span className="cost-value">${(costs.wasteAdjustedCost - costs.ingredientCost).toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">+ Labor Cost</span>
                  <span className="cost-value">${costs.laborCost.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">+ Overhead ({currentRecipe.overheadPercent}%)</span>
                  <span className="cost-value">${costs.overheadCost.toFixed(2)}</span>
                </div>
                <div className="cost-item total">
                  <span className="cost-label">Total Cost</span>
                  <span className="cost-value negative">${costs.totalCost.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">+ Markup ({currentRecipe.markupPercent}%)</span>
                  <span className="cost-value positive">${(costs.sellingPrice - costs.totalCost).toFixed(2)}</span>
                </div>
                <div className="cost-item final">
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1a1a1a' }}>Selling Price</span>
                  <span className="cost-value final">${costs.sellingPrice.toFixed(2)}</span>
                </div>
                <div className="profit-margin">
                  <div className="profit-margin-label">Profit Margin</div>
                  <div className="profit-margin-value">{costs.profitMargin.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="card">
            <h2 className="card-title">Saved Recipes</h2>
            
            <div className="recipe-grid">
              {recipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-card-header">
                    <h3 className="recipe-card-title">{recipe.name}</h3>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="btn btn-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="recipe-card-info">
                    <div className="recipe-card-info-row">
                      <span style={{ color: '#6b7280' }}>Total Cost:</span>
                      <span style={{ fontWeight: '500' }}>${recipe.cost.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="recipe-card-info-row">
                      <span style={{ color: '#6b7280' }}>Selling Price:</span>
                      <span style={{ fontWeight: '500', color: '#059669' }}>${recipe.cost.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="recipe-card-info-row">
                      <span style={{ color: '#6b7280' }}>Profit Margin:</span>
                      <span style={{ fontWeight: '500' }}>{recipe.cost.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="recipe-card-meta">
                      {recipe.ingredients.length} ingredients
                    </div>
                  </div>
                  
                  <button
                    onClick={() => loadRecipe(recipe)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Edit Recipe
                  </button>
                </div>
              ))}
            </div>
            
            {recipes.length === 0 && (
              <div className="empty-state">
                <Calculator className="empty-state-icon" />
                <p className="empty-state-text">No saved recipes yet. Create your first recipe!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card">
            <h2 className="card-title">Cost Analysis</h2>
            
            {recipes.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Recipe</th>
                      <th>Total Cost</th>
                      <th>Selling Price</th>
                      <th>Profit</th>
                      <th>Margin</th>
                      <th>Markup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map(recipe => (
                      <tr key={recipe.id}>
                        <td style={{ fontWeight: '500', color: '#1a1a1a' }}>{recipe.name}</td>
                        <td>${recipe.cost.totalCost.toFixed(2)}</td>
                        <td style={{ color: '#059669', fontWeight: '500' }}>${recipe.cost.sellingPrice.toFixed(2)}</td>
                        <td>${recipe.cost.profit.toFixed(2)}</td>
                        <td>{recipe.cost.profitMargin.toFixed(1)}%</td>
                        <td>{recipe.markupPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp className="empty-state-icon" />
                <p className="empty-state-text">No recipes to analyze yet. Create some recipes to see cost analytics!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCostCalculator;
                      