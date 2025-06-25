# Song Search API

A Node.js + Express backend API to search for downloadable audio links (mp3, mp4, m4a) from the internet based on a song, artist, or album query.

## Features

- GET route at `/search-song?song=...` where the `song` query can be an artist name, song title, or album.
- Scrapes the web for downloadable audio links and common download patterns.
- Returns a JSON response with up to 50 results, prioritized by relevance and popular sources.
- Uses `axios` for HTTP requests and `cheerio` for HTML parsing.
- Handles relative and absolute URLs.
- Includes error handling and debugging logs.

## Usage

### 1. Install dependencies

```bash
npm install express axios cheerio
```

### 2. Start the server

```bash
node index.js
```

### 3. Example request

```
GET http://localhost:3000/search-song?song=your+song+name
```

### 4. Example response

```json
{
  "total": 3,
  "results": [
    "https://website1.com/song1.mp3",
    "https://website2.co.in/song2.mp4",
    "https://website3.co.in/download/pathaan.mp4"
  ]
}
```

## How it works

- Uses DuckDuckGo to search for audio download links.
- Extracts real URLs from DuckDuckGo redirect links.
- Visits each result page and scrapes for links ending in `.mp3`, `.mp4`, `.m4a`, or matching `/download/type` and `/download/` patterns.
- Converts relative links to absolute URLs.
- Sorts results by query match, popular sites (pagalworld, raagmad, jio), and download patterns.

## Notes

- This API is for educational/demo purposes. Web scraping may violate the terms of service of some sites.
- Results depend on the structure of third-party websites and may vary.

## License

MIT
