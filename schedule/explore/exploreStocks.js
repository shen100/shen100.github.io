import bluebird from 'bluebird';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseLocalYMDString } from '../../src/modules/trade/util/date.js';
import { getAllStocks } from './allStocks.js';
import * as strategy1 from './strategy/strategy1.js';
import * as strategy2 from './strategy/strategy2.js';
import * as strategy3 from './strategy/strategy3.js';
import * as strategy4 from './strategy/strategy4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

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

let stocks = [];

(async function() {
    await client.connect();
    console.log('✅ 成功连接到 MongoDB');

    const db = client.db('mytrade');

    await bluebird.map(myItems, async function (stockData, index) {
        console.log('index', index);

        const klineDayCol = db.collection('kline_day');
        const stockKLine = await klineDayCol.findOne({ stockId: stockData.stockId });
        let startIndex = -1;
        let endIndex = -1;
        for (let i = 0; i < stockKLine.kList.length; i++) {
            if (stockKLine.kList[i].date >= startStr && startIndex < 0) {
                startIndex = i;
            }
            if (stockKLine.kList[i].date >= endStr && endIndex < 0) {
                endIndex = i + 1;
            }
        }
        endIndex = endIndex >= 0 ? endIndex : stockKLine.kList.length;
        let kList = stockKLine.kList.slice(startIndex, endIndex);

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.stockId,
            stockName: stockData.stockName
        }
       
        const stockDetailCol = db.collection('stock_detail');
        const stockDetail = await stockDetailCol.findOne({ stockId: stockData.stockId });

        if (!strategy1.detectTrend(kList, stockDetail).ok) {
            return;
        }

        stocks.push(theStock);
    }, { concurrency: 20 });

    try {
        let stocksStr = JSON.stringify(stocks, null, 4);
        fs.writeFileSync(path.join(__dirname, 'json', 'stocks_pool.json'), stocksStr, 'utf-8');
        console.log('✅ stocks_pool.json 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    } finally {
        await client.close();
    }
}());

