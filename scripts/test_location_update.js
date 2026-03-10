const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data: props } = await supabase.from('properties').select('id').limit(1);
    const id = props[0].id;
    console.log('Testing property:', id);

    // Method 1: GeoJSON format
    console.log('\n1. GeoJSON format...');
    let { error: e1, data: d1 } = await supabase
        .from('properties')
        .update({
            location: { type: "Point", coordinates: [106.6, 10.8] }
        })
        .eq('id', id)
        .select('id');
    console.log('  Error:', e1?.message || 'none');

    // Check
    const { data: c1 } = await supabase.rpc("properties_in_view", {
        min_lat: 10.7, min_lng: 106.5, max_lat: 10.9, max_lng: 106.7,
    });
    console.log('  Found at HCM:', c1?.length || 0);

    if (c1?.length > 0) {
        console.log('\n*** GeoJSON format WORKS! ***');
        // Reset
        await supabase.from('properties').update({
            location: { type: "Point", coordinates: [105.8544, 21.0285] }
        }).eq('id', id);
        return 'geojson';
    }

    // Method 2: Try via fetch with raw PostgREST
    console.log('\n2. Raw fetch with PostgREST...');
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties?id=eq.${id}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            location: 'SRID=4326;POINT(106.6 10.8)'
        })
    });
    console.log('  Status:', res.status);

    const { data: c2 } = await supabase.rpc("properties_in_view", {
        min_lat: 10.7, min_lng: 106.5, max_lat: 10.9, max_lng: 106.7,
    });
    console.log('  Found at HCM:', c2?.length || 0);

    if (c2?.length > 0) {
        console.log('\n*** Raw PostgREST WORKS! ***');
        // Reset
        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ location: 'SRID=4326;POINT(105.8544 21.0285)' })
        });
        return 'postgrest';
    }

    // Method 3: Hex-encoded WKB
    console.log('\n3. Hex WKB format...');
    // WKB for POINT(106.6 10.8) SRID=4326
    // Using PostGIS ST_GeomFromText via custom format
    // Actually, let's try setting via column assignment
    const { error: e3 } = await supabase
        .from('properties')
        .update({
            location: '0101000020E6100000CDCCCCCCCC9C5A409A9999999999254001'
        })
        .eq('id', id);
    console.log('  Error:', e3?.message || 'none');

    console.log('\nNo method worked. Need service_role key or SQL Editor.');
    return null;
}

test().then(method => {
    if (method) console.log(`\nWorking method: ${method}`);
});
