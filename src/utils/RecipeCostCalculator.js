// src/utils/RecipeCostCalculator.js
// Centralized cost calculation for recipes and ingredients

export default function calculateRecipeCost(recipe) {
  const ingredients = recipe.ingredients || [];
  const ingredientCost = ingredients.reduce((sum, ing) => sum + ((parseFloat(ing.cost) || 0) * (parseFloat(ing.quantity) || 0)), 0);
  const wastePercent = parseFloat(recipe.wastePercent ?? recipe.waste_percent ?? 0);
  const laborHours = parseFloat(recipe.laborHours ?? recipe.labor_hours ?? 0);
  const laborMinutes = parseFloat(recipe.laborMinutes ?? recipe.labor_minutes ?? 0);
  const laborRate = parseFloat(recipe.laborRate ?? recipe.labor_rate ?? 0);
  const overheadPercent = parseFloat(recipe.overheadPercent ?? recipe.overhead_percent ?? 0);
  const markupPercent = parseFloat(recipe.markupPercent ?? recipe.markup_percent ?? 0);
  const wasteAdjustedCost = ingredientCost * (1 + (wastePercent || 0) / 100);
  const laborCost = ((laborHours || 0) + (laborMinutes || 0) / 60) * (laborRate || 0);
  const overheadCost = (wasteAdjustedCost + laborCost) * (overheadPercent || 0) / 100;
  const totalCost = wasteAdjustedCost + laborCost + overheadCost;
  const sellingPrice = totalCost * (1 + (markupPercent || 0) / 100);
  const profitMargin = sellingPrice ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;
  return {
    ingredientCost,
    wasteAdjustedCost,
    laborCost,
    overheadCost,
    totalCost,
    sellingPrice,
    profitMargin
  };
}
