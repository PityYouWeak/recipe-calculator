import React, { useState, useEffect } from 'react';

import { Calculator, Package, TrendingUp, Save, Download } from 'lucide-react';

import './App.css';

import InventoryManager from './components/InventoryManager';
import RecipeBuilder from './components/RecipeBuilder';
import SavedRecipes from './components/SavedRecipes';
import CostAnalysis from './components/CostAnalysis';

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
            costs={costs}
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
                      