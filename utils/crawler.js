const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PDF } = require('../models/pdfModel'); // Assuming you have a PDF model defined
const downloadFolder = path.join(__dirname, "../downloads");

async function crawl() {
  try {
    // Step 1: Fetch initial list of GST notifications
    const gstResponse = await axios.get('https://cleartax.in/f/tax-library/latest/GST');
    const gstNotifications = gstResponse.data.results;

    // Step 2: Fetch initial list of Income Tax notifications
    const incomeTaxResponse = await axios.get('https://cleartax.in/f/tax-library/latest/IT');
    const incomeTaxNotifications = incomeTaxResponse.data.results;

    // Step 3: Process GST notifications
    await processNotifications(gstNotifications, 'GST');

    // Step 4: Process Income Tax notifications
    await processNotifications(incomeTaxNotifications, 'IT');

  } catch (error) {
    console.error('Error fetching PDF links:', error.message);
  }
}

async function processNotifications(notifications, taxType) {
  for (const notification of notifications) {
    try {
      // Fetch details using second API call
      const secondUrl = `https://cleartax.in/v/_next/data/qv2OfB477kVOgDEirwvXw/${taxType.toLowerCase()}/${notification.slug_title}.json`;
      console.log("secondUrl--------->",secondUrl);
      const secondResponse = await axios.get(secondUrl);
      const { postID, model } = secondResponse.data.pageProps;

      // Fetch PDF data using third API call
      const thirdUrl = `https://cleartax.in/f/tax-library/payload/${taxType.toUpperCase()}/NOTIFICATIONS/${notification.slug_title}`;
      const thirdResponse = await axios.get(thirdUrl);
      const { pdf_data_url } = thirdResponse.data.result;

      // Download PDF file
      await downloadPDF(notification.title, pdf_data_url);

      // Save PDF metadata to database (assuming PDF model is defined)
      await savePDFMetadata(notification.title, pdf_data_url, postID, model);

    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.error(`Status code 500: Internal server error for '${notification.title}' (${taxType})`);
        continue; // Skip to the next notification on error
      }
      console.error(`Error processing notification '${notification.title}' (${taxType}):`, error.message);
    }
  }
}

async function downloadPDF(title, pdfUrl) {
  try {
    const response = await axios({
      method: 'GET',
      url: pdfUrl,
      responseType: 'stream'
    });

    const filePath = path.join(downloadFolder, `${title}.pdf`);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading PDF for ${title}:`, error.message);
    throw error;
  }
}

async function savePDFMetadata(title, pdfUrl, postId, model) {
  try {
    // Check if PDF metadata already exists in the database
    const existingPDF = await PDF.findOne({ where: { title: title } });
    if (existingPDF) {
      //console.log(`PDF metadata for '${title}' already exists in the database.`);
      return; // Exit function if metadata already exists
    }

    // Generate file path based on downloadFolder and title
    const fileName = `${title}.pdf`;
    const filePath = path.join(downloadFolder, fileName);

    // Save PDF metadata to database using PDF model
    const pdf = new PDF({
      title: title,
      pdfUrl: pdfUrl,
      postId: postId,
      model: model,
      filePath: filePath // Assign filePath to the PDF model
    });

    await pdf.save();
    //console.log(`PDF metadata saved for ${title}`);
    
    // Emit event to socket when PDF is downloaded, if socket is connected
    if (global.socket) {
      global.socket.emit('pdfDownloaded', { title: title, downloadDate: new Date() });
    }

  } catch (error) {
    console.error(`Error saving PDF metadata for ${title}:`, error.message);
    throw error;
  }
}

module.exports = crawl;
