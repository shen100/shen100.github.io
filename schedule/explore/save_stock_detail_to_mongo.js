import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import { getAllStocks } from './allStocks.js';
import { requestStockDetail } from './stockUtil.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let myItems = getAllStocks();

async function main() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        const db = client.db('mytrade');
        const collection = db.collection('stock_detail');

        const stockDetailJSONMap = {};
        await bluebird.map(myItems, async function (stockData, index) {
            let stockDetail = await requestStockDetail(stockDetailJSONMap, stockData);

            const result = await collection.insertOne(stockDetail);

            console.log('📝 插入成功:', index, ' ', result.insertedId);
            console.log();

        }, { concurrency: 1 });

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

main();