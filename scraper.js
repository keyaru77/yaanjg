const axios = require('axios');
const cheerio = require('cheerio');
const { CookieJar } = require('tough-cookie');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

axiosCookieJarSupport(axios);
const jar = new CookieJar();
const instance = axios.create({ jar });

const BASE_URL = 'https://nontonanimeid.cyou';

async function getOngoingAnime() {
    const response = await instance.get(BASE_URL);
    const $ = cheerio.load(response.data);

    const ongoingAnime = [];
    $('article.animeseries').each((i, element) => {
        const title = $(element).find('h3.title span').text();
        const url = $(element).find('div.sera a').attr('href');
        const img = $(element).find('div.sera img').attr('src');
        ongoingAnime.push({ title, url, img });
    });

    return ongoingAnime;
}

async function searchAnime(endpoint, page) {
    const response = await instance.get(`${BASE_URL}/page/${page}/?s=${endpoint}`);
    const $ = cheerio.load(response.data);

    const searchResults = [];
    $('div.result li').each((i, element) => {
        const title = $(element).find('h2').text();
        const url = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const description = $(element).find('div.descs').text().trim();
        const score = $(element).find('span.nilaiseries').text();
        const type = $(element).find('span.typeseries').text();
        const season = $(element).find('span.rsrated').text();
        const genres = $(element).find('span.genre').map((i, el) => $(el).text()).get();

        searchResults.push({ title, url, img, description, score, type, season, genres });
    });

    return searchResults;
}

async function getAnimeList(page) {
    const response = await instance.get(`${BASE_URL}/anime/page/${page}`);
    const $ = cheerio.load(response.data);

    const animeList = [];
    $('div.result li').each((i, element) => {
        const title = $(element).find('h2').text();
        const url = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const description = $(element).find('div.descs').text().trim();
        const score = $(element).find('span.nilaiseries').text();
        const type = $(element).find('span.typeseries').text();
        const season = $(element).find('span.rsrated').text();
        const genres = $(element).find('span.genre').map((i, el) => $(el).text()).get();

        animeList.push({ title, url, img, description, score, type, season, genres });
    });

    return animeList;
}

async function getAnimeByGenreAndSeason(genre, season, page) {
    let url;
    if (genre && season) {
        url = `${BASE_URL}/anime/page/${page}/?mode=&sort=series_skor&status=&type=&genre%5B%5D=${genre}&season%5B%5D=${season}`;
    } else if (genre) {
        url = `${BASE_URL}/anime/page/${page}/?mode=&sort=series_skor&status=&type=&genre%5B%5D=${genre}`;
    } else if (season) {
        url = `${BASE_URL}/anime/page/${page}/?mode=&sort=series_skor&status=&type=&season%5B%5D=${season}`;
    }

    const response = await instance.get(url);
    const $ = cheerio.load(response.data);

    const animeList = [];
    $('div.result li').each((i, element) => {
        const title = $(element).find('h2').text();
        const url = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const description = $(element).find('div.descs').text().trim();
        const score = $(element).find('span.nilaiseries').text();
        const type = $(element).find('span.typeseries').text();
        const season = $(element).find('span.rsrated').text();
        const genres = $(element).find('span.genre').map((i, el) => $(el).text()).get();

        animeList.push({ title, url, img, description, score, type, season, genres });
    });

    return animeList;
}

async function getSchedule() {
    const response = await instance.get(`${BASE_URL}/jadwal-rilis/`);
    const $ = cheerio.load(response.data);

    const schedule = {};
    for (let i = 1; i <= 7; i++) {
        const day = $(`ul.tabs li[data-tab="tab-${i}"]`).text().trim();
        schedule[day] = [];
        $(`#tab-${i} div.result li`).each((j, element) => {
            const title = $(element).find('h2').text();
            const url = $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');
            const totalEpisodes = $(element).find('p.tagpst1 span.dashicons-plus-alt').parent().text().trim();
            const updateTime = $(element).find('p.tagpst1 span.dashicons-clock').parent().text().trim();
            const score = $(element).find('span.nilaiseries').text();
            const type = $(element).find('span.typeseries').text();
            const genres = $(element).find('span.genre').map((i, el) => $(el).text()).get();

            schedule[day].push({ title, url, img, totalEpisodes, updateTime, score, type, genres });
        });
    }

    return schedule;
}

async function getEpisodeDetails(endpoint) {
    const response = await instance.get(`${BASE_URL}/episode/${endpoint}`);
    const $ = cheerio.load(response.data);

    const episodeDetails = [];
    $('div.eplists li').each((i, element) => {
        const title = $(element).find('span.lchx').text();
        const url = $(element).find('a').attr('href');
        const releaseDate = $(element).find('span.dt').text();
        episodeDetails.push({ title, url, releaseDate });
    });

    return episodeDetails;
}

module.exports = {
    getOngoingAnime,
    searchAnime,
    getAnimeList,
    getAnimeByGenreAndSeason,
    getSchedule,
    getEpisodeDetails
};
