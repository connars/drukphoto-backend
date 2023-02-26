const http = require("http");
const path = require("path");
const express = require("express");
const multer = require("multer");
// import cors from "cors";
const app = express();

// app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("photos"), function (req, res) {
  const phone = req.body.phone;
  const { name, surname, email } = req.body;
  if (!phone) {
    res.status(400).send("Phone number is missing in the request body");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const dir = `uploads/${date}/${phone}/`;

  fs.mkdirSync(dir, { recursive: true });
  const promises = req.files.map((file) => {
    const oldPath = `temp/${file.filename}`;
    const newPath = `${dir}/${file.originalname}`;
    // const newPath = path.join(dir, file.originalname);
    return fs.promises.rename(oldPath, newPath);
  });
  console.log(promises);
  Promise.all(promises)
    .then(() => {
      console.log(
        `Name: ${name}, Surname: ${surname}, Email: ${email}, Phone: ${phone}`
      );
      res.send("Files uploaded successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error uploading files");
    });
});

app.post("/crm-add", async (req, res) => {
  try {
    let { name, surname, mail, phone, price, delivery, adress } = req.body;

    if (!(name && surname && mail && phone && price && delivery && adress)) {
      throw Error("void data");
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "_csrf=SLYAcwTTqVHsCmG-Sy8pg13Zj-CiYPAN");

    let raw = JSON.stringify({
      form: "DKooe-JJggzbJC-sfXadyfYJdFk3r9eyulTnIE7yeI8JyJf7dHeEJjToaemPWwmiv2sdJp",
      getResultData: "1",
      fName: name,
      lName: surname,
      phone: phone,
      email: mail,
      products: [
        {
          id: "1",
          name: "Фотография",
          costPerItem: price,
          amount: price,
          description: "Фотография красивая",
        },
      ],
      payment_method: "Карта",
      shipping_method: delivery,
      shipping_address: adress,
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    let data = await fetch(
      "https://fotka.salesdrive.me/handler/",
      requestOptions
    );
    data = await data.json();

    res.status(200).json({
      status: 200,
      message: data,
    });
  } catch (error) {
    res.status(400).json({ status: 400, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`server start ${port}`);
});
