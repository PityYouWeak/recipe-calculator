
import React from 'react';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';

import './RecipeBuilder.css';

const RecipeBuilder = ({
  currentRecipe,
  setCurrentRecipe,
  inventory,
  addIngredientToRecipe,
  updateRecipeIngredient,
  removeRecipeIngredient,
  saveRecipe
}) => {
  return (
    <div className="card lg-col-span-2">
      <h2 className="card-title">Recipe Builder</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          saveRecipe();
        }}
        className="recipe-form"
      >
        <div className="form-group">
          <label>Recipe Name</label>
          <input
            type="text"
            value={currentRecipe.name}
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, name: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label>Labor Hours</label>
          <input
            type="number"
            value={currentRecipe.laborHours}
            min="0"
            step="0.1"
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, laborHours: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="form-group">
          <label>Labor Rate</label>
          <input
            type="number"
            value={currentRecipe.laborRate}
            min="0"
            step="0.01"
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, laborRate: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="form-group">
          <label>Overhead (%)</label>
          <input
            type="number"
            value={currentRecipe.overheadPercent}
            min="0"
            step="0.01"
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, overheadPercent: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="form-group">
          <label>Markup (%)</label>
          <input
            type="number"
            value={currentRecipe.markupPercent}
            min="0"
            step="0.01"
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, markupPercent: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="form-group">
          <label>Waste (%)</label>
          <input
            type="number"
            value={currentRecipe.wastePercent}
            min="0"
            step="0.01"
            onChange={e => setCurrentRecipe(new Recipe({ ...currentRecipe, wastePercent: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <button type="submit" className="btn btn-primary">Save Recipe</button>
      </form>

      <div className="ingredients-section">
        <h3>Ingredients</h3>
        <div className="ingredient-list">
          {currentRecipe.ingredients.length === 0 && <div>No ingredients added yet.</div>}
          {currentRecipe.ingredients.map(ingredient => (
            <div key={ingredient.id} className="ingredient-row">
              <span>{ingredient.name}</span>
              <input
                type="number"
                value={ingredient.quantity}
                min="0"
                step="0.01"
                onChange={e => updateRecipeIngredient(ingredient.id, 'quantity', e.target.value)}
              />
              <span>{ingredient.unit}</span>
              <button type="button" className="btn btn-danger" onClick={() => removeRecipeIngredient(ingredient.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="add-ingredient-section">
          <h4>Add Ingredient from Inventory</h4>
          <select
            onChange={e => {
              const itemId = parseInt(e.target.value);
              const item = inventory.find(i => i.id === itemId);
              if (item) addIngredientToRecipe(item);
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>Select ingredient</option>
            {inventory.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipeBuilder;
