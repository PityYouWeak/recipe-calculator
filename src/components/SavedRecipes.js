import React from 'react';
import Recipe from '../models/Recipe';

const SavedRecipes = ({ recipes, loadRecipe, deleteRecipe }) => {
  return (
    <div className="card">
      <h2 className="card-title">Saved Recipes</h2>
      {/* ...existing saved recipes logic... */}
      {/* Move the saved recipes rendering from App.js here for OOP separation */}
    </div>
  );
};

export default SavedRecipes;
