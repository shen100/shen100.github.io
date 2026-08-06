import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';
import { isSTStock } from '../../util/stock_util.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

function calcAAEqualWeightIndex(dateMap, kList) {
    for (let i = 1; i < kList.length; i++) {
        let dayItem1 = kList[i - 1];
        let dayItem2 = kList[i];
        if (!(dayItem1.volume > 0 && dayItem1.closePrice > 0)) {
            continue;
        }
        if (!(dayItem2.volume > 0 && dayItem2.closePrice > 0)) {
            continue;
        }
        let date = dayItem2.date;
        dateMap[date] = dateMap[date] || { sumRate: 0, stockCount: 0, indexPoint: 0 };
        const rate = (dayItem2.closePrice - dayItem1.closePrice) / dayItem1.closePrice
        dateMap[date].sumRate += rate;
        dateMap[date].stockCount += 1;
    }
}

async function bulkUpsert(db, dateList) {
    const ops = dateList.map(item => {
        return {
            updateOne: {
                filter: {
                    date: item.date
                },
                update: {
                    $set: {
                        date: item.date,
                        sumRate: item.sumRate,
                        stockCount: item.stockCount,
                        avgRate: item.avgRate,
                        indexPoint: item.indexPoint,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                },
                upsert: true
            }
        };
    });

    const coll = db.collection('equal_weight_index');
    const res = await coll.bulkWrite(ops, {
        ordered: false // false：某一条失败，不影响其他继续执行；适合K线批量写入
    });
    return res;
}

async function runTask(option) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    const stockDetailColl = db.collection('stock_detail');
    const kLineDayColl = db.collection('kline_day');

    let logMsg = '查询股票历史K线';
    console.log(logMsg);
    logger.info(logMsg);
    let startTime = Date.now();

    const [ stockDetailList, stocks ] = await Promise.all([
        stockDetailColl.find({}).toArray(),
        kLineDayColl.find({}).toArray()
    ]);

    let endTime = Date.now();
    logMsg = `查询股票历史K线用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);

    const stockDetailMap = {};
    for (let i = 0; i < stockDetailList.length; i++) {
        stockDetailMap[stockDetailList[i].stockFullId] = stockDetailList[i];
    }

    logMsg = '计算全A等权指数';
    console.log(logMsg);
    logger.info(logMsg);
    const dateMap = {};
    for (let i = 0; i < stocks.length; i++) {
        if (isSTStock(stocks[i].stockName)) {
            continue;
        }
        const stockFullId = stocks[i].stockFullId
        // 过滤掉市值小于 30 亿的
        if (stockDetailMap[stockFullId].zongShiZhi < 30) {
            continue;
        }
        // 过滤掉刚上市的公司
        if (stocks[i].kList.length <= 5) {
            continue;
        }
        calcAAEqualWeightIndex(dateMap, stocks[i].kList);
    }
    let dateList = [];
    for (let key in dateMap) {
        dateList.push({
            ...dateMap[key],
            date: key
        });
    }
    dateList.sort((a, b) => a.date > b.date ? 1 : -1);

    const basePoint = 1000;
    let prevIndex = basePoint;
    dateList.forEach(item => {
        item.avgRate = item.sumRate / item.stockCount;
        item.indexPoint = prevIndex * (1 + item.avgRate);
        prevIndex = item.indexPoint;
    });
    
    logMsg = `开始写入数据库`;
    console.log(logMsg);
    logger.info(logMsg);

    startTime = Date.now();
    await bulkUpsert(db, dateList);

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
        let logMsg = `总用时 ${(endTime - startTime) / 1000} 秒`;
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

/**
 * 更新每日全A等权指数
 */
if (isMain) {
    await exec();
}