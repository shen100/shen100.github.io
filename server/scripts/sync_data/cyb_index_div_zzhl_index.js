import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import * as defaultLogger from '../../util/logger.js';
import stockNetUtil from '../../util/stock_net_util.js';
import * as dateUtil from '../../util/date.js';
import config from '../../config/config.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

async function bulkUpsert(db, collName, dataMap) {
    const ops = [];
    for (let key in dataMap) {
        const valueData = dataMap[key];
        ops.push({
            updateOne: {
                filter: {
                    date: valueData.date
                },
                update: {
                    $set: {
                        date: valueData.date,
                        value: valueData.value,
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

async function doRunTask(option, type, startStr, endStr, count) {
    const logger = option && option.logger || defaultLogger;
    const db = await mongo.getDB();
    let logMsg = '';

    let kList1, kList2;
    if (type === 'day') {
        [ kList1, kList2 ] = await Promise.all([
            // 创业板指
            stockNetUtil.requestDayK('sz399006', startStr, endStr, count),
            // 中证红利
            stockNetUtil.requestDayK('sh000922', startStr, endStr, count)
        ]);
    } else {
        [ kList1, kList2 ] = await Promise.all([
            // 创业板指
            stockNetUtil.requestMonthK('sz399006', startStr, endStr, count),
            // 中证红利
            stockNetUtil.requestMonthK('sh000922', startStr, endStr, count)
        ]); 
    }

    const dateValueMap = {};
    for (let i = 0; i < kList1.length; i++) {
        dateValueMap[kList1[i][0]] = {
            date: kList1[i][0],
            value: kList1[i][2] / kList2[i][2],
        };
    }

    logMsg = `开始写入数据库`;
    console.log(logMsg);
    logger.info(logMsg);

    let startTime = Date.now();
    await bulkUpsert(db, `cyb_index_div_zzhl_${type}_index`, dateValueMap);

    let endTime = Date.now();
    logMsg = `写库用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);
}

async function runTask(option) {
    const logger = option && option.logger || defaultLogger;
    let endStr = new Date().toISOString().substring(0, 10); // '2027-01-01';
    let startStr = endStr;
    let count;

    for (let i = 0; i < 365; i++) {
        startStr = dateUtil.getPreDay(startStr);
    }

    for (let i = 0; i < 17; i++) {
        let startDate = new Date(startStr);
        let endDate = new Date(endStr);
        count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));
        await doRunTask(option, 'day', startStr, endStr, count);

        for (let i = 0; i < 365; i++) {
            startStr = dateUtil.getPreDay(startStr);
            endStr = dateUtil.getPreDay(endStr);
        }
    }

    startStr = '2010-01-01';
    endStr = new Date().toISOString().substring(0, 10); // '2027-01-01';

    let startDate = new Date(startStr);
    let endDate = new Date(endStr);
    count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

    await doRunTask(option, 'month', startStr, endStr, count);
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        let startTime = Date.now();

        await runTask(option);

        const createdAt = new Date();
        const db = await mongo.getDB();
        const taskExecCol = db.collection('task_exec_history');
        await taskExecCol.insertOne({
            taskName: 'cyb_index_div_zzhl_index',
            createdAt,
            expiredAt: new Date(Date.now() + config.taskExecHistoryExpiredTime)
        });

        let endTime = Date.now();
        let logMsg = `✅ 总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);

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

/**
 * 创业板指 除以 中证红利指数
 */
if (isMain) {
    await exec();
}