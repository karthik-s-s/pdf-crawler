const crawl = require('../utils/crawler');

async function startCrawl() {
  try {
    await crawl();
  } catch (error) {
    console.error('Error during crawling:', error.message);
  }
}

module.exports = {
  startCrawl,
};
