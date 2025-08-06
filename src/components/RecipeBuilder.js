
import React from 'react';
import { Save, Trash2 } from 'lucide-react';
import HelpSection from './HelpSection';
const RecipeBuilder = ({
  currentRecipe,
  setCurrentRecipe,
  inventory,
  addIngredientToRecipe,
  updateRecipeIngredient,
  removeRecipeIngredient,
  saveRecipe,
  costs
}) => {
  return (
    <div>
      <HelpSection />
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
    </div>
  );
};

export default RecipeBuilder;