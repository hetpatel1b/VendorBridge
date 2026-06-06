import { supabase } from './src/lib/supabase.js';

async function test() {
  console.log("Testing user 1: hetpatel1b@gmail.com");
  const res1 = await supabase.auth.signInWithPassword({
    email: 'hetpatel1b@gmail.com',
    password: 'Het@892007'
  });
  console.log("Login 1 result:", JSON.stringify(res1, null, 2));

  console.log("\nTesting user 2 (Custom account): test12345@gmail.com");
  const res2 = await supabase.auth.signInWithPassword({
    email: 'test12345@gmail.com',
    password: 'hetprashant'
  });
  console.log("Login 2 result:", JSON.stringify(res2, null, 2));
}

test();
