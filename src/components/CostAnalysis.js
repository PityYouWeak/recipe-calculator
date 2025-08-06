import React from 'react';

import { TrendingUp } from 'lucide-react';

const CostAnalysis = ({ recipes }) => {
  return (
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
  );
};

export default CostAnalysis;
