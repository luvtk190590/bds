const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env.local' });
dotenv.config({ path: '.env.local' }); // Try both paths just in case

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase configuration in .env.local file");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Define categories to crawl based on batdongsan.com.vn paths and our DB mapping
const CATEGORIES = [
    // NHÀ ĐẤT BÁN
    { url: 'https://batdongsan.com.vn/ban-can-ho-chung-cu', type_slug: 'ban-can-ho-chung-cu', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-nha-rieng', type_slug: 'ban-nha-rieng', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-nha-biet-thu-lien-ke', type_slug: 'ban-nha-biet-thu-lien-ke', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-nha-mat-pho', type_slug: 'ban-nha-mat-pho', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-shophouse-nha-pho-thuong-mai', type_slug: 'ban-shophouse-nha-pho-thuong-mai', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-dat-nen-du-an', type_slug: 'ban-dat-nen-du-an', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-dat', type_slug: 'ban-dat', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-trang-trai-khu-nghi-duong', type_slug: 'ban-trang-trai-khu-nghi-duong', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-kho-nha-xuong', type_slug: 'ban-kho-nha-xuong', listing: 'sale', limit: 5 },
    { url: 'https://batdongsan.com.vn/ban-loai-bat-dong-san-khac', type_slug: 'ban-loai-bat-dong-san-khac', listing: 'sale', limit: 5 },

    // NHÀ ĐẤT CHO THUÊ
    { url: 'https://batdongsan.com.vn/cho-thue-can-ho-chung-cu', type_slug: 'cho-thue-can-ho-chung-cu', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-nha-rieng', type_slug: 'cho-thue-nha-rieng', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-nha-biet-thu-lien-ke', type_slug: 'cho-thue-nha-biet-thu-lien-ke', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-nha-mat-pho', type_slug: 'cho-thue-nha-mat-pho', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-shophouse-nha-pho-thuong-mai', type_slug: 'cho-thue-shophouse-nha-pho-thuong-mai', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-nha-tro-phong-tro', type_slug: 'cho-thue-nha-tro-phong-tro', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-van-phong', type_slug: 'cho-thue-van-phong', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-sang-nhuong-cua-hang-ki-ot', type_slug: 'cho-thue-sang-nhuong-cua-hang-ki-ot', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-kho-nha-xuong-dat', type_slug: 'cho-thue-kho-nha-xuong-dat', listing: 'rent', limit: 5 },
    { url: 'https://batdongsan.com.vn/cho-thue-loai-bat-dong-san-khac', type_slug: 'cho-thue-loai-bat-dong-san-khac', listing: 'rent', limit: 5 },
];

// Map text to our enums/data types
const parsePrice = (priceStr) => {
    try {
        if (!priceStr || priceStr.includes('Thỏa thuận')) return 0;
        const s = priceStr.toLowerCase();

        // Use regex to get numeric value
        const numMatch = s.match(/([0-9.,]+)/);
        if (!numMatch) return 0;

        const num = parseFloat(numMatch[1].replace(',', '.'));

        if (s.includes('tỷ')) return num * 1000000000;
        if (s.includes('triệu')) return num * 1000000;
        return 0;
    } catch (e) { return 0; }
};

const parseArea = (areaStr) => {
    try {
        if (!areaStr) return 0;
        // Extract number using regex (handles "120 m2", "120.5 m2", "120,5 m2")
        const match = areaStr.match(/([0-9.,]+)/);
        if (match) {
            return parseFloat(match[1].replace(',', '.'));
        }
        return 0;
    } catch (e) { return 0; }
};

const mapDirection = (dirStr) => {
    if (!dirStr) return null;
    const s = dirStr.toLowerCase();
    if (s.includes('đông') && s.includes('bắc')) return 'northeast';
    if (s.includes('đông') && s.includes('nam')) return 'southeast';
    if (s.includes('tây') && s.includes('bắc')) return 'northwest';
    if (s.includes('tây') && s.includes('nam')) return 'southwest';
    if (s.includes('đông')) return 'east';
    if (s.includes('tây')) return 'west';
    if (s.includes('nam')) return 'south';
    if (s.includes('bắc')) return 'north';
    return null;
};

