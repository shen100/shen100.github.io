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
        for (let j = stock.kList.length - 1; j > 0; j--) {
            let item1 = stock.kList[j - 1];
            let item2 = stock.kList[j];
            dataMap[item2.date] = dataMap[item2.date] || {
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
        }
    }

    const col = db.collection('stat_daily_surge_plunge');
    
    for (let key in dataMap) {
        const statData = dataMap[key];
        const filter = { date: statData.date };
        const updateDoc = {
            $set: {
                date: statData.date,
                upCount: statData.upCount,
                downCount: statData.downCount,
            },
            $setOnInsert: {
                createdAt: new Date()  // 只有插入时才设置
            }
        };
        const result = await col.updateOne(filter, updateDoc, { upsert: true });
        let logMsg = `📝 更新成功 ${key} result.upsertedId ${result.upsertedId}`;
        console.log(logMsg);
        console.log();

        logger.info(logMsg);
    }

    const taskExecCol = db.collection('task_exec_history');
    await taskExecCol.insertOne({
        taskName: 'stat_daily_surge_plunge_count',
        createdAt: new Date()
    });
}

export async function exec(option) {
    try {
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

if (isMain) {
    await exec();
}