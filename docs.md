Create a Node.js + Express backend API.
Define a GET route at `/search-song?song=...` where the `song` query can be an artist name, song title, or album.
The API should:

- Search the internet for songs based on the query
- Scrape or find downloadable audio links (e.g., `.mp3`)
- Return a JSON response like:

  ```json
  {
    "results": [
      "https://website1.com/song1.mp3",
      "https://website2.co.in/song2.mp3",
      "https://website3.co.in/song2.mp3"
    ]
  }
  ```

Use `axios` or `node-fetch` for HTTP requests and `cheerio` for scraping if needed.
Include proper error handling and status codes.
Ensure the code is self-contained and runnable, with all dependencies declared at the top.
