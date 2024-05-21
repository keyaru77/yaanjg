const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const BASE_URL = "https://v4.animasu.cc/";

const scrapePage = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = [];

        $('div.bixbox div.bs').each((index, element) => {
            const el = $(element);
            const ar = el.find('a').first();
            const ttr = ar.find('div.tt').first().text();
            const hrefr = ar.attr('href');
            const slugr = hrefr.split('/').pop();
            const typezr = el.find('div.typez').first().text();
            const imgr = ar.find('img').first().attr('data-src');
            const epxr = el.find('span.epx').first().text();

            data.push({
                tt: ttr,
                slug: slugr,
                typez: typezr,
                img: imgr,
                epx: epxr,
            });
        });

        return data;
    } catch (error) {
        throw new Error(`Failed to scrape page: ${error.message}`);
    }
};

const animeDetails = async (slug) => {
    try {
        const url = `${BASE_URL}/anime/${slug}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = [];

        $('div.bigcontent').each((index, element) => {
            const el = $(element);
            const img = el.find('div.thumb img:first-child').attr('data-src');
            const title = el.find('div.infox h1').text().trim();
            const name = el.find('div.infox span.alter').text().trim();
            const status = el.find('div.infox div.spe span b:contains("Status:")').first().parent().text().replace('Status: ', '');
            const type = el.find('div.infox div.spe span b:contains("Jenis:")').first().parent().text().replace('Jenis: ', '');
            const release = el.find('div.infox div.spe span b:contains("Rilis:")').first().parent().text().replace('Rilis: ', '');
            const duration = el.find('div.infox div.spe span b:contains("Durasi:")').first().parent().text().replace('Durasi: ', '');
            const synopsis = $('div.sinopsis p:first-child').text().trim();
            const episodes = [];
            const genres = [];
            const characterTypes = [];

            el.find('div.infox div.spe span b:contains("Genre:")').parent().find('a').each((index, element) => {
                genres.push({
                    genre: $(element).text() || null,
                    slug: $(element).attr('href').split('/')[4] || null
                });
            });

            el.find('div.infox div.spe span#tikar_shw b:contains("Karakter:")').parent().find('a').each((index, element) => {
                characterTypes.push({
                    type: $(element).text() || null,
                    slug: $(element).attr('href').split('/')[4] || null
                });
            });

            $('div.bixbox ul#daftarepisode li').each((index, element) => {
                episodes.push({
                    episode: $(element).find('span.lchx a').text().trim(),
                    slug: $(element).find('span.lchx a').attr('href').split('/')[3],
                });
            });

            data.push({
                img: img || null,
                title: title || null,
                name: name || null,
                status: status || null,
                release: release || null,
                duration: duration || null,
                type: type || null,
                synopsis: synopsis || null,
                genres: genres || null,
                characterTypes: characterTypes || null,
                episodes: episodes || null
            });
        });

        return data;
    } catch (error) {
        throw new Error(`Failed to scrape page: ${error.message}`);
    }
};

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "Selamat datang di API Animasu Scraper!",
        endpoints: {
            ongoing: "/ongoing",
            genre: "/genre/:endpoint/:page",
            daftaranime: "/daftaranime/:page",
            cari: "/cari?s=:endpoint",
            anime: "/anime/:endpoint"
        }
    });
});

app.get('/ongoing', async (req, res) => {
    const url = `${BASE_URL}`;
    try {
        const data = await scrapePage(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/genre/:endpoint/:page', async (req, res) => {
    const endpoint = req.params.endpoint;
    const page = req.params.page || '1';
    const url = `${BASE_URL}/pencarian/?genre%5B0%5D=${endpoint}&status=&tipe=&urutan=default&halaman=${page}`;
    try {
        const data = await scrapePage(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/daftaranime/:page', async (req, res) => {
    const page = req.params.page || '1';
    const url = `${BASE_URL}/pencarian/?urutan=abjad&halaman=${page}`;
    try {
        const data = await scrapePage(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/cari', async (req, res) => {
    const endpoint = req.query.s;
    const url = `${BASE_URL}/?s=${endpoint}`;
    try {
        const data = await scrapePage(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/anime/:endpoint', async (req, res) => {
    const endpoint = req.params.endpoint;
    try {
        const data = await animeDetails(endpoint);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on
