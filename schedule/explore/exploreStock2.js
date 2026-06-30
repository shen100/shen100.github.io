import bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestStockDetail, requestDayK, requestMonthK } from './stockUtil.js';
import { parseLocalYMDString } from '../../src/modules/trade/util/date.js';
import { allStocksRes } from './json/allStocks.js';
import * as strategy1 from './strategy/strategy1.js';
import * as strategy2 from './strategy/strategy2.js';
import * as strategy3 from './strategy/strategy3.js';
import * as strategy4 from './strategy/strategy4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let fields = allStocksRes.data.fields;
let myItems = [];

for (let i = 0; i < allStocksRes.data.items.length; i++) {
    let myItem = {};
    let item = allStocksRes.data.items[i];
    for (let j = 0; j < fields.length; j++) {
        myItem[fields[j]] = item[j];
        let arr = myItem.ts_code.split('.');
        myItem.stockFullId = arr[1].toLowerCase() + arr[0];
    }
    myItems.push(myItem);
}

console.log('myItems', myItems[myItems.length - 1]);

let startStr = '2025-01-01';
let endStr = new Date().toISOString().substring(0, 10);
console.log();
console.log('startStr', startStr);
console.log('endStr', endStr);
console.log();

let startDate = parseLocalYMDString(startStr);
let endDate = parseLocalYMDString(endStr);
let count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));

function convertKListToNumbers(myKList) {
    for (let i = 0; i < myKList.length; i++) {
        myKList[i][1] = Number(myKList[i][1]);
        myKList[i][2] = Number(myKList[i][2]);
        myKList[i][3] = Number(myKList[i][3]);
        myKList[i][4] = Number(myKList[i][4]);
        myKList[i][5] = Number(myKList[i][5]);
    }
}

let stocks = [];

(async function() {
    let dayJSONMap = {};
    let stockDetailJSONMap = {};
    try {
        let dayJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'stock_day.json'), 'utf-8');
        dayJSONMap = JSON.parse(dayJSONStr);

        let stockDetailJSONStr = fs.readFileSync(path.join(__dirname, 'json', 'stock_detail.json'), 'utf-8');
        stockDetailJSONMap = JSON.parse(stockDetailJSONStr);
    } catch (err) {
        console.log(err);
    }

    await bluebird.map(myItems, async function (stockData, index) {
        console.log(index, 'requestDayK\n');
        // console.log('stockData', stockData);
        let myKList = await requestDayK(dayJSONMap, stockData, startStr, endStr, count);
        convertKListToNumbers(myKList);

        let keyInMap = `${stockData.stockFullId}-${startStr}-${endStr}-${count}`;
        dayJSONMap[keyInMap] = myKList;

        let highPriceDate = '';
        let highPriceInAll = 0;

        let kListData = myKList.map((item) => {
            if (item[3] > highPriceInAll) {
                highPriceInAll = item[3];
                highPriceDate = item[0];
            }
            return { date: item[0], closePrice: item[2], highPrice: item[3] }
        });

        if (kListData.length < 100) {
            return;
        }

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.symbol,
            stockName: stockData.name
        }

        let stockDetail = await requestStockDetail(stockDetailJSONMap, theStock);
        stockDetailJSONMap[stockData.stockFullId] = stockDetail;

        if (!strategy2.detectTrend(kListData, stockDetail).ok) {
            return;
        }

        stocks.push(theStock);
    }, { concurrency: 20 });

    // console.log('stocks', JSON.stringify(stocks));

    try {
        fs.writeFileSync( path.join(__dirname, 'json', 'stock_day.json'), JSON.stringify(dayJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');

        fs.writeFileSync( path.join(__dirname, 'json', 'stock_detail.json'), JSON.stringify(stockDetailJSONMap, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');

        fs.writeFileSync( path.join(__dirname, 'json', 'stocks_pool.json'), JSON.stringify(stocks, null, 2), 'utf-8');
        console.log('✅ 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    }
}());

