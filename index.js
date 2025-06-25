// song-search-api/index.js

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to extract the real URL from DuckDuckGo redirect links
function extractRealUrl(duckUrl) {
    try {
        // Example: //duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.example.com&rut=...
        const match = duckUrl.match(/[?&]uddg=([^&]+)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
    } catch (e) {
        console.log('Failed to extract real URL:', e.message);
    }
    return null;
}

// Helper function to search and scrape for audio links (mp3, mp4, m4a) from search results
async function searchAndScrapeAudioLinks(query) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query + ' song '+ ' mp3 mp4 m4a download')}`;
    try {
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        // console.log('data : ' + data);
        const $ = cheerio.load(data);
        const resultLinks = [];
        // DuckDuckGo result links have class 'result__a' or are inside '.result__url'
        $('a.result__a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('/y.js')) {
                const realUrl = extractRealUrl(href);
                if (realUrl) resultLinks.push(realUrl);
            }
        });
        console.log('DuckDuckGo real result links:', resultLinks);
        const audioLinks = [];
        for (let i = 0; i < resultLinks.length && audioLinks.length < 50; i++) {
            const url = resultLinks[i];
            try {
                const page = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const $$ = cheerio.load(page.data);
                $$('a').each((_, a) => {
                    let ahref = $$(a).attr('href');
                    if (
                        ahref &&
                        (ahref.match(/\.(mp3|mp4|m4a)($|\?)/i) ||
                            ahref.match(/\/download\//i))
                    ) {
                        // Convert relative to absolute
                        if (!ahref.startsWith('http')) {
                            try {
                                ahref = new URL(ahref, url).href;
                            } catch (e) { }
                        }
                        audioLinks.push(ahref);
                    }
                });
                // Also check for <audio> and <source> tags
                $$('audio, source').each((_, tag) => {
                    let src = $$(tag).attr('src');
                    if (
                        src &&
                        (src.match(/\.(mp3|mp4|m4a)($|\?)/i) ||
                            src.match(/\/download\/type/i) ||
                            src.match(/\/download\//i))
                    ) {
                        // Convert relative to absolute
                        if (!src.startsWith('http')) {
                            try {
                                src = new URL(src, url).href;
                            } catch (e) { }
                        }
                        audioLinks.push(src);
                    }
                });
            } catch (err) {
                console.log('Error scraping', url, err.message);
            }
        }
        // Remove duplicates and limit to 50 results
        let uniqueLinks = [...new Set(audioLinks)];
        console.log('Found audio links:', uniqueLinks);
        // Sort links by priority: 1. song query, 2. pagalworld, 3. raagmad, 4. jio, 5. /download/type, 6. /download/
        function getPriority(link) {
            const lower = link.toLowerCase();
            if (lower.includes('pagalworld')) return 1;
            if (lower.includes('raagmad')) return 2;
            if (lower.includes('pagaiworld')) return 3;
            if (lower.includes('musify')) return 4;
            if (lower.includes('jio')) return 5;
            if (lower.includes(query.toLowerCase())) return 6;
            
            if (/\/download\//i.test(lower)) return 7;
            return 7;
        }
        uniqueLinks = uniqueLinks.sort((a, b) => getPriority(a) - getPriority(b));
        return uniqueLinks;
    } catch (err) {
        console.log('Failed to search or scrape results:', err.message);
        throw new Error('Failed to search or scrape results.');
    }
}

app.get('/', async (req, res) => {
    return res.status(200).json({ msg: 'working' });
});

app.get('/search-song', async (req, res) => {
    console.log('inside /search-song');
    const songQuery = req.query.song;
    if (!songQuery) {
        return res.status(400).json({ error: 'Missing song query parameter.' });
    }
    try {
        console.log('calling fxn searchAndScrapeAudioLinks');

        const results = await searchAndScrapeAudioLinks(songQuery);
        console.log('result length: ' + results.length);


        if (results.length === 0) {
            return res.status(404).json({ results: [] });
        }

        res.json({ total: results.length, results });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Song search API running on port ${PORT}`);
});

// Dependencies:
// npm install express axios cheerio
