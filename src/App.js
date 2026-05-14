
import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Calculator, Package, TrendingUp, Save, Download } from 'lucide-react';
import './App.css';
import InventoryManagerComponent from './components/InventoryManager';
import RecipeBuilder from './components/RecipeBuilder';
import SavedRecipes from './components/SavedRecipes';
import CostAnalysis from './components/CostAnalysis';
import CashierManager from './components/CashierManager';
import CashierPOS from './components/CashierPOS';
import InventoryManager from './manager/InventoryManager';
import RecipeManager from './manager/RecipeManager';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';


const MainApp = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Redirect to /auth if not authenticated
  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth', { method: 'GET', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Redirect cashiers away from manager page
          if (data.user.role === 'cashier') {
            navigate('/cashier');
          }
        } else {
          setUser(null);
          navigate('/auth');
        }
      } catch {
        setUser(null);
        navigate('/auth');
      }
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    // Remove cookie by setting it expired
    document.cookie = 'token=; Max-Age=0; Path=/;';
    setUser(null);
    navigate('/auth');
  };
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryManager, setInventoryManager] = useState(null);
  const [recipeManager, setRecipeManager] = useState(() => RecipeManager.load());
  const [cachedRecipes, setCachedRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState({
    name: '',
    ingredients: [],
    laborHours: 0,
    laborRate: 15,
    overheadPercent: 10,
    markupPercent: 50,
    wastePercent: 5
  });

  // Load inventory from DB after user is set
  useEffect(() => {
    if (user && user.id) {
      InventoryManager.syncWithDb(user.id).then(setInventoryManager);
    }
  }, [user?.id]);

  // Cache recipes in App to prevent refetching when switching tabs
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/recipes-get?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setCachedRecipes(Array.isArray(data) ? data : []))
      .catch(() => setCachedRecipes([]));
  }, [user?.id]);

  // If manager just logged in, the AuthPage sets a session flag so we can
  // activate the Cashier tab once and then clear the flag.
  useEffect(() => {
    try {
      const activate = sessionStorage.getItem('activateCashiers');
      if (activate === '1') {
        setActiveTab('cashiers');
        sessionStorage.removeItem('activateCashiers');
      }
    } catch {
      // ignore session errors
    }
  }, [user?.id]);

  // Save inventory to localStorage when inventoryManager changes
  useEffect(() => {
    if (inventoryManager instanceof InventoryManager) inventoryManager.save();
  }, [inventoryManager]);

  useEffect(() => {
    recipeManager.save();
  }, [recipeManager]);

  // Local recipe management moved to components/managers; helpers removed to avoid duplication

  const loadRecipe = (recipe) => {
    console.log(recipe);
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

  

  return (
    <div className="app-container">
      {/* Show logged-in manager info and logout button */}
      {user && (
        <div style={{ position: 'absolute', top: 10, right: 10, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Manager: {user.name || user.email}</span>
          <button className="btn btn-secondary" style={{ padding: '2px 10px', fontSize: 14 }} onClick={handleLogout}>Logout</button>
        </div>
      )}
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
            { id: 'analytics', label: 'Cost Analysis', icon: TrendingUp },
          ].concat(user ? [{ id: 'cashiers', label: 'Cashiers', icon: Save }] : []).map(tab => {
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

        {activeTab === 'inventory' && inventoryManager && (
            <InventoryManagerComponent
              inventory={inventoryManager.inventory}
              setInventoryManager={setInventoryManager}
              user={user}
          />
        )}

        {activeTab === 'recipes' && (
           <RecipeBuilder
            inventory={inventoryManager.inventory}
            user={user}
            currentRecipe={currentRecipe}
            setCurrentRecipe={setCurrentRecipe}
          />
        )}

        {activeTab === 'saved' && (
          <SavedRecipes
            user={user}
            loadRecipe={loadRecipe}
            deleteRecipe={deleteRecipe}
            recipes={cachedRecipes}
          />
        )}

        {activeTab === 'cashiers' && (
          // Manager-facing CRUD page for their cashiers.
          <CashierManager user={user} />
        )}

        {activeTab === 'analytics' && (
          <CostAnalysis user={user} recipes={cachedRecipes} />
        )}
      </div>
        <Analytics />
    </div>
  );
}
const LandingWithRoute = () => {
  const navigate = useNavigate();
  return <LandingPage onStart={() => navigate('/auth')} />;
};

const RecipeCostCalculator = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingWithRoute />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cashier" element={<CashierPOS user={null} />} />
      </Routes>
    </Router>
  );
};

export default RecipeCostCalculator;
                      