import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../data/concept_sector.js';

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

async function exec() {
    const db = await mongo.getDB();
    const collection = db.collection('kline_day');
    const stocks = await collection.find({}).toArray();
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

    const moneyFlowCol = db.collection('money_flow');
    
    for (let key in dataMap) {
        const statData = dataMap[key];
        const filter = { concept: statData.concept, date: statData.date };
        const updateDoc = {
            $set: {
                date: statData.date,
                concept: statData.concept,
                amount: statData.amount,
                stocks: statData.stocks,
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()  // 只有插入时才设置
            }
        };
        const result = await moneyFlowCol.updateOne(filter, updateDoc, { upsert: true });
        console.log('📝 更新成功 ', key, ' result.upsertedId', result.upsertedId);
        console.log();
    }
}

async function main() {
    try {
        await exec();
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await mongo.close();
    }
}

/**
 * 统计概念板块的资金流向
 */
await main();