/**
 * Bước 1: Tạo file SQL để chạy trong Supabase Dashboard
 * Bước 2: Geocode rồi ghi ra SQL UPDATE commands
 */
const dotenv = require('dotenv');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function cleanAddress(addr) {
    return addr.split('\n')[0].replace(/\(.*?\)/g, '').replace(/\d+\s*(tỷ|triệu|tr)\/m2?/gi, '').trim();
}

async function geocodeAddress(address) {
    const attempts = [
        cleanAddress(address),
        cleanAddress(address).split(',').slice(-3).join(',').trim(),
        cleanAddress(address).split(',').slice(-2).join(',').trim(),
    ];

    for (const query of attempts) {
        if (!query || query.length < 3) continue;
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query + ', Vietnam')}&format=json&limit=1&countrycodes=vn`;
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'SanChuyenNhuong/1.0' } });
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                if (lat >= 8 && lat <= 24 && lon >= 102 && lon <= 110) {
                    return { lat, lng: lon };
                }
            }
        } catch (err) { /* ignore */ }
        await new Promise(r => setTimeout(r, 1100));
    }
    return null;
}

async function main() {
    console.log('=== Geocoding & Generating SQL ===\n');

    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, address')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${properties.length} properties\n`);

    const sqlLines = [
        '-- Auto-generated SQL to update property locations',
        '-- Run this in Supabase Dashboard > SQL Editor',
        ''
    ];

    let success = 0, failed = 0;

    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const addr = prop.address;

        if (!addr || addr.trim() === '') {
            failed++;
            continue;
        }

        const cleaned = cleanAddress(addr);
        console.log(`[${i + 1}/${properties.length}] ${cleaned.substring(0, 80)}`);

        const result = await geocodeAddress(addr);

        if (result) {
            sqlLines.push(`UPDATE properties SET location = ST_SetSRID(ST_MakePoint(${result.lng}, ${result.lat}), 4326)::geography WHERE id = '${prop.id}';`);
            console.log(`  OK: ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`);
            success++;
        } else {
            console.log(`  NOT FOUND`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 1100));
    }

    // Write SQL file
    const sqlFile = 'scripts/update_locations.sql';
    fs.writeFileSync(sqlFile, sqlLines.join('\n'));
    console.log(`\n=== DONE: ${success} OK, ${failed} failed ===`);
    console.log(`SQL file written to: ${sqlFile}`);
    console.log(`Please run this SQL file in Supabase Dashboard > SQL Editor`);
}

main();
