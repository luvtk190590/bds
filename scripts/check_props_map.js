const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    // Check via RPC to see actual lat/lng values
    const { data, error } = await supabase.rpc("properties_in_view", {
        min_lat: 8,
        min_lng: 102,
        max_lat: 24,
        max_lng: 110,
    });

    if (error) {
        console.log("Error:", error);
        return;
    }

    // Group by unique lat/lng
    const uniqueCoords = new Map();
    data.forEach(d => {
        const key = `${d.lat},${d.lng}`;
        if (!uniqueCoords.has(key)) uniqueCoords.set(key, 0);
        uniqueCoords.set(key, uniqueCoords.get(key) + 1);
    });

    console.log(`Total properties: ${data.length}`);
    console.log(`Unique coordinates: ${uniqueCoords.size}`);
    console.log('\nCoordinate distribution:');
    uniqueCoords.forEach((count, key) => {
        console.log(`  ${key}: ${count} properties`);
    });
}

check();
