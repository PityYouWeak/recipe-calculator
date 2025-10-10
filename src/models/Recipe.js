
class Recipe {
  // Convert camelCase to snake_case for backend/database
  toBackend() {
    return {
      id: this.id,
      name: this.name,
      ingredients: this.ingredients,
      labor_hours: this.laborHours,
      labor_minutes: this.laborMinutes,
      labor_rate: this.laborRate,
      overhead_percent: this.overheadPercent,
      markup_percent: this.markupPercent,
      waste_percent: this.wastePercent,
      created_at: this.createdAt,
    };
  }

  // Create a Recipe instance from backend/database object (snake_case)
  static fromBackend(obj) {
    return new Recipe({
      id: obj.id,
      name: obj.name,
      ingredients: obj.ingredients,
      laborHours: obj.labor_hours,
      laborMinutes: obj.labor_minutes,
      laborRate: obj.labor_rate,
      overheadPercent: obj.overhead_percent,
      markupPercent: obj.markup_percent,
      wastePercent: obj.waste_percent,
      createdAt: obj.created_at,
    });
  }

  constructor({ id, name, ingredients, laborHours, laborMinutes, laborRate, overheadPercent, markupPercent, wastePercent, createdAt }) {
    this.id = id;
    this.name = name;
    this.ingredients = ingredients || [];
    this.laborHours = laborHours || 0;
    this.laborMinutes = laborMinutes || 0;
    this.laborRate = laborRate || 15;
    this.overheadPercent = overheadPercent || 10;
    this.markupPercent = markupPercent || 50;
    this.wastePercent = wastePercent || 5;
    this.createdAt = createdAt || new Date().toISOString();
    this.cost = this.calculateCost();
  }

  calculateCost() {
    const ingredientCost = this.ingredients.reduce((total, ing) => total + (ing.cost * ing.quantity), 0);
    const wasteAdjustedCost = ingredientCost * (1 + this.wastePercent / 100);
    // Labor cost: laborHours + laborMinutes/60
    const laborCost = ((this.laborHours || 0) + (this.laborMinutes || 0) / 60) * (this.laborRate || 0);
    const baseCost = wasteAdjustedCost + laborCost;
    const overheadCost = baseCost * (this.overheadPercent / 100);
    const totalCost = baseCost + overheadCost;
    const sellingPrice = totalCost * (1 + this.markupPercent / 100);
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
  }
}

export default Recipe;
