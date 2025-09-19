
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { inventory } = req.body;
    if (!Array.isArray(inventory)) {
      return res.status(400).json({ message: 'Invalid inventory data.' });
    }
    try {
      for (const item of inventory) {
         await sql.query(
           `INSERT INTO inventory_items (id, name, unit, cost, category)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET name = $2, unit = $3, cost = $4, category = $5`,
           [item.id, item.name, item.unit, item.cost, item.category]
         );
      }
      res.status(200).json({ message: 'Inventory saved to Neon DB!' });
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
