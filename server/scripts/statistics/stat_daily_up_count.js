import { MongoClient } from 'mongodb';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

/*

db.getCollection("daily_up_count").createIndex(
  { "stockFullId": 1 },
  { unique: true, background: true }
)

*/

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
            if (stock.kList.length < option.statDayCount + 1) {
                continue;
            }
            for (let j = stock.kList.length - 1; j >= option.statDayCount; j--) {
                let items = stock.kList.slice(j - option.statDayCount, j + 1);
                let item;
                if (option.isMax) {
                    item = items.reduce((max, current) => {
                        return current.closePrice > max.closePrice ? current : max
                    });
                } else {
                    let item1 = stock.kList[j - option.statDayCount];
                    let item2 = stock.kList[j];

                    if (item2.closePrice > item1.closePrice) {
                        item = item2;
                    }
                }
                if (item && item.date === stock.kList[j].date) {
                    dataMap[item.date] = dataMap[item.date] || {
                        date: item.date,
                        count: 0
                    };
                    dataMap[item.date].count++;
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
                    statDayCount: option.statDayCount
                },
                $setOnInsert: {
                    createdAt: new Date()  // 只有插入时才设置
                }
            };
            const result = await dailyUpCountCol.updateOne(filter, updateDoc, { upsert: true });
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
    exec({
        statDayCount: 10,
        isMax: true
    });  
}

main();