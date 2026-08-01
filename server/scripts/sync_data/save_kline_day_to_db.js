import { fileURLToPath } from 'url';
import bluebird from 'bluebird';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import * as defaultLogger from '../../util/logger.js';
import { requestDayKLine } from '../../util/stock_util.js';

const __filename = fileURLToPath(import.meta.url);

let startStr = '2024-01-01';
let endStr = new Date().toISOString().substring(0, 10); // '2027-01-01';

let isMain = false;
let logger;

if (process.argv[1] === __filename) {
    isMain = true;
}

/**
 * 把所有股票的历史K线(日线)存入数据库, 可以指定时间 startStr, endStr
 */
export async function exec(option) {
    try {
        logger = option && option.logger || defaultLogger;
        const allStocks = await stockService.getAllStocksFromDB();
        const db = await mongo.getDB();
        const collection = db.collection('kline_day');
        await bluebird.map(allStocks, async function (stockData, index) {
            let myKList = await requestDayKLine(stockData.stockFullId, startStr, endStr, 1000);
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
                // 普通股成交量返回的是手，科创板的股票返回的是股
                let avgPrice = (saveData.openPrice + saveData.closePrice + saveData.highPrice + saveData.lowPrice) / 4;
                let amount1 = avgPrice * saveData.volume;
                let amount2 = avgPrice * saveData.volume * 100;
                let amountYuan = saveData.amount * 10000; // 单位是万， 乘以 10000 转成元
                let dt1 = Math.abs(amount1 - amountYuan);
                let dt2 = Math.abs(amount2 - amountYuan);
                if (dt2 < dt1) {
                    // dt2 更接近真实的成交额，成交量统一转为股，而不是手
                    saveData.volume = saveData.volume * 100;
                }
                return saveData;
            });

            const filter = { stockFullId: stockData.stockFullId };
            const updateDoc = {
                $set: {
                    stockFullId: stockData.stockFullId,
                    stockId: stockData.stockId,
                    stockName: stockData.stockName,
                    kList
                },
                $setOnInsert: {
                    createdAt: new Date() // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });
            let logMsg = '📝 更新成功 index ' + index + ' result.upsertedId ' + result.upsertedId;
            console.log(logMsg);
            logger.info(logMsg);

        }, { concurrency: 20 });

        const taskExecCol = db.collection('task_exec_history');
        await taskExecCol.insertOne({
            taskName: 'save_kline_day_to_db',
            createdAt: new Date()
        });

        let logMsg = `一共更新了 ${allStocks.length} 条数据`;
        console.log(logMsg);
        console.log();
        logger.info(logMsg);
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

if (isMain) {
    await exec();
}