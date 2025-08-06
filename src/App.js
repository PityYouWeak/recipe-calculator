

import React from 'react';
import { Calculator, Package, Save, TrendingUp, Download } from 'lucide-react';
import InventoryManager from './components/InventoryManager';
import RecipeBuilder from './components/RecipeBuilder';
import SavedRecipes from './components/SavedRecipes';
import CostAnalysis from './components/CostAnalysis';
import HelpSection from './components/HelpSection';
import InventoryItem from './models/InventoryItem';
import Recipe from './models/Recipe';
import Ingredient from './models/Ingredient';
import './App.css'; // Assuming you have a CSS file for styles

const RecipeCostCalculator = () => {
  const [activeTab, setActiveTab] = React.useState('inventory');
  const [inventory, setInventory] = React.useState([]);
  const [recipes, setRecipes] = React.useState([]);
  const [currentRecipe, setCurrentRecipe] = React.useState(new Recipe({
    name: '',
    ingredients: [],
    laborHours: 0,
    laborRate: 15,
    overheadPercent: 10,
    markupPercent: 50,
    wastePercent: 5
  }));

  React.useEffect(() => {
    const savedInventory = JSON.parse(localStorage.getItem('inventory') || '[]').map(item => new InventoryItem(item));
    const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]').map(recipe => new Recipe(recipe));
    setInventory(savedInventory);
    setRecipes(savedRecipes);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  React.useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  const addInventoryItem = () => {
    const newItem = new InventoryItem({
      id: Date.now(),
      name: '',
      unit: 'oz',
      cost: 0,
      category: 'ingredients'
    });
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (id, field, value) => {
    setInventory(inventory.map(item => 
      item.id === id ? new InventoryItem({ ...item, [field]: value }) : item
    ));
  };

  const deleteInventoryItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const addIngredientToRecipe = (inventoryItem) => {
    const existingIngredient = currentRecipe.ingredients.find(ing => ing.id === inventoryItem.id);
    if (!existingIngredient) {
      setCurrentRecipe(new Recipe({
        ...currentRecipe,
        ingredients: [...currentRecipe.ingredients, new Ingredient({ ...inventoryItem, quantity: 1 })]
      }));
    }
  };

  const updateRecipeIngredient = (id, field, value) => {
    setCurrentRecipe(new Recipe({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.map(ing =>
        ing.id === id ? new Ingredient({ ...ing, [field]: parseFloat(value) || 0 }) : ing
      )
    }));
  };

  const removeRecipeIngredient = (id) => {
    setCurrentRecipe(new Recipe({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const saveRecipe = () => {
    if (!currentRecipe.name.trim()) {
      alert('Please enter a recipe name');
      return;
    }
    const recipeToSave = new Recipe({
      ...currentRecipe,
      id: currentRecipe.id || Date.now(),
      createdAt: new Date().toISOString()
    });
    const existingIndex = recipes.findIndex(r => r.id === recipeToSave.id);
    if (existingIndex >= 0) {
      setRecipes(recipes.map((r, i) => i === existingIndex ? recipeToSave : r));
    } else {
      setRecipes([...recipes, recipeToSave]);
    }
    setCurrentRecipe(new Recipe({
      name: '',
      ingredients: [],
      laborHours: 0,
      laborRate: 15,
      overheadPercent: 10,
      markupPercent: 50,
      wastePercent: 5
    }));
    alert('Recipe saved successfully!');
  };

  const loadRecipe = (recipe) => {
    setCurrentRecipe(new Recipe(recipe));
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

  const costs = currentRecipe.calculateCost();

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
        <HelpSection />
        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            addInventoryItem={addInventoryItem}
            updateInventoryItem={updateInventoryItem}
            deleteInventoryItem={deleteInventoryItem}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipeBuilder
            currentRecipe={currentRecipe}
            setCurrentRecipe={setCurrentRecipe}
            inventory={inventory}
            addIngredientToRecipe={addIngredientToRecipe}
            updateRecipeIngredient={updateRecipeIngredient}
            removeRecipeIngredient={removeRecipeIngredient}
            saveRecipe={saveRecipe}
          />
        )}
        {activeTab === 'saved' && (
          <SavedRecipes
            recipes={recipes}
            loadRecipe={loadRecipe}
            deleteRecipe={deleteRecipe}
          />
        )}
        {activeTab === 'analytics' && (
          <CostAnalysis recipes={recipes} />
        )}
      </div>
    </div>
  );
};

export default RecipeCostCalculator;
                      