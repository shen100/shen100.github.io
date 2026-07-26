import { MongoClient } from 'mongodb';
import { conceptSectors } from './concept_sector.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

/*

db.getCollection("daily_up_count").createIndex(
  { "stockFullId": 1 },
  { unique: true, background: true }
)

*/

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

async function exec(option) {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        const db = client.db(process.env.MY_DB);
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
                let amount = rate * item2.amount;

                if (stock.stockName === '北方华创' && item2.date === "2026-07-02") {
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
            const filter = { concept: dataMap[key].concept, date: statData.date };
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
            console.log('📝 更新成功 date ', key, ' result.upsertedId', result.upsertedId);
            console.log();
        }

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

async function main() {
    exec({});
}

main();