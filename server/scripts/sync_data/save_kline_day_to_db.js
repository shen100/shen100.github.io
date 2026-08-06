import { fileURLToPath } from 'url';
import bluebird from 'bluebird';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import * as defaultLogger from '../../util/logger.js';
import stockNetUtil from '../../util/stock_net_util.js';
import config from '../../config/config.js';

const __filename = fileURLToPath(import.meta.url);

let startStr = '2024-01-01';
let endStr = new Date().toISOString().substring(0, 10); // '2027-01-01';

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

async function runTask(option) {
    const logger = option && option.logger || defaultLogger;
    const allStocks = await stockService.getAllStocksFromDB();
    const db = await mongo.getDB();
    const collection = db.collection('kline_day');
    await bluebird.map(allStocks, async function (stockData, index) {
        let myKList = await stockNetUtil.requestDayK(stockData.stockFullId, startStr, endStr, 1000);
        let kList = myKList.map((item) => {
            const saveData = {
                date: item[0],
                openPrice: item[1],
                closePrice: item[2],
                highPrice: item[3],
                lowPrice: item[4],
                volume: item[5],
                amount: item[8],
            };
            return saveData;
        });

        const filter = { stockFullId: stockData.stockFullId };
        const updateDoc = {
            $set: {
                stockFullId: stockData.stockFullId,
                stockId: stockData.stockId,
                stockName: stockData.stockName,
                kList,
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        };
        const result = await collection.updateOne(filter, updateDoc, { upsert: true });
        let logMsg = `📝 更新成功: index ${index} modifiedCount ${result.modifiedCount} upsertedCount ${result.upsertedCount}`;
        console.log(logMsg);
        logger.info(logMsg);
    }, { concurrency: 20 });

    const createdAt = new Date();
    const taskExecCol = db.collection('task_exec_history');
    await taskExecCol.insertOne({
        taskName: 'save_kline_day_to_db',
        createdAt,
        expiredAt: new Date(Date.now() + config.taskExecHistoryExpiredTime)
    });

    let logMsg = `一共更新了 ${allStocks.length} 条数据`;
    console.log(logMsg);
    console.log();
    logger.info(logMsg);

    return {
        createdAt
    };
}

export async function exec(option) {
    try {
        let logger = option.logger;
        let startTime = Date.now();

        await runTask(option);

        let endTime = Date.now();
        let logMsg = `总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

/**
 * 把所有股票的历史K线(日线)存入数据库, 可以指定时间
 */
if (isMain) {
    await exec();
}