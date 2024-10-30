/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.

Name: Jaidev Panchal
Student ID: 115682239
Date: 09/10/2024
Replit Web App URL: https://replit.com/@jnpanchal/Web322-app
GitHub Repository URL: https://github.com/jaidevpan/Web322-app
********************************************************************************/
const express = require('express');
const app = express();
const storeService = require('./store-service');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const PORT = process.env.PORT || 8080;
cloudinary.config({
  cloud_name: 'dgen5lfsi',
  api_key: '538496142288271',
  api_secret: 'qQzQRSAgze6McUkBuug7jnR3u3c',
  secure: true
  })

// Multer configuration (no disk storage)
const upload = multer();

// Serving static files
app.use(express.static('public'));
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Route to about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
  });
  

// Redirect root to /about
app.get('/', (req, res) => {
    res.redirect('/about');
});


// Route to fetch all published items for /shop
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  });
  
  
  // Route to fetch all items for /items
  app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  });
  
  
  // Route to fetch all categories for /categories
  app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  });
  // to add new route to add itmes
  app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
  });

  // POST /items/add route to handle item creation
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    }).catch((error) => {
      console.error('Upload failed:', error);
      res.status(500).send('Failed to upload image');
    });
  } else {
    processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then(() => {
      res.redirect('/items');
    }).catch((err) => {
      res.status(500).send('Failed to add item');
    });
  }
});

// Route to fetch all items with optional filters
app.get('/items', (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    storeService.getItemsByCategory(category)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  } else if (minDate) {
    storeService.getItemsByMinDate(minDate)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  } else {
    storeService.getAllItems()
      .then((data) => res.json(data))
      .catch((err) => res.status(500).json({ message: err }));
  }
});
// Route to fetch a single item by ID
app.get('/item/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  storeService.getItemById(id)
    .then((data) => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).send('Item not found');
      }
    })
    .catch((err) => res.status(500).json({ message: err }));
});

  
  
  // Handle non-matching routes (404)
  app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });
  
  // Initialize the store service and then start the server
storeService.initialize()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
  });
})
.catch((err) => {
  console.log("Failed to initialize the store: " + err);
});
