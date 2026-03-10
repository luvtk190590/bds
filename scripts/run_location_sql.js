/**
 * Chạy SQL update locations dùng service_role key
 */
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Dùng service role key - bypass RLS hoàn toàn
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
    // Read SQL file
    const sql = fs.readFileSync('scripts/update_locations.sql', 'utf8');
    const updates = sql.split('\n').filter(l => l.startsWith('UPDATE'));

    console.log(`Found ${updates.length} UPDATE statements\n`);

    // First, create helper function
    console.log('Creating update_property_location function...');
    const { error: fnErr } = await supabase.rpc('query', {
        sql_query: `
            CREATE OR REPLACE FUNCTION update_property_location(p_id uuid, p_lng float8, p_lat float8)
            RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
                UPDATE properties SET location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography WHERE id = p_id;
            $$;
        `
    });

    if (fnErr) {
        console.log('Could not create via rpc/query:', fnErr.message);
        console.log('Trying alternative approach...\n');
    } else {
        console.log('Function created!\n');
    }

    // Parse coordinates from SQL and try RPC
    let success = 0, failed = 0;

    for (let i = 0; i < updates.length; i++) {
        const stmt = updates[i];
        const coordMatch = stmt.match(/MakePoint\(([\d.]+),\s*([\d.]+)\)/);
        const idMatch = stmt.match(/id = '([^']+)'/);

        if (!coordMatch || !idMatch) {
            console.log(`[${i + 1}] Parse error`);
            failed++;
            continue;
        }

        const lng = parseFloat(coordMatch[1]);
        const lat = parseFloat(coordMatch[2]);
        const id = idMatch[1];

        // Try RPC call
        const { error } = await supabase.rpc('update_property_location', {
            p_id: id,
            p_lng: lng,
            p_lat: lat,
        });

        if (error) {
            if (i === 0) {
                console.log('RPC not available:', error.message);
                console.log('\nFalling back to direct REST approach...\n');
                // Try batch SQL via management API
                await tryDirectSQL(updates);
                return;
            }
            failed++;
        } else {
            console.log(`[${i + 1}/${updates.length}] OK: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            success++;
        }
    }

    console.log(`\n=== DONE: ${success} OK, ${failed} failed ===`);
    await verify();
}

async function tryDirectSQL(updates) {
    // Batch all updates into a single SQL
    const batchSQL = updates.join('\n');

    // Try Supabase Management API - SQL endpoint
    const projectRef = SUPABASE_URL.match(/\/\/([\w-]+)\./)?.[1];
    console.log(`Project ref: ${projectRef}`);

    // Use pg-meta endpoint 
    const endpoints = [
        `${SUPABASE_URL}/pg/query`,
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying: ${endpoint}...`);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                },
                body: JSON.stringify({ query: batchSQL })
            });
            console.log(`  Status: ${res.status}`);
            if (res.ok) {
                console.log('  SUCCESS!');
                await verify();
                return;
            }
            const text = await res.text();
            console.log(`  Response: ${text.substring(0, 200)}`);
        } catch (err) {
            console.log(`  Error: ${err.message}`);
        }
    }

    // Last resort: use supabase-js with service role to update via standard API
    console.log('\nTrying service_role direct update...');
    let success = 0, failed = 0;

    for (let i = 0; i < updates.length; i++) {
        const stmt = updates[i];
        const coordMatch = stmt.match(/MakePoint\(([\d.]+),\s*([\d.]+)\)/);
        const idMatch = stmt.match(/id = '([^']+)'/);

        if (!coordMatch || !idMatch) { failed++; continue; }

        const lng = parseFloat(coordMatch[1]);
        const lat = parseFloat(coordMatch[2]);
        const id = idMatch[1];

        // With service role, try GeoJSON
        const { error } = await supabase
            .from('properties')
            .update({ location: `SRID=4326;POINT(${lng} ${lat})` })
            .eq('id', id);

        if (error) {
            if (i === 0) console.log('Update error:', error.message);
            failed++;
        } else {
            if (i < 3) console.log(`[${i + 1}] Updated`);
            success++;
        }
    }

    console.log(`Updated: ${success}, Failed: ${failed}`);
    await verify();
}

async function verify() {
    console.log('\nVerifying...');
    const { data } = await supabase.rpc("properties_in_view", {
        min_lat: 8, min_lng: 102, max_lat: 24, max_lng: 110,
    });

    const uniqueCoords = new Set();
    data?.forEach(d => uniqueCoords.add(`${d.lat.toFixed(4)},${d.lng.toFixed(4)}`));
    console.log(`Total: ${data?.length}, Unique coordinates: ${uniqueCoords.size}`);
}

main();
