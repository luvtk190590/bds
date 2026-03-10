const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testSingle() {
    const url = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-xa-duong-xa-vinhomes-ocean-park-gia-lam/quy-500-oc-quyen-chinh-chu-gui-ban-tot-nhat-tai-mien-phi-moi-gioi-pr45210944';

    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to: ${url}`);
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("Page loaded. Extracting data...");

        const data = await page.evaluate(() => {
            const results = {};
            results.title = document.querySelector('h1.re__pr-title')?.innerText?.trim();

            // Log all selectors to identify issues
            const specsItems = Array.from(document.querySelectorAll('.re__pr-short-info-item'));
            results.shortSpecs = specsItems.map(item => ({
                label: item.querySelector('.title')?.innerText?.trim(),
                value: item.querySelector('.value')?.innerText?.trim()
            }));

            results.address = document.querySelector('.re__pr-short-description')?.innerText?.trim();
            results.description = document.querySelector('.re__section-body.re__detail-content')?.innerText?.trim();

            const detailsItems = Array.from(document.querySelectorAll('.re__pr-specs-content-item'));
            results.details = detailsItems.map(item => ({
                title: item.querySelector('.re__pr-specs-content-item-title')?.innerText?.trim(),
                value: item.querySelector('.re__pr-specs-content-item-value')?.innerText?.trim()
            }));

            results.project = document.querySelector('.re__pr-project-name')?.innerText?.trim();

            const images = Array.from(document.querySelectorAll('img')).map(img => img.src)
                .filter(src => src && (src.includes('file4.batdongsan.com.vn') || src.includes('cdn3.batdongsan.com.vn')));
            results.images = [...new Set(images)];

            return results;
        });

        console.log("\n--- EXTRACTED DATA ---");
        console.log(JSON.stringify(data, null, 2));
        console.log("------------------------\n");

    } catch (e) {
        console.error("Error during test:", e.message);
    } finally {
        await browser.close();
    }
}

testSingle();
