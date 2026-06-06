import { supabase } from './src/lib/supabase.js';

async function test() {
  const res = await supabase.auth.signInWithPassword({
    email: 'hetpatel1b@gmail.com',
    password: 'Het@892007'
  });
  console.log("Login result:", JSON.stringify(res, null, 2));
}

test();
