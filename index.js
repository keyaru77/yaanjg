const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const scraper = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

app.get('/ongoing', async (req, res) => {
    try {
        const data = await scraper.getOngoingAnime();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/search/:endpoint/:page', async (req, res) => {
    try {
        const { endpoint, page } = req.params;
        const data = await scraper.searchAnime(endpoint, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/daftar/:page', async (req, res) => {
    try {
        const { page } = req.params;
        const data = await scraper.getAnimeList(page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/animeid/:genre/:season/:page', async (req, res) => {
    try {
        const { genre, season, page } = req.params;
        const data = await scraper.getAnimeByGenreAndSeason(genre, season, page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/jadwal', async (req, res) => {
    try {
        const data = await scraper.getSchedule();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/episode/:endpoint', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const data = await scraper.getEpisodeDetails(endpoint);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
        
