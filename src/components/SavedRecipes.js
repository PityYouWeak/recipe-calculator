
import React from 'react';
import Recipe from '../models/Recipe';

import './SavedRecipes.css';

const SavedRecipes = ({ recipes, loadRecipe, deleteRecipe }) => {
  return (
    <div className="card">
      <h2 className="card-title">Saved Recipes</h2>
      {recipes.length === 0 ? (
        <div>No recipes saved yet.</div>
      ) : (
        <ul className="saved-recipes-list">
          {recipes.map(recipe => (
            <li key={recipe.id} className="saved-recipe-row">
              <span>{recipe.name}</span>
              <button className="btn btn-info" onClick={() => loadRecipe(recipe)}>
                Load
              </button>
              <button className="btn btn-danger" onClick={() => deleteRecipe(recipe.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedRecipes;
