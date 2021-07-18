const express = require('express')
const fs = require('fs')
const csv = require('csv')

var app = express()
var record = ['0' * 20]
let map = []

// the __dirname is the location of index.js
const fsPromises = fs.promises;
async function loadMap() {
    try {
        // STEP 1: 讀取 CSV 檔
        const inputFile = __dirname + '/res/map02.csv'
        const input = await fsPromises.readFile(inputFile)

        // STEP 2：建立讀出 CSV 用的陣列和 parser
        const parser = csv.parse({ delimiter: ',' })

        // STEP 3-1：建立對應事件 - 讀取資料
        parser.on('readable', function () {
            while ((record = parser.read())) {
                map.push(record);
            }
        })

        // STEP 3-2：錯誤處理
        parser.on('error', function (err) {
            console.error(err.message)
        })

        // STEP 3-3：取得最後 output 的結果
        parser.on('end', function () {
            console.log('total records:', map.length)
        })

        // STEP 4：放入預備讀取的內容
        parser.write(input)

        // STEP 5：關閉 readable stream
        parser.end()
    } catch (error) {
        console.log('error', error)
    }
}
loadMap()

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
const port = process.env.PORT || 3000

app.listen(port, function () {
    let str = 'app listening on port ' + port + '!'
    console.log(str)
})
