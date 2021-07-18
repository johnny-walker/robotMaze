
const express = require('express')

var app = express()

// the __dirname is the location of index.js
app.get('/', function (req, res) {
    console.log(req.url)
    res.sendFile(__dirname + '/' + 'index.html')
})

// any other get requests (files)
app.get('/*', function (req, res) {
    console.log(req.url);
    res.sendFile(__dirname + req.url)
})

//port 號會由 Heroku 給予，因此不再自行指定
const port = process.env.PORT || 3000;

app.listen(port, function () {
  let str = 'app listening on port ' + port + '!'
  console.log(str)
})