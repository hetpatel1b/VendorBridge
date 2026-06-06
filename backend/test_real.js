import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const res = await supabase.from('users').select('*').limit(1);
    console.log("Users query full result:", JSON.stringify(res, null, 2));

    const resVendors = await supabase.from('vendors').select('*').limit(1);
    console.log("Vendors query full result:", JSON.stringify(resVendors, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
