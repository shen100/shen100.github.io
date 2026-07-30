import * as mongo from '../../database/mongo.js';

async function exec() {
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
                incCount: 0,
                subCount: 0
            };
            let rate = (item2.closePrice - item1.closePrice) / item1.closePrice;
            if (rate >= 0.095) {
                dataMap[item2.date].incCount++;
            } else if (rate <= -0.095) {
                dataMap[item2.date].subCount++;
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
                incCount: statData.incCount,
                subCount: statData.subCount,
            },
            $setOnInsert: {
                createdAt: new Date()  // 只有插入时才设置
            }
        };
        const result = await col.updateOne(filter, updateDoc, { upsert: true });
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