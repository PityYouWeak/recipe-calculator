import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import calculateRecipeCost from '../utils/RecipeCostCalculator';

const CostAnalysis = ({ user }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/recipes-get?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]));
  }, [user]);

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
              {recipes.map(recipe => {
                const cost = calculateRecipeCost(recipe);
                return (
                  <tr key={recipe.id}>
                    <td style={{ fontWeight: '500', color: '#1a1a1a' }}>{recipe.name}</td>
                    <td>${cost.totalCost.toFixed(2)}</td>
                    <td style={{ color: '#059669', fontWeight: '500' }}>${cost.sellingPrice.toFixed(2)}</td>
                    <td>${(cost.sellingPrice - cost.totalCost).toFixed(2)}</td>
                    <td>{cost.profitMargin.toFixed(1)}%</td>
                    <td>{(recipe.markupPercent ?? recipe.markup_percent ?? 0)}%</td>
                  </tr>
                );
              })}
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
