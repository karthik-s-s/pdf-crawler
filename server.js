const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io');
const pdfRoutes = require('./routes/pdfRoutes');
const { sequelize } = require('./models/pdfModel');
const { startCrawl } = require('./services/pdfService');
const nodeCron = require('node-cron');
const http = require('http');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Global variable to hold the socket instance
global.socket = null;

app.use(bodyParser.json());

// Serve static files from the correct directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve socket.io.js from node_modules
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../node_modules/socket.io/client-dist/socket.io.js'));
});

// Correct path to the downloads directory
const downloadFolder = path.join(__dirname, 'downloads');
app.use('/downloads', express.static(downloadFolder));

app.use('/api', pdfRoutes);

// Correct path to the index.html file
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

      // Schedule the crawl to run every day at midnight
      nodeCron.schedule('0 0 * * *', startCrawl);// midnight 00
      //nodeCron.schedule('*/20 * * * * *', startCrawl);//50 sec
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// WebSocket server handling
io.on('connection', (socket) => {
  console.log('A client connected');

  // Store the socket instance globally
  global.socket = socket;

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    global.socket = null;
  });

  // Start the crawling process when a client connects
  startCrawl();
});
