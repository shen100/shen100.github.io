import bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import * as defaultLogger from '../../util/logger.js';
import * as strategy1 from './strategy1.js';
import * as strategy2 from './strategy2.js';
import * as strategy3 from './strategy3.js';
import * as strategy4 from './strategy4.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

let startStr = '2025-01-01';
let endStr = new Date().toISOString().substring(0, 10); // 2026-07-01
console.log('\nstartStr', startStr);
console.log('endStr', endStr, '\n');

async function runTask(myItems, option) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    let myStrategy = null;
    if (option.strategy === 'tradeStocksByStrategy1') {
        myStrategy = strategy1;
    } else if (option.strategy === 'tradeStocksByStrategy2') {
        myStrategy = strategy2;
    } else if (option.strategy === 'tradeStocksByStrategy3') {
        myStrategy = strategy3;
    }

    let stocks = [];

    await bluebird.map(myItems, async function (stockData, index) {
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

        if (!myStrategy.detectTrend(kList, stockData).ok) {
            return;
        }

        stocks.push(theStock);
    }, { concurrency: 20 });

    return stocks;
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        const db = await mongo.getDB();
        let startTime = Date.now();

        let logMsg = '开始执行';
        console.log(logMsg);
        logger.info(logMsg);

        let myItems = await stockService.getAllStocksFromDB();

        const finalStocks = await runTask(myItems, option);

        let endTime = Date.now();
        logMsg = `总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);

        const taskExecCol = db.collection('task_exec_history');
        const createdAt = new Date();
        await taskExecCol.insertOne({
            taskName: option.strategy,
            createdAt
        });
        return {
            createdAt,
            finalStocks
        };
    } catch (err) {
        console.error('❌ 写入失败:', err);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

/**
 * 根据指定的策略筛选股票，可以用 startStr, endStr 来指定时间段
 */
if (isMain) {
    await exec();
}