import bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';
import * as stockService from '../../service/stock.js';
import { requestStockDetail } from '../../util/stock_util.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;
let logger;

if (process.argv[1] === __filename) {
    isMain = true;
}

/**
 * 把所有股票的详细信息存入数据库，需要先更新 server/data/all_original_stocks.json
 */
export async function exec(option) {
    try {
        logger = option && option.logger || defaultLogger;
        const allStocks = await stockService.getAllStocksFromFile();
        const db = await mongo.getDB();
        const collection = db.collection('stock_detail');

        await bluebird.map(allStocks, async function (stockData, index) {
            let stockDetail = await requestStockDetail(stockData);

            const filter = { stockFullId: stockDetail.stockFullId };
            const updateDoc = {
                $set: {
                    stockId: stockDetail.stockId,
                    stockFullId: stockDetail.stockFullId,
                    stockName: stockDetail.stockName,
                    zongShiZhi: stockDetail.zongShiZhi,
                },
                $setOnInsert: {
                    createdAt: new Date() // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });

            let logMsg = '📝 更新成功: ' + index + ' result.upsertedId ' + result.upsertedId;
            console.log(logMsg);
            console.log();
            logger.info(logMsg);

        }, { concurrency: 20 });

        const taskExecCol = db.collection('task_exec_history');
        await taskExecCol.insertOne({
            taskName: 'save_stock_detail_to_db',
            createdAt: new Date()
        });

        let logMsg = `一共更新了 ${allStocks.length} 条数据`;
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

if (isMain) {
    await exec();
}