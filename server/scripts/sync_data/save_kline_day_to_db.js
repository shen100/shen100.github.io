import bluebird from 'bluebird';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import { requestDayK } from '../util/stock_util.js';

let startStr = '2024-01-01';
let endStr = new Date().toISOString().substring(0, 10); // '2027-01-01';

/**
 * 把所有股票的历史K线(日线)存入数据库, 可以指定时间 startStr, endStr
 */
async function main() {
    try {
        const allStocks = await stockService.getAllStocksFromDB();
        const db = await mongo.getDB();
        const collection = db.collection('kline_day');
        await bluebird.map(allStocks, async function (stockData, index) {
            let myKList = await requestDayK(stockData, startStr, endStr, 1000);
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
                    createdAt: new Date() // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });
            console.log('📝 更新成功 index ', index, ' result.upsertedId', result.upsertedId);

        }, { concurrency: 20 });

        console.log(`一共更新了 ${allStocks.length} 条数据`);
        console.log();
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await mongo.close();
    }
}

await main();