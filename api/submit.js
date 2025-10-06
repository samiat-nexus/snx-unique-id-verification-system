import { createClient } from '@supabase/supabase-js';

// 🔹 Supabase connection setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔹 Helper function — auto generate Unique ID
function generateUniqueID(planType) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  let planCode = 'GEN'; // fallback

  if (planType.toLowerCase().includes('basic')) planCode = 'BSC';
  else if (planType.toLowerCase().includes('standard')) planCode = 'STD';
  else if (planType.toLowerCase().includes('premium')) planCode = 'PRM';

  return `SNX-${planCode}-${randomPart}`;
}

// 🔹 API function to save data
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand_name, plan_type } = req.body;

    if (!brand_name || !plan_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique ID
    const unique_id = generateUniqueID(plan_type);

    // Save to Supabase table
    const { data, error } = await supabase
      .from('brands')
      .insert([{ brand_name, unique_id, plan_type }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Data saved successfully', unique_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

