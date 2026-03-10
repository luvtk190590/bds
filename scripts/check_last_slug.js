const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLastProperty() {
    const { data, error } = await supabase
        .from('properties')
        .select('id, title, slug')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Last Property:");
        console.log("ID:", data.id);
        console.log("Title:", data.title);
        console.log("Slug:", data.slug);
    }
}

checkLastProperty();
