import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../data/concept_sector.js';
import * as defaultLogger from '../../util/logger.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

function findConceptSectors(stock) {
    let list = [];
    for (let i = 0; i < conceptSectors.length; i++) {
        let conceptSector = conceptSectors[i];
        if (conceptSector.stocks.indexOf(stock.stockName) >= 0) {
            list.push(conceptSector.name);
        }
    }
    return list;
}

async function bulkUpsert(db, dataMap) {
    const ops = [];

    for (let key in dataMap) {
        const statData = dataMap[key];
        ops.push({
            updateOne: {
                filter: {
                    concept: statData.concept, 
                    date: statData.date
                },
                update: {
                    $set: {
                        date: statData.date,
                        concept: statData.concept,
                        amount: statData.amount,
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


    const coll = db.collection('money_flow');
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

    for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i];
        const concepts = findConceptSectors(stock);
        if (!concepts.length) {
            continue;
        }
        for (let j = stock.kList.length - 1; j > 0; j--) {
            let item1 = stock.kList[j - 1];
            let item2 = stock.kList[j];
            let rate = (item2.closePrice - item1.closePrice) / item1.closePrice;
            let amount = item2.amount * rate;

            for (let k = 0; k < concepts.length; k++) {
                let conceptName = concepts[k];
                let key = item2.date + '-' + conceptName;
                dataMap[key] = dataMap[key] || {
                    date: item2.date,
                    concept: conceptName,
                    amount: 0,
                    stocks: []
                };
                dataMap[key].amount += amount;
                dataMap[key].stocks.push(stock.stockFullId);
            }
        }
    }

    logMsg = `开始写入数据库`;
    console.log(logMsg);
    logger.info(logMsg);

    startTime = Date.now();

    await bulkUpsert(db, dataMap);

    endTime = Date.now();
    logMsg = `写库用时 ${(endTime - startTime) / 1000} 秒`;
    console.log(logMsg);
    logger.info(logMsg);

    const taskExecCol = db.collection('task_exec_history');
    await taskExecCol.insertOne({
        taskName: 'stat_money_flow',
        createdAt: new Date()
    });
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
 * 统计概念板块的资金流向
 */
if (isMain) {
    await exec();
}