'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user:<password>@cluster0-oifw0.mongodb.net/test?retryWrites=true&w=majority"
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// mongodb Atlas setup
MongoClient.connect(uri, (err, client) => {
  if (err) {
    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
  }
  console.log('Connected...');
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// your first API endpoint... 
app.get("/api/hello", (req, res) => {
  res.json({
    greeting: 'hello API'
  });
});

const urlSchema = new Schema({
  originalUrl: String,
  shorterUrl: String
});

const shortUrl = mongoose.model('shortUrl', urlSchema);


app.post('/api/shorturl/new', (req, res) => {
  // const urlToShorten = req.body.url;
  const pattern = /www\.([A-Za-z])+\.([A-Za-z]{2,})+/;
  if (pattern.test(req.body.url) === true) {
     const urls = new shortUrl({
      originalUrl: req.body.url,
      shorterUrl: Math.floor(Math.random() * 50000)
    });

    urls.save(err => {
      if (err) {
        return res.send("Error saving to database");
      }
    });

    return res.json({
      urls
    });
  }
  const data = new shortUrl({
    originalUrl: req.body.url,
    shorterUrl: "Invalid URL"
  });
  return res.json({
    data
  });

});

//to original url
app.get('/api/shorturl/:urlToForward', (req, res, next) => {
  const shorterUrl = String(req.params.urlToForward
)
  shortUrl.findOne({
    'shorterUrl': shorterUrl
  }, (err, data) => {
    if (data === null) {
      return res.json({error: "invalid URL"})
    } else {
      res.redirect(data.originalUrl)
    }
  });
});

app.listen(port, () => {
  console.log(`Node.js listening on port ${PORT}`);
});