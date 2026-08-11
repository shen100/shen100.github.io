import bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';
import * as stockService from '../../service/stock.js';
import stockNetUtil from '../../util/stock_net_util.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

async function runTask(option) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    const collection = db.collection('stock_detail');
    const allStocks = await stockService._getAllStocksFromFile();

    await bluebird.map(allStocks, async function (stockData, index) {
        let stockDetail = await stockNetUtil.requestStockDetail(stockData);

        const filter = { stockFullId: stockDetail.stockFullId };
        const updateDoc = {
            $set: {
                stockId: stockDetail.stockId,
                stockFullId: stockDetail.stockFullId,
                stockName: stockDetail.stockName,
                zongShiZhi: stockDetail.zongShiZhi,
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date() // 只有插入时才设置
            }
        };
        const result = await collection.updateOne(filter, updateDoc, { upsert: true });

        let logMsg = `📝 更新成功: index ${index} modifiedCount ${result.modifiedCount} upsertedCount ${result.upsertedCount}`;
        console.log(logMsg);
        console.log();
        logger.info(logMsg);

    }, { concurrency: 20 });

    let logMsg = `一共更新了 ${allStocks.length} 条数据`;
    console.log(logMsg);
    logger.info(logMsg);
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        let startTime = Date.now();

        await runTask(option);

        const db = await mongo.getDB();
        const taskExecCol = db.collection('task_exec_history');
        const createdAt = new Date();
        await taskExecCol.insertOne({
            taskName: 'save_stock_detail_to_db',
            createdAt
        });

        let endTime = Date.now();
        let logMsg = `✅ 总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);
        return {
            createdAt
        };
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

/**
 * 把所有股票的详细信息存入数据库，需要先更新 server/data/all_original_stocks.json
 */
if (isMain) {
    await exec();
}

