const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

puppeteer.use(StealthPlugin());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function crawlBlogs() {
    console.log('Starting crawler with updated selectors...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        console.log('Navigating to: https://wiki.batdongsan.com.vn/tin-tuc');
        await page.goto('https://wiki.batdongsan.com.vn/tin-tuc', { waitUntil: 'networkidle2', timeout: 60000 });

        // Scroll a bit to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, 500));
        await new Promise(r => setTimeout(r, 2000));

        const articles = await page.evaluate(() => {
            const titleLinks = Array.from(document.querySelectorAll('a[href^="/tin-tuc/"]'))
                .filter(a => a.querySelector('h3') || a.classList.toString().includes('title') || a.innerText.length > 20);

            // Deduplicate by href
            const uniqueLinks = [];
            const hrefs = new Set();
            for (const a of titleLinks) {
                if (!hrefs.has(a.href)) {
                    hrefs.add(a.href);
                    uniqueLinks.push(a);
                }
            }

            return uniqueLinks.map(a => {
                const title = a.innerText.trim() || (a.querySelector('h3') ? a.querySelector('h3').innerText.trim() : '');

                // Find image with same link anywhere in document to counter broken DOM structures
                const imgLink = document.querySelector(`a[href="${a.getAttribute('href')}"] img`);
                const image_url = imgLink ? (imgLink.src || imgLink.getAttribute('data-src')) : '';

                // Find desc
                let description = '';
                const parent = a.closest('div');
                if (parent && parent.parentElement) {
                    const p = parent.parentElement.querySelector('p');
                    if (p) description = p.innerText.trim();
                }

                return {
                    title: title,
                    link: a.href,
                    description: description,
                    image_url: image_url,
                    category: 'Tin tức'
                };
            }).filter(x => x.title && x.image_url).slice(0, 10);
        });

        console.log(`Extracted ${articles.length} news items.`);

        for (const article of articles) {
            if (!article.title || !article.link) {
                console.log('Skipping invalid article data:', article);
                continue;
            }

            const slug = slugify(article.title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });

            console.log(`Processing: "${article.title}"`);

            const { data: existing } = await supabase
                .from('posts')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (existing) {
                console.log(`- Skipping: Already exists`);
                continue;
            }

            console.log(`- Crawling content from: ${article.link}`);
            const detailPage = await browser.newPage();
            try {
                await detailPage.goto(article.link, { waitUntil: 'networkidle2', timeout: 30000 });

                const content = await detailPage.evaluate(() => {
                    const contentEl = document.querySelector('div[class*="Article_content"]') ||
                        document.querySelector('.article-content') ||
                        document.querySelector('article') ||
                        document.querySelector('div[class*="content"]');
                    return contentEl ? contentEl.innerHTML : '';
                });

                const { error } = await supabase.from('posts').insert({
                    title: article.title,
                    slug: slug,
                    description: article.description,
                    content: content,
                    image_url: article.image_url,
                    category: article.category,
                    author_name: 'BatdongsanWiki'
                });

                if (error) {
                    console.error(`- Error inserting:`, error.message);
                } else {
                    console.log(`- Successfully added!`);
                }
            } catch (err) {
                console.error(`- Failed to fetch content:`, err.message);
            } finally {
                await detailPage.close();
            }
        }
    } catch (err) {
        console.error('Crawler failed:', err);
    } finally {
        await browser.close();
        console.log('Crawler finished.');
    }
}

crawlBlogs();
