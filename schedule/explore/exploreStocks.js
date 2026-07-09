import bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestStockDetail, requestDayK } from './stockUtil.js';
import { parseLocalYMDString } from '../../src/modules/trade/util/date.js';
import { getAllStocks } from './allStocks.js';
import * as strategy1 from './strategy/strategy1.js';
import * as strategy2 from './strategy/strategy2.js';
import * as strategy3 from './strategy/strategy3.js';
import * as strategy4 from './strategy/strategy4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let myItems = getAllStocks();

const pastDate = new Date(new Date());
pastDate.setDate(pastDate.getDate() - 365);

// let startStr = '2025-07-03';
// let endStr = '2026-07-03';
let startStr = pastDate.toISOString().substring(0, 10); // 2025-07-01
let endStr = new Date().toISOString().substring(0, 10); // 2026-07-01
console.log('\nstartStr', startStr);
console.log('endStr', endStr, '\n');

let startDate = parseLocalYMDString(startStr);
let endDate = parseLocalYMDString(endStr);
let count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));

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
        let myKList = await requestDayK(dayJSONMap, stockData, startStr, endStr, count);

        let keyInMap = `${stockData.stockFullId}-${startStr}-${endStr}-${count}`;
        dayJSONMap[keyInMap] = myKList;

        let kListData = myKList.map((item) => {
            return { date: item[0], closePrice: item[2], highPrice: item[3] }
        });

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.stockId,
            stockName: stockData.stockName
        }

        let stockDetail = await requestStockDetail(stockDetailJSONMap, theStock);
        stockDetailJSONMap[stockData.stockFullId] = stockDetail;

        if (!strategy2.detectTrend(kListData, stockDetail).ok) {
            return;
        }

        stocks.push(theStock);
    }, { concurrency: 20 });

    try {
        let dayJSONMapStr = JSON.stringify(dayJSONMap, null, 4);
        fs.writeFileSync(path.join(__dirname, 'json', 'stock_day.json'), dayJSONMapStr, 'utf-8');
        console.log('✅ stock_day.json 文件写入成功');

        let stockDetailJSONMapStr = JSON.stringify(stockDetailJSONMap, null, 4);
        fs.writeFileSync(path.join(__dirname, 'json', 'stock_detail.json'), stockDetailJSONMapStr, 'utf-8');
        console.log('✅ stock_detail.json 文件写入成功');

        let stocksStr = JSON.stringify(stocks, null, 4);
        fs.writeFileSync(path.join(__dirname, 'json', 'stocks_pool.json'), stocksStr, 'utf-8');
        console.log('✅ stocks_pool.json 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    }
}());

