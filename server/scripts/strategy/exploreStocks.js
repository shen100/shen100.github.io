import bluebird from 'bluebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import * as strategy1 from './strategy1.js';
import * as strategy2 from './strategy2.js';
import * as strategy3 from './strategy3.js';
import * as strategy4 from './strategy4.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await mongo.getDB();

let myItems = await stockService.getAllStocksFromDB();

let startStr = '2025-01-01';
let endStr = new Date().toISOString().substring(0, 10); // 2026-07-01
console.log('\nstartStr', startStr);
console.log('endStr', endStr, '\n');

let stocks = [];

/**
 * 根据指定的策略筛选股票，可以用 startStr, endStr 来指定时间段
 */
(async function() {
    await bluebird.map(myItems, async function (stockData, index) {
        console.log('index', index);

        const klineDayCol = db.collection('kline_day');
        const stockKLine = await klineDayCol.findOne({ stockFullId: stockData.stockFullId });
        let startIndex = -1;
        let endIndex = -1;
        for (let i = 0; i < stockKLine.kList.length; i++) {
            if (stockKLine.kList[i].date >= startStr && startIndex < 0) {
                startIndex = i;
            }
            if (stockKLine.kList[i].date > endStr && endIndex < 0) {
                endIndex = i; // slice(start, end) 不包括 end，所以 date > endStr
            }
        }
        endIndex = endIndex >= 0 ? endIndex : stockKLine.kList.length;
        let kList = stockKLine.kList.slice(startIndex, endIndex);

        let theStock = {
            stockFullId: stockData.stockFullId,
            stockId: stockData.stockId,
            stockName: stockData.stockName
        }

        if (!strategy1.detectTrend(kList, stockData).ok) {
            return;
        }

        stocks.push(theStock);
    }, { concurrency: 20 });

    try {
        let stocksStr = JSON.stringify(stocks, null, 4);
        fs.writeFileSync(path.join(__dirname, '../../tmp', 'stocks_by_strategy.json'), stocksStr, 'utf-8');
        console.log('✅ stocks_by_strategy.json 文件写入成功');
    } catch (err) {
        console.error('❌ 写入失败:', err);
    } finally {
        await mongo.close();
    }
}());

