import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  console.log(req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, name, ingredients, laborHours, laborMinutes, laborRate, overheadPercent, markupPercent, wastePercent, cost, userId } = req.body;
  console.log('Received recipe data:', { id, name, ingredients, laborHours, laborMinutes, laborRate, overheadPercent, markupPercent, wastePercent, cost, userId });
  if (!name || !Array.isArray(ingredients) || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    let recipeId = id;
    if (id) {
      // Update existing recipe
      await sql`
        UPDATE recipes SET
          name = ${name},
          labor_hours = ${laborHours},
          labor_minutes = ${laborMinutes},
          labor_rate = ${laborRate},
          overhead_percent = ${overheadPercent},
          markup_percent = ${markupPercent},
          waste_percent = ${wastePercent}
        WHERE id = ${id}
      `;
      // Remove old ingredients for this recipe
      await sql`DELETE FROM recipe_ingredients WHERE recipe_id = ${id}`;
      // Re-insert ingredients
      for (const ing of ingredients) {
        await sql`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
          VALUES (${id}, ${ing.id}, ${ing.quantity});
        `;
      }
      // No need to update user_recipe link (assume user can't change ownership)
    } else {
      // Insert new recipe
      const recipeResult = await sql`
        INSERT INTO recipes (name, labor_hours, labor_minutes, labor_rate, overhead_percent, markup_percent, waste_percent, created_at)
        VALUES (${name}, ${laborHours}, ${laborMinutes}, ${laborRate}, ${overheadPercent}, ${markupPercent}, ${wastePercent}, NOW())
        RETURNING id;
      `;
      recipeId = recipeResult.rows[0].id;
      console.log('Inserted recipe with ID:', recipeId);
      // Link recipe to user in user_recipe table
      await sql`
        INSERT INTO user_recipe (recipe_id, user_id)
        VALUES (${recipeId}, ${userId});
      `;
      // Insert ingredients for recipe
      for (const ing of ingredients) {
        await sql`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
          VALUES (${recipeId}, ${ing.id}, ${ing.quantity});
        `;
      }
    }
    return res.status(200).json({ message: id ? 'Recipe updated!' : 'Recipe saved!', recipeId });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Failed to save recipe', details: error.message });
  }
}
