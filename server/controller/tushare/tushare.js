import * as mongo from '../../database/mongo.js';

export async function queryAllDailyBasic(req, res) {
    const db = mongo.getDB();
    const collection = db.collection('tushare_daily_basic');
    const list = await collection.find({}).toArray();

	let dateMap = {};

	for (let stock of list) {
		stock.items.forEach(stock => {
			dateMap[stock.trade_date] = dateMap[stock.trade_date] || { amount: 0, count: 0 };
			dateMap[stock.trade_date].count += 1;
			dateMap[stock.trade_date].amount += stock.total_mv; // total_mv 是当日公司市值
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