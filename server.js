'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// let uri = 'mongodb+srv://<USERNAME>:' + process.env.PW + '@xxxxxx.xxxxx.mongodb.net/<DATABASE>?retryWrites=true&w=majority'


// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user3:" + process.env.PW + "@cluster0.hq0up.mongodb.net/Cluster0?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});




// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser');
const { response } = require('express');
let responseObject = {}

app.post('/api/shorturl/new',
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let inputURL = req.body['url']

    let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)

    if (!inputURL.match(urlRegex)) {
      response.json({ error: 'Invalid URL' })
      return

    }

    responseObject['original_url'] = inputURL

    let inputShort = 1
    Url.findOne({})
      .sort({ short: 'desc' })
      .exec((err, res) => {
        if (!err && res != undefined) {
          inputShort = res.short + 1
        }
        if (!err) {
          Url.findOneAndUpdate(
            { original: inputURL },
            { original: inputURL, short: inputShort },
            { new: true, upsert: true },
            (err, saved) => {
              if (!err) {
                responseObject['short_url'] = saved.short
                response.json(responseObject)
              }
            }
          )
        }
      })


    // res.json(responseObject)
  })

app.get('/api/shorturl/:input', (req, res) => {
  let input = request.params.input

  Url.findOne({ short: input }, (err, res) => {
    if (!err && res != undefined) {
      res.redirect(res.original)
    } else {
      res.json('URL NOT FOUND')
    }
  })
})
