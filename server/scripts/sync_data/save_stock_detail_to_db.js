import bluebird from 'bluebird';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import { requestStockDetail } from '../util/stock_util.js';

/**
 * 把所有股票的详细信息存入数据库，需要先更新 server/data/all_original_stocks.json
 */
async function main() {
    try {
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

            console.log('📝 更新成功:', index, ' result.upsertedId', result.upsertedId);
            console.log();

        }, { concurrency: 20 });

        console.log(`一共更新了 ${allStocks.length} 条数据`);
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await mongo.close();
    }
}

await main();