import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';
import * as stockService from '../../service/stock.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

async function bulkUpsert(db, collName, dataMap) {
    const ops = [];
    for (let key in dataMap) {
        const statData = dataMap[key];
        ops.push({
            updateOne: {
                filter: {
                    date: statData.date
                },
                update: {
                    $set: {
                        date: statData.date,
                        upCount: statData.upCount,
                        downCount: statData.downCount,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                },
                upsert: true
            }
        });
    }

    const coll = db.collection(collName);
    const res = await coll.bulkWrite(ops, {
        ordered: false // false：某一条失败，不影响其他继续执行；适合K线批量写入
    });
    return res;
}

async function runTask(option) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    const collection = db.collection('kline_day');

    let logMsg = '查询股票历史K线';
    console.log(logMsg);
    logger.info(logMsg);
    let startTime = Date.now();
    const stocks = await collection.find({}).toArray();

    let endTime = Date.now();
    logMsg = `查询股票历史K线用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);

    const dataMap = {};
    const adLineMap = {}; // Advance-Decline Line（A/D Line）腾落线

    const allStockDetails = await stockService.getAllStocksFromDB();
    const allStockDetailsMap = {};
    for (let i = 0; i < allStockDetails.length; i++) {
        allStockDetailsMap[allStockDetails[i].stockFullId] = allStockDetails[i];
    }

    for (let i = 0; i < stocks.length; i++) {
        const stockDetail = allStockDetailsMap[stocks[i].stockFullId];
        // 忽略市值小于 100 亿 的公司
        if (!(stockDetail && stockDetail.zongShiZhi > 100)) {
            continue;
        }
        let stock = stocks[i];
        for (let j = stock.kList.length - 1; j > 0; j--) {
            let item1 = stock.kList[j - 1];
            let item2 = stock.kList[j];
            dataMap[item2.date] = dataMap[item2.date] || {
                date: item2.date,
                upCount: 0,
                downCount: 0
            };
            adLineMap[item2.date] = adLineMap[item2.date] || {
                date: item2.date,
                upCount: 0,
                downCount: 0
            };
            let rate = (item2.closePrice - item1.closePrice) / item1.closePrice;
            if (rate >= 0.095) {
                dataMap[item2.date].upCount++;
            } else if (rate <= -0.095) {
                dataMap[item2.date].downCount++;
            }
            if (rate > 0) {
                adLineMap[item2.date].upCount++;
            } else if (rate < 0) {
                adLineMap[item2.date].downCount++;
            }
        }
    }

    logMsg = `开始写入数据库`;
    console.log(logMsg);
    logger.info(logMsg);

    startTime = Date.now();
    await bulkUpsert(db, 'stat_daily_surge_plunge', dataMap);
    await bulkUpsert(db, 'stat_daily_adline', adLineMap); // 腾落线

    endTime = Date.now();
    logMsg = `写库用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        let startTime = Date.now();
        await runTask(option);

        let endTime = Date.now();
		let logMsg = `✅ 总用时 ${(endTime - startTime) / 1000} 秒`;
		console.log(logMsg);
		logger.info(logMsg);

        const db = await mongo.getDB();
        const taskExecCol = db.collection('task_exec_history');
        const createdAt = new Date();
        await taskExecCol.insertOne({
            taskName: 'stat_daily_surge_plunge_count',
            createdAt
        });
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

if (isMain) {
    await exec();
}