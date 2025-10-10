
import React, { useEffect, useState } from 'react';
import { Calculator, Trash2 } from 'lucide-react';
import calculateRecipeCost from '../utils/RecipeCostCalculator';

const SavedRecipes = ({ user, loadRecipe, deleteRecipe }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    console.log('Fetching recipes for user:', user.id);
    fetch(`/api/recipes-get?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]));
  }, [user]);


  return (
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
                    {(() => {
                      const cost = calculateRecipeCost(recipe);
                      return <>
                        <div className="recipe-card-info-row">
                          <span style={{ color: '#6b7280' }}>Total Cost:</span>
                          <span style={{ fontWeight: '500' }}>${cost.totalCost.toFixed(2)}</span>
                        </div>
                        <div className="recipe-card-info-row">
                          <span style={{ color: '#6b7280' }}>Selling Price:</span>
                          <span style={{ fontWeight: '500', color: '#059669' }}>${cost.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="recipe-card-info-row">
                          <span style={{ color: '#6b7280' }}>Profit Margin:</span>
                          <span style={{ fontWeight: '500' }}>{cost.profitMargin.toFixed(1)}%</span>
                        </div>
                      </>;
                    })()}
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
  );
};

export default SavedRecipes;