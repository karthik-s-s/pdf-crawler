# PDF Crawler and Manager

# Installation 

# 1) git clone https://github.com/karthik-s-s/pdf-crawler.git
``` cd pdf-crawler ```
# 2) insall dependency
``` npm install ```
# 3) Set up environment variables:
update values in .env file
``` 
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=pdf_crawler 
```

# 4) Database Configuration:
Ensure MySQL is installed and running.
Configure database settings in .env or adjust statically in models/pdfModel.js.

# 5) To start th app
### To start in development mode (with nodemon for auto-reloading)
``` 
npm start
npm run dev 
```

# 6)Access the application:
### Open your browser and go to http://localhost:3000 to view the application.
### Structure
```
pdf-crawler/
├── controllers/
│   └── pdfController.js
├── models/
│   └── pdfModel.js
├── routes/
│   └── pdfRoutes.js
├── services/
│   └── pdfService.js
├── utils/
│   └── crawler.js
├── server.js
├── .env
└── package.json
```