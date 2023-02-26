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
    cb(null, 'temp/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.array('photos'), function(req, res) {
  const phone = req.body.phone;
  const { name, surname, email } = req.body;
  if (!phone) {
    res.status(400).send('Phone number is missing in the request body');
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const dir = `uploads/${date}/${phone}/`;

  fs.mkdirSync(dir, { recursive: true });

  const promises = req.files.map(file => {
 
    const oldPath = `temp/${file.filename}`;
    const newPath = `${dir}/${file.originalname}`;
    // const newPath = path.join(dir, file.originalname);
    return fs.promises.rename(oldPath, newPath);
  });
  console.log(req.files[0]);
  Promise.all(promises).then(() => {
    console.log(`Name: ${name}, Surname: ${surname}, Email: ${email}, Phone: ${phone}`);
    res.send('Files uploaded successfully');
  }).catch(err => {
    console.error(err);
    res.status(500).send('Error uploading files');
  });
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});