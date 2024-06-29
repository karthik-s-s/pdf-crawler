const express = require('express');
const { getPDFs, manualCrawl } = require('../controllers/pdfController');

const router = express.Router();

router.get('/pdfs', getPDFs);
router.post('/crawl', manualCrawl);

module.exports = router;
