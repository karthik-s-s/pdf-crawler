const { PDF } = require('../models/pdfModel');
const { startCrawl } = require('../services/pdfService');

const getPDFs = async (req, res) => {
  const pdfs = await PDF.findAll();
  res.json(pdfs);
};

const manualCrawl = (req, res) => {
  startCrawl();
  res.send('Crawling started manually');
};

module.exports = { getPDFs, manualCrawl };