async function run() {
    console.log("Starting Batdongsan Crawler...");

    const TEST_URL = process.env.TEST_URL; // Optional: crawl only one URL for testing

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Ensure we are signed in to satisfy RLS
    const botEmail = 'bot_1773061139351@seller.com';
    const botPass = 'Password123!';
    let ownerId = null;

    console.log(`Authenticating Bot against Supabase as ${botEmail}...`);
    let { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: botEmail,
        password: botPass
    });

    if (signInErr || !signInData.user) {
        console.error("Lỗi đăng nhập Bot. Hãy đảm bảo tài khoản này tồn tại trong Supabase Auth:", signInErr?.message);
        await browser.close();
        return;
    }

    const { data: profile } = await supabase.from('profiles').select('id, role').eq('auth_user_id', signInData.user.id).single();
    if (!profile) {
        console.error("Profile trigger failed. Please check your DB setup.");
        await browser.close();
        return;
    }
    ownerId = profile.id;

    // Force role to 'seller' so RLS allows inserts
    if (profile.role !== 'seller') {
        console.log("Cập nhật quyền profile sang 'seller'...");
        await supabase.from('profiles').update({ role: 'seller' }).eq('id', ownerId);
    }

    // Load available property types
    const { data: propertyTypes, error: pTypesErr } = await supabase.from('property_types').select('id, slug');
    if (pTypesErr) {
        console.error("Error fetching property types:", pTypesErr.message);
        await browser.close();
        return;
    }
    console.log("Available property types in DB:", propertyTypes.map(p => p.slug).join(', '));

    // Run either single TEST_URL or full CATEGORIES
    const taskList = TEST_URL
        ? [{ url: TEST_URL, type_slug: 'ban-can-ho-chung-cu', listing: 'sale', limit: 1, isTest: true }]
        : CATEGORIES;

    for (const cat of taskList) {
        console.log(`\nCrawling category: ${cat.url}`);

        try {
            let links = [];
            if (cat.isTest) {
                links = [cat.url];
            } else {
                await page.goto(cat.url, { waitUntil: 'networkidle2', timeout: 60000 });
                links = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll('.js__product-link-for-product-id'));
                    const rawLinks = [...new Set(items.map(a => a.href))].filter(href => href && href.includes('batdongsan.com.vn'));
                    return rawLinks.slice(0, 10);
                });
            }

            console.log(`Found ${links.length} potential links to process. Target: ${cat.limit}`);

            const pType = propertyTypes.find(p => p.slug === cat.type_slug);
            const propertyTypeId = pType ? pType.id : null;

            if (!propertyTypeId) {
                console.warn(`  -> Skip: Property type ${cat.type_slug} not found in DB.`);
                continue;
            }

            let successfulCount = 0;
            for (let i = 0; i < links.length; i++) {
                if (successfulCount >= cat.limit) break;
                const link = links[i];

                // Check if already crawled by checking slug
                const tempSlug = link.split('/').pop().replace('.htm', '');
                const { data: existing } = await supabase.from('properties').select('id').ilike('slug', `%${tempSlug}%`).limit(1);

                if (existing && existing.length > 0 && !cat.isTest) {
                    console.log(`  -> Skip: ${tempSlug} already in DB.`);
                    continue;
                }

                console.log(`- Crawling Detail [${successfulCount + 1}/${cat.limit}]: ${link}`);

                try {
                    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    await new Promise(r => setTimeout(r, 3000)); // Wait for lazily loaded content

                    const data = await page.evaluate(() => {
                        const title = document.querySelector('h1.re__pr-title')?.innerText?.trim() || '';

                        let priceText = '', areaText = '';
                        let bedrooms = 0, bathrooms = 0, legal_status = '', floors = null, furniture = '', balcony = '', direction = '';

                        // Check all spec items (both short and long)
                        const allSpecs = Array.from(document.querySelectorAll('.re__pr-short-info-item, .re__pr-specs-content-item'));

                        allSpecs.forEach(s => {
                            const titleEl = s.querySelector('.title, .re__pr-specs-content-item-title');
                            const valueEl = s.querySelector('.value, .re__pr-specs-content-item-value');

                            if (titleEl && valueEl) {
                                const t = titleEl.innerText;
                                const v = valueEl.innerText;

                                if (t.includes('Mức giá') || t.includes('Khoảng giá') || t.includes('Giá')) priceText = v;
                                if (t.includes('Diện tích')) areaText = v;
                                if (t.includes('Phòng ngủ') || t.includes('Số phòng ngủ')) bedrooms = parseInt(v) || bedrooms;
                                if (t.includes('Phòng tắm') || t.includes('Toilet') || t.includes('Số phòng tắm')) bathrooms = parseInt(v) || bathrooms;
                                if (t.includes('Pháp lý')) legal_status = v;
                                if (t.includes('Số tầng')) floors = parseInt(v);
                                if (t.includes('Nội thất')) furniture = v;
                                if (t.includes('Hướng nhà')) direction = v;
                                if (t.includes('Hướng ban công')) balcony = v;
                            }
                        });

                        // Improved Address Extraction
                        let address = '';
                        const addressSelectors = [
                            '.re__pr-short-description.js__pr-address',
                            '.re__pr-address',
                            '.js__pr-address',
                            'span[class*="address"]',
                        ];
                        for (const selector of addressSelectors) {
                            const el = document.querySelector(selector);
                            if (el && el.innerText.trim()) {
                                address = el.innerText.trim();
                                break;
                            }
                        }

                        // Extract from Breadcrumb as strong fallback
                        const breadcrumbs = Array.from(document.querySelectorAll('.re__breadcrumb-item, .re__breadcrumb a')).map(b => b.innerText.trim()).filter(Boolean);

                        if (!address && breadcrumbs.length > 2) {
                            // Example: Bán -> Bán nhà tại [Tỉnh] -> [Quận] -> [Xã]
                            address = breadcrumbs.slice(2).reverse().join(', ');
                        }

                        const description = document.querySelector('.re__section-body.re__detail-content, .re__section-body-res')?.innerText?.trim() || '';

                        const project = document.querySelector('.re__pr-project-name')?.innerText?.trim() || '';

                        // Extract GPS coordinates from page
                        let lat = null, lng = null;
                        // Method 1: Check for map iframe src with lat/lng
                        const mapIframe = document.querySelector('iframe[src*="maps"]');
                        if (mapIframe) {
                            const src = mapIframe.src;
                            const latMatch = src.match(/lat[=:]([\d.]+)/);
                            const lngMatch = src.match(/(?:lng|lon)[=:]([\d.]+)/);
                            if (latMatch && lngMatch) {
                                lat = parseFloat(latMatch[1]);
                                lng = parseFloat(lngMatch[1]);
                            }
                            // Also try q=lat,lng pattern
                            const qMatch = src.match(/q=([\d.]+),([\d.]+)/);
                            if (!lat && qMatch) {
                                lat = parseFloat(qMatch[1]);
                                lng = parseFloat(qMatch[2]);
                            }
                        }
                        // Method 2: Check script tags for coordinates
                        if (!lat) {
                            const scripts = document.querySelectorAll('script');
                            for (const script of scripts) {
                                const text = script.textContent || '';
                                const coordMatch = text.match(/"latitude"\s*:\s*([\d.]+).*?"longitude"\s*:\s*([\d.]+)/s);
                                if (coordMatch) {
                                    lat = parseFloat(coordMatch[1]);
                                    lng = parseFloat(coordMatch[2]);
                                    break;
                                }
                                const coordMatch2 = text.match(/lat\s*[:=]\s*([\d.]+).*?(?:lng|lon)\s*[:=]\s*([\d.]+)/s);
                                if (coordMatch2) {
                                    lat = parseFloat(coordMatch2[1]);
                                    lng = parseFloat(coordMatch2[2]);
                                    break;
                                }
                            }
                        }
                        // Method 3: data attributes
                        if (!lat) {
                            const mapEl = document.querySelector('[data-lat][data-lng]');
                            if (mapEl) {
                                lat = parseFloat(mapEl.dataset.lat);
                                lng = parseFloat(mapEl.dataset.lng);
                            }
                        }

                        // Prefer 1275x717 or large images
                        const images = Array.from(document.querySelectorAll('img'))
                            .map(img => img.src)
                            .filter(src => src && src.includes('file4.batdongsan.com.vn'));

                        // Filter out small thumbnails if possible
                        const largeImages = images.filter(src => src.includes('resize/1275x717') || !src.includes('resize/200x200'));

                        return {
                            title, priceText, areaText, address, description,
                            bedrooms, bathrooms, legal_status, floors, furniture, balcony, direction,
                            project_name: project,
                            breadcrumbs,
                            lat, lng,
                            images: [...new Set(largeImages.length > 0 ? largeImages : images)].slice(0, 10)
                        };
                    });

                    if (!data.title) {
                        console.error(`  -> Failed: Could not extract title.`);
                        continue;
                    }
                    // Map data to our DB structure
                    const rawPrice = parsePrice(data.priceText);
                    const rawArea = parseArea(data.areaText);

                    if (rawArea <= 0) {
                        console.warn(`  -> Skip: Diện tích không hợp lệ (${data.areaText})`);
                        continue;
                    }

                    // Location Parsing Logic - IMPROVED
                    let provinceCode = null, districtCode = null, wardCode = null;
                    const cleanLoc = (s) => s?.replace(/^(Tỉnh|Thành phố|Thành Phố|Quận|Huyện|Thị xã|Xã|Phường|Thị trấn|TP|T\.P)\s+/i, '').trim();

                    // 1. Clean address string: remove newlines and everything in ()
                    const fullAddress = data.address.split('\n')[0].replace(/\(.*?\)/g, '').trim();
                    const locParts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);

                    // 2. Try matching from Breadcrumbs first (usually cleaner)
                    // Expected Breadcrumbs: ["Bán", "Bán nhà tại [Province]", "[District]", "[Ward]"]
                    const bc = data.breadcrumbs || [];
                    const bcProvince = bc[1]?.replace('Bán nhà tại ', '').replace('Bán căn hộ tại ', '').replace('Bán đất tại ', '').trim();
                    const bcDistrict = bc[2];
                    const bcWard = bc[3];

                    // Match Province
                    const pSearch = cleanLoc(bcProvince || locParts[locParts.length - 1]);
                    if (pSearch) {
                        const { data: pData } = await supabase.from('provinces').select('code').ilike('name', `%${pSearch}%`).limit(1);
                        if (pData?.[0]) {
                            provinceCode = pData[0].code;

                            // Match District
                            const dSearch = cleanLoc(bcDistrict || locParts[locParts.length - 2]);
                            if (dSearch) {
                                const { data: dData } = await supabase.from('districts').select('code').match({ province_code: provinceCode }).ilike('name', `%${dSearch}%`).limit(1);
                                if (dData?.[0]) {
                                    districtCode = dData[0].code;

                                    // Match Ward - Prefer locParts for Wards as Breadcrumbs often stop at District/Project
                                    const rawWard = locParts[locParts.length - 3] || bcWard;
                                    const wSearch = cleanLoc(rawWard);

                                    if (wSearch && !wSearch.includes('tại') && wSearch.length < 50) {
                                        const { data: wData } = await supabase.from('wards').select('code').match({ district_code: districtCode }).ilike('name', `%${wSearch}%`).limit(1);
                                        if (wData?.[0]) wardCode = wData[0].code;
                                    }
                                }
                            }
                        }
                    }



                    const propertyData = {
                        owner_id: ownerId,
                        property_type_id: propertyTypeId,
                        title: data.title,
                        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
                        description: data.description,
                        price: rawPrice,
                        area: rawArea,
                        address: data.address,
                        ward_code: wardCode,
                        district_code: districtCode,
                        province_code: provinceCode,
                        bedrooms: data.bedrooms,
                        bathrooms: data.bathrooms,
                        legal_status: data.legal_status,
                        floors: data.floors,
                        furniture_status: data.furniture,
                        project_name: data.project_name || (data.address.includes('Vinhomes Ocean Park') ? 'Vinhomes Ocean Park' : null),
                        listing_type: cat.listing,
                        status: 'approved',
                        direction: mapDirection(data.direction),
                        balcony_direction: mapDirection(data.balcony),
                        location: data.lat && data.lng ? `POINT(${data.lng} ${data.lat})` : `POINT(105.8544 21.0285)`
                    };

                    const { data: insertedProp, error: insertErr } = await supabase.from('properties').insert(propertyData).select('id').single();

                    if (insertErr) {
                        console.error(`  -> Failed inserting property: ${insertErr.message}`);
                    } else if (insertedProp) {
                        successfulCount++;
                        console.log(`  -> Property inserted! ID: ${insertedProp.id}`);
                        if (data.images.length > 0) {
                            const imgPayload = data.images.map((url, idx) => ({
                                property_id: insertedProp.id,
                                url: url,
                                sort_order: idx,
                                is_primary: idx === 0
                            }));
                            const { error: imgErr } = await supabase.from('property_images').insert(imgPayload);
                            if (imgErr) console.error(`     -> Error saving images: ${imgErr.message}`);
                        }
                    }

                } catch (e) {
                    console.error(`  -> Error scraping detail: ${e.message}`);
                }
            }
        } catch (e) {
            console.error(`Error crawling category ${cat.url}: ${e.message}`);
        }

    }

    console.log("\nCrawling process completed!");
    await browser.close();
}

run();
