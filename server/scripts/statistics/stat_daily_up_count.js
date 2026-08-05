import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;
let logger;

if (process.argv[1] === __filename) {
    isMain = true;
}

async function runTask(option) {
    logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    const collection = db.collection('kline_day');
    const stocks = await collection.find({}).toArray();
    const dataMap = {};

    for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i];
        // if (stock.stockFullId.indexOf('bj') === 0) {
        //     // 忽略北交所的股票
        //     continue;
        // }
        if (stock.kList.length < option.statDayCount + 1) {
            continue;
        }
        for (let j = stock.kList.length - 1; j >= option.statDayCount; j--) {
            // 假如 j 当前为 10, 那就是 在 0 到 10 号元素里找最大值
            let items = stock.kList.slice(j - option.statDayCount, j + 1);
            let item = items.reduce((max, current) => {
                return current.closePrice > max.closePrice ? current : max
            });
            // 如果最大元素 是 10 号元素，即 j 对应的元素就是最大元素
            if (item && item.date === stock.kList[j].date) {
                dataMap[item.date] = dataMap[item.date] || {
                    date: item.date,
                    count: 0,
                    stocks: []
                };
                dataMap[item.date].count++;
                dataMap[item.date].stocks.push(stock.stockFullId);
            }
        }
    }

    const dailyUpCountCol = db.collection('daily_up_count');
    
    for (let key in dataMap) {
        const statData = dataMap[key];
        const filter = { uniqueId: statData.date + `-` + option.statDayCount };
        const updateDoc = {
            $set: {
                date: statData.date,
                count: statData.count,
                statDayCount: option.statDayCount,
                stocks: statData.stocks
            },
            $setOnInsert: {
                createdAt: new Date()  // 只有插入时才设置
            }
        };
        const result = await dailyUpCountCol.updateOne(filter, updateDoc, { upsert: true });
        let logMsg = `📝 更新成功 date ${key} result.upsertedId ${result.upsertedId}`;
        console.log(logMsg);
        console.log();
        logger.info(logMsg);
    }
}

/**
 * 每日上涨股票数(和前 N 个交易日每天的股价相比)
 * 假如股票A在7月27日的收盘价是100, 那和前 N 个交易日每天的收盘价相比，
 * 100都是最大值的话，那么就把7月27日的上涨股票数加 1
 */
export async function exec(option) {
    try {
        let startTime = Date.now();
        await runTask({
            ...option,
            statDayCount: 10 // 2周大概 10 个交易日
        });
        await runTask({
            ...option,
            statDayCount: 22 // 1个月大概  22 个交易日
        });
        await runTask({
            ...option,
            statDayCount: 44 // 2个月大概  44 个交易日
        });
        await runTask({
            ...option,
            statDayCount: 252 // 一年大概 252 个交易日
        });

        const db = await mongo.getDB();
        const taskExecCol = db.collection('task_exec_history');
        await taskExecCol.insertOne({
            taskName: 'stat_daily_up_count',
            createdAt: new Date()
        });

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

if (isMain) {
    await exec();
}