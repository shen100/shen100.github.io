import bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import * as defaultLogger from '../../util/logger.js';
import * as dateUtil from '../../util/date.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

let ignoreStockMap = {};

async function bulkUpsert(db, collName, dateMap) {
    const ops = [];
    for (let date in dateMap) {
        const statData = dateMap[date];
        ops.push({
            updateOne: {
                filter: {
                    date
                },
                update: {
                    $set: {
                        date,
                        stocks: statData.stocks,
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

/**
 * 找出最近六日的最高价突破历史最高价的股票, 不考虑以下公司
 * 1. 上市时间少于 100 个交易日
 * 2. 公司市值小于 100 亿
 * 3. 在北交所上市
 */
function isHighPrice(stockKLine, stockDetail, startStr, endStr) {
    if (stockDetail.zongShiZhi < 100) {
        return false;
    }
    if (stockDetail.zongShiZhi > 10000) {
        return false;
    }
    if (stockDetail.stockFullId.indexOf('bj') === 0) {
        return false;
    }
    if (stockDetail.stockName.indexOf('银行') >= 0) {
        return false;
    }

    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < stockKLine.kList.length; i++) {
        if (stockKLine.kList[i].date >= startStr && startIndex < 0) {
            startIndex = i;
        }
        // date === endStr 如果不成立，那么那天就不是交易日, 最后 return false
        if (stockKLine.kList[i].date === endStr && endIndex < 0) {
            endIndex = i + 1;
        }
    }
    if (endIndex < 0) {
        return false;
    }

    let kList = stockKLine.kList.slice(startIndex, endIndex);

    // 上市时间少于 100 个交易日的，不考虑
    if (kList.length < 100) {
        ignoreStockMap[stockDetail.stockFullId] = true;
        return false;
    }
    if (ignoreStockMap[stockDetail.stockFullId]) {
        return false;
    }

    let highPrice = 0;
    let dayCount = 5;
    for (let i = kList.length - dayCount; i < kList.length; i++) {
        if (kList[i].highPrice > highPrice) {
            highPrice = kList[i].highPrice;
        }
    }
    
    for (let i = 0; i < kList.length - dayCount; i++) {
        if (kList[i].highPrice > highPrice) {
            return false;
        }
    }
    return true;
}

async function runTask(myItems, option) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();

    const dateMap = {};

    await bluebird.map(myItems, async function (stockData, index) {
        const klineDayCol = db.collection('kline_day');
        const stockKLine = await klineDayCol.findOne({ stockFullId: stockData.stockFullId });
        let maxEndStr = new Date().toISOString().substring(0, 10);
        let kList = stockKLine.kList || [];
        let maxEndStrInStock = kList[kList.length - 1] && kList[kList.length - 1].date || '';
        if (maxEndStr > maxEndStrInStock) {
            maxEndStr = maxEndStrInStock;
        }

        let startStr = '2025-01-01';
        let endStr = '2025-07-01'; // startStr,  endStr 至少要间隔 100 个交易日
        while (endStr <= maxEndStr) {
            if (isHighPrice(stockKLine, stockData, startStr, endStr)) {
                dateMap[endStr] = dateMap[endStr] || {
                    stocks: []
                };
                dateMap[endStr].stocks.push(stockData.stockFullId);
            }
            endStr = dateUtil.getNextDay(endStr);
        }
    }, { concurrency: 20 });

    let startTime = Date.now();
    await bulkUpsert(db, 'stat_highprice_tend', dateMap);

    let endTime = Date.now();
    let logMsg = `写库用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        const db = await mongo.getDB();
        let startTime = Date.now();

        let logMsg = '开始执行';
        console.log(logMsg);
        logger.info(logMsg);

        let myItems = await stockService.getAllStocksFromDB();

        await runTask(myItems, option);

        let endTime = Date.now();
        logMsg = `✅ 总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);

        const taskExecCol = db.collection('task_exec_history');
        const createdAt = new Date();
        await taskExecCol.insertOne({
            taskName: 'stat_highprice_tend',
            createdAt
        });
        return {
            createdAt,
        };
    } catch (err) {
        console.error('❌ 写入失败:', err);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

/**
 * 统计最近六日的最高价突破历史最高价的股票数
 */
if (isMain) {
    await exec();
}