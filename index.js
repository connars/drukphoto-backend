const http = require('http');
const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const hostname = '127.0.0.1';
const port = 1228;
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, res, cb) {
      const date = new Date().toISOString().slice(0, 10);
      const dir = `uploads/${date}/`;
      const phoneDir = `${dir}folder/`;
      fs.mkdir(phoneDir, { recursive: true }, function (err) {
        if (err) {
          console.log(err);
          cb(err, null);
        } else {
          cb(null, phoneDir);
        }
      });
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
app.post('/upload', upload.array('photos'), function (req, res) {
    const phone = req.body.phone;
    console.log(phone);
    const files = req.files;
    const filePaths = files.map(file => `${file.destination}${file.filename}`);
    Promise.all(
      files.map(file => fs.promises.rename(file.path, `${file.destination}${file.filename}`))
    ).then(() => {
      const { name, surname,  email} = req.body;
      if (!phone) {
        res.status(400).send('Phone number is missing in the request body');
        return;
      }
      const photoData = files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));
     
      console.log(`Name: ${name}, Surname: ${surname}, Email: ${email}, Phone: ${phone}`);
      console.log(photoData);

      const date = new Date().toISOString().slice(0, 10);
      const dir = `uploads/${date}/`;
      const oldPhoneDir = `${dir}folder/`;
      const newPhoneDir = `${dir}${phone}/`;

      if (fs.existsSync(newPhoneDir)) {
        console.log(`Folder ${newPhoneDir} already exists`);
        res.send('Files uploaded successfully');
        return;
      }

      fs.rename(oldPhoneDir, newPhoneDir, function(err) {
        if (err) {
          console.log(err);
          res.status(500).send('Error renaming folder');
        } else {
          console.log(`Folder renamed to ${phone}`);
          res.send('Files uploaded successfully');
        }
      });

    }).catch(err => {
      console.log(err);
      res.status(500).send('Error uploading files');
    });
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
