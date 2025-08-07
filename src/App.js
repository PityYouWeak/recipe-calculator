
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import { Calculator, Package, TrendingUp, Save, Download } from 'lucide-react';

import './App.css';


import InventoryManagerComponent from './components/InventoryManager';
import RecipeBuilder from './components/RecipeBuilder';
import SavedRecipes from './components/SavedRecipes';
import CostAnalysis from './components/CostAnalysis';
import InventoryManager from './manager/InventoryManager';
import RecipeManager from './manager/RecipeManager';
import LandingPage from './components/LandingPage';


const MainApp = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryManager, setInventoryManager] = useState(() => InventoryManager.load());
  const [recipeManager, setRecipeManager] = useState(() => RecipeManager.load());
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
    inventoryManager.save();
  }, [inventoryManager]);

  useEffect(() => {
    recipeManager.save();
  }, [recipeManager]);

  const addInventoryItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      unit: 'oz',
      cost: 0,
      category: 'ingredients'
    };
    const updated = new InventoryManager([...inventoryManager.inventory]);
    updated.addItem(newItem);
    setInventoryManager(updated);
  };

  const updateInventoryItem = (id, field, value) => {
    const updated = new InventoryManager([...inventoryManager.inventory]);
    updated.updateItem(id, field, value);
    setInventoryManager(updated);
  };

  const deleteInventoryItem = (id) => {
    const updated = new InventoryManager([...inventoryManager.inventory]);
    updated.deleteItem(id);
    setInventoryManager(updated);
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

  const calculateRecipeCost = () => RecipeManager.calculateCost(currentRecipe);

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
    const updated = new RecipeManager([...recipeManager.recipes]);
    const existingIndex = updated.recipes.findIndex(r => r.id === recipeToSave.id);
    if (existingIndex >= 0) {
      updated.updateRecipe(recipeToSave.id, recipeToSave);
    } else {
      updated.addRecipe(recipeToSave);
    }
    setRecipeManager(updated);
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
    const updated = new RecipeManager([...recipeManager.recipes]);
    updated.deleteRecipe(id);
    setRecipeManager(updated);
  };

  const exportData = () => {
    const data = { inventory: inventoryManager.inventory, recipes: recipeManager.recipes };
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
            <InventoryManagerComponent
              inventory={inventoryManager.inventory}
              addInventoryItem={addInventoryItem}
              updateInventoryItem={updateInventoryItem}
              deleteInventoryItem={deleteInventoryItem}
          />
        )}

        {activeTab === 'recipes' && (
           <RecipeBuilder
            currentRecipe={currentRecipe}
            setCurrentRecipe={setCurrentRecipe}
            inventory={inventoryManager.inventory}
            addIngredientToRecipe={addIngredientToRecipe}
            updateRecipeIngredient={updateRecipeIngredient}
            removeRecipeIngredient={removeRecipeIngredient}
            saveRecipe={saveRecipe}
            costs={costs}
          />
        )}

        {activeTab === 'saved' && (
          <SavedRecipes
            recipes={recipeManager.recipes}
            loadRecipe={loadRecipe}
            deleteRecipe={deleteRecipe}
          />
        )}

        {activeTab === 'analytics' && (
          <CostAnalysis recipes={recipeManager.recipes} />
        )}
      </div>
    </div>
  );
};
const LandingWithRoute = () => {
  const navigate = useNavigate();
  return <LandingPage onStart={() => navigate('/app')} />;
};

const RecipeCostCalculator = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingWithRoute />} />
        <Route path="/app" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default RecipeCostCalculator;
                      