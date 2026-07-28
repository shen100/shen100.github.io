import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import { getAllStocks } from './allStocks.js';
import { requestDayK } from './stockUtil.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let myItems = getAllStocks();

/*

db.getCollection("kline_day").createIndex(
  { "stockFullId": 1 },
  { unique: true, background: true }
)

*/

let startStr = '2024-01-01';
let endStr = '2027-01-01';

async function main() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        const db = client.db('mytrade');
        const collection = db.collection('kline_day');

        const dayJSONMap = {};

        await bluebird.map(myItems, async function (stockData, index) {
            let myKList = await requestDayK(dayJSONMap, stockData, startStr, endStr, 1000);
            let kList = myKList.map((item) => {
                return {
                    date: item[0],
                    openPrice: item[1],
                    closePrice: item[2],
                    highPrice: item[3],
                    lowPrice: item[4],
                    volume: item[5],
                    amount: item[8],
                }
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
                    createdAt: new Date()  // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });
            console.log('📝 更新成功 index ', index, ' result.upsertedId', result.upsertedId);

        }, { concurrency: 20 });

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

main();