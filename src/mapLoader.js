// back-end side module to read map0x.csv
const fs = require('fs')
const csv = require('csv')

const fsPromises = fs.promises
let map = []
let record = []

async function loadMap(inputFile, calbak) {
    try {
        // STEP 1: 讀取 CSV 檔
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
            calbak(map)
        })

        // STEP 4：放入預備讀取的內容
        parser.write(input)

        // STEP 5：關閉 readable stream
        parser.end()
    } catch (error) {
        console.log('error', error)
    }
}

exports.queryMap = function queryMap(input, calbak) {
    loadMap(input, calbak)
}
