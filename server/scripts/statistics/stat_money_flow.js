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
            // let amount = item2.amount - (item2.volume * item1.closePrice / 10000); // 单位万

            let rate = (item2.closePrice - item1.closePrice) / item1.closePrice;
            let amount = item2.amount * rate;

            if (stock.stockName === '兆易创新' && item2.date === "2026-07-29") {
                console.log(amount);
                console.log();
            }

            for (let k = 0; k < concepts.length; k++) {
                let conceptName = concepts[k];
                if (conceptName === '半导体设备' && item2.date === "2026-07-02") {
                    console.log();
                }
                let key = item2.date + '-' + conceptName;
                dataMap[key] = dataMap[key] || {
                    date: item2.date,
                    concept: conceptName,
                    amount: 0
                };
                dataMap[key].amount += amount;
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

await main();