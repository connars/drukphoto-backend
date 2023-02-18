const http = require('http');
const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const hostname = '127.0.0.1';
const port = 1228;
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  
  app.post('/upload', upload.array('photos'), function (req, res) {
    const files = req.files;
    const filePaths = files.map(file => `${file.destination}${file.filename}`);
    Promise.all(
      files.map(file => fs.promises.rename(file.path, `${file.destination}${file.filename}`))
    ).then(() => {
      res.send('Files uploaded successfully');
    }).catch(err => {
      console.log(err);
      res.status(500).send('Error uploading files');
    });
  });
const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});