import * as mongo from '../../database/mongo.js';

/**
 * 统计每日大盘总市值
 */
export async function queryAllDailyBasic(req, res) {
    const db = await mongo.getDB();
    const collection = db.collection('tushare_daily_basic');
    const list = await collection.find({}).toArray();

	let dateMap = {};

	for (let stock of list) {
		stock.items.forEach(stock => {
			let date = stock.trade_date;
			date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
			dateMap[date] = dateMap[date] || { amount: 0, count: 0 };
			dateMap[date].count += 1;
			dateMap[date].amount += stock.total_mv; // total_mv 是当日公司总市值, 原始数据是万元，入库时转换为亿了
		});
	}

    res.json({
        code: 0,
        data: {
            index: dateMap,
			index0: {},
			index1: {},
			index2: {},
			index3: {},
			index4: {},
			index5: {},
			index6: {},
        }
    });
}