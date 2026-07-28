import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import * as stockService from '../service/stock.js';
import { requestStockDetail } from './stockUtil.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let myItems = await stockService.getAllStocksFromFile();

/*

db.getCollection("stock_detail").createIndex(
  { "stockFullId": 1 },
  { unique: true, background: true }
)

*/
async function main() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        const db = client.db('mytrade');
        const collection = db.collection('stock_detail');

        const stockDetailJSONMap = {};
        await bluebird.map(myItems, async function (stockData, index) {
            let stockDetail = await requestStockDetail(stockDetailJSONMap, stockData);

            const filter = { stockFullId: stockDetail.stockFullId };
            const updateDoc = {
                $set: {
                    stockId: stockDetail.stockId,
                    stockFullId: stockDetail.stockFullId,
                    stockName: stockDetail.stockName,
                    zongShiZhi: stockDetail.zongShiZhi,
                },
                $setOnInsert: {
                    createdAt: new Date()  // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });

            if (stockDetail.stockName === "*ST康佳A") {
                console.log();
            }
            console.log('📝 更新成功:', index, ' result.upsertedId', result.upsertedId);
            console.log();

        }, { concurrency: 20 });

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

main();