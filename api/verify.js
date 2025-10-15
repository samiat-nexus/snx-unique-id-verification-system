import { createClient } from '@supabase/supabase-js';

// 🔹 Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    // 🔹 Get unique_id from request query
    const { unique_id } = req.query;

    if (!unique_id) {
      return res.status(400).json({ verified: false, message: 'Unique ID is required' });
    }

    // 🔹 Fetch brand data from Supabase
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('unique_id', unique_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ verified: false, message: 'Invalid Unique ID' });
    }

    // 🔹 Check if service expired
    const today = new Date().toISOString().split('T')[0];
    if (today > data.expiry_date) {
      // Optional: Update is_active = false
      await supabase
        .from('brands')
        .update({ is_active: false })
        .eq('unique_id', unique_id);

      return res.status(200).json({
        verified: false,
        message: '❌ Service expired. Please renew your plan.',
        expired_on: data.expiry_date
      });
    }

    // 🔹 If still active
    return res.status(200).json({
      verified: true,
      message: '✅ Service is active and verified!',
      brand_name: data.brand_name,
      plan_type: data.plan_type,
      expiry_date: data.expiry_date
    });

  } catch (err) {
    return res.status(500).json({ verified: false, message: err.message });
  }
        }
