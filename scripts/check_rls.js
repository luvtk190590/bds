const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('properties').select('id, title').limit(2);
    console.log("RLS Check via Anon Key:");
    console.log("Error:", error);
    console.log("Data:", data);
}

check();
