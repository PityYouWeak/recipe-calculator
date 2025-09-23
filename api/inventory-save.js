
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inventory, userId } = req.body;
    if (!Array.isArray(inventory) || !userId) {
      return res.status(400).json({ message: 'Invalid inventory data or missing userId.' });
    }
    try {
      for (const item of inventory) {
        console.log(item);
         await sql.query(
           `INSERT INTO inventory_items (id, name, unit, cost, category)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET name = $2, unit = $3, cost = $4, category = $5`,
           [item.id, item.name, item.unit, item.cost, item.category]
         );
         // Link inventory item to user
         await sql.query(
           `INSERT INTO user_inventory (user_id, inventory_items_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING`,
           [userId, item.id]
         );
      }
      res.status(200).json({ message: 'Inventory saved and linked to user!' });
    } catch (error) {
      console.error('Error saving inventory:', error);
      res.status(500).json({ message: 'Database error.' });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await sql(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ message: 'Database error.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
