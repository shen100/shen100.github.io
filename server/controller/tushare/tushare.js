import * as mongo from '../../database/mongo.js';

export async function queryAllDailyBasic(req, res) {
    const db = mongo.getDB();
    const collection = db.collection('tushare_daily_basic');
    const list = await collection.find({}).toArray();

    let compositeIndex = {
		index: {}, // 整个大盘的数据
		index0: {},
		index1: {},
		index2: {},
		index3: {},
		index4: {},
		index5: {},
		index6: {},
	};

	for (let stock of list) {
		// 用最新的市值来对公司进行分类，分到同一类的公司, 计算它们每天的市值合计、平均指数
		// total_mv 总市值 （万元）
		const newTotalMV = stock.items[stock.items.length - 1].total_mv;
		let indexNum = '';
		if (newTotalMV < 100) {
			indexNum = 'index0';
		} else if (newTotalMV < 500) {
			indexNum = 'index1';
		} else if (newTotalMV < 1000) {
			indexNum = 'index2';
		} else if (newTotalMV < 2000) {
			indexNum = 'index3';
		} else if (newTotalMV < 5000) {
			indexNum = 'index4';
		} else if (newTotalMV < 10000) {
			indexNum = 'index5';
		} else {
			indexNum = 'index6';
		}
		stock.items.forEach(item => {
			compositeIndex[indexNum][item.trade_date] = compositeIndex[indexNum][item.trade_date] || {
				amount: 0,
				count: 0
			};
			compositeIndex['index'][item.trade_date] = compositeIndex['index'][item.trade_date] || {
				amount: 0,
				count: 0
			};
			compositeIndex[indexNum][item.trade_date].count += 1;
			compositeIndex[indexNum][item.trade_date].amount += item.total_mv;
			compositeIndex['index'][item.trade_date].count += 1;
			compositeIndex['index'][item.trade_date].amount += item.total_mv;
		});
	}

    res.json({
        code: 0,
        data: {
            compositeIndex
        }
    });
}