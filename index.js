const express = require('express')
const {queryMap} = require('./src/mapLoader.js') 

var app = express()

var map = []
const inputMap = __dirname + '/res/map/map00.csv'
queryMap(inputMap, (response)=> {
    map = response
})

app.get('/', function (req, res) {
    console.log(req.url)
    res.sendFile(__dirname + '/index.html')
})

// RESTful GET to get map
app.get("/map", (req, res) => {
    console.log(req.url)
    try {
        res.json(map)
    } catch (e) {
        console.error(e)
    }
});

// any other get requests (files)
app.get('/*', function (req, res) {
    console.log(req.url);
    res.sendFile(__dirname + req.url)
})


//port 號會由 Heroku 給予，因此不再自行指定
const port = process.env.PORT || 5000

app.listen(port, function () {
    let str = 'app listening on port ' + port + '!'
    console.log(str)
})
