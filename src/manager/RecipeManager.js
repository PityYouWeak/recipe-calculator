class RecipeManager {
  constructor(recipes = []) {
    this.recipes = recipes;
  }

  addRecipe(recipe) {
    this.recipes.push(recipe);
    return [...this.recipes];
  }

  updateRecipe(id, updatedRecipe) {
    this.recipes = this.recipes.map(r => r.id === id ? updatedRecipe : r);
    return [...this.recipes];
  }

  deleteRecipe(id) {
    this.recipes = this.recipes.filter(r => r.id !== id);
    return [...this.recipes];
  }

  static load() {
    return new RecipeManager(JSON.parse(localStorage.getItem('recipes') || '[]'));
  }

  save() {
    localStorage.setItem('recipes', JSON.stringify(this.recipes));
  }

  static calculateCost(recipe) {
    const ingredientCost = recipe.ingredients.reduce((total, ing) => total + (ing.cost * ing.quantity), 0);
    const wasteAdjustedCost = ingredientCost * (1 + recipe.wastePercent / 100);
    // laborMinutes is optional, default to 0 if not present
    const laborMinutes = recipe.laborMinutes || 0;
    const laborCost = (recipe.laborHours + laborMinutes / 60) * recipe.laborRate;
    const baseCost = wasteAdjustedCost + laborCost;
    const overheadCost = baseCost * (recipe.overheadPercent / 100);
    const totalCost = baseCost + overheadCost;
    const sellingPrice = totalCost * (1 + recipe.markupPercent / 100);
    const profit = sellingPrice - totalCost;
    return {
      ingredientCost,
      wasteAdjustedCost,
      laborCost,
      overheadCost,
      totalCost,
      sellingPrice,
      profit,
      profitMargin: sellingPrice ? (profit / sellingPrice) * 100 : 0
    };
  }
}

export default RecipeManager;
