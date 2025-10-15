import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// 🔹 Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand_name, plan_type } = req.body;

    if (!brand_name || !plan_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🔹 Auto Unique ID generator
    const unique_id = uuidv4();

    // 🔹 Expiry Date (e.g., 30 days from today)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiry_date = expiryDate.toISOString().split('T')[0];

    // 🔹 Insert into Supabase
    const { data, error } = await supabase
      .from('brands')
      .insert([
        {
          brand_name,
          unique_id,
          plan_type,
          expiry_date,
          is_active: true
        }
      ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: '✅ Brand Registered Successfully',
      unique_id,
      expiry_date
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
        }
