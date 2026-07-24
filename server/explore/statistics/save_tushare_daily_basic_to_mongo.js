import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import { formatLocalYMD } from '../../util/date';
import { getAllStocks } from '../allStocks.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

async function requestDailyBasic(stock) {
	let url = 'https://api.tushare.pro';
	let before = 20; // 查询多少年前的数据
	let startDate = formatLocalYMD(new Date(new Date().getTime() - before * 365 * 24 * 3600 * 1000)).replace(/-/g, '');
	let endDate = formatLocalYMD(new Date()).replace(/-/g, '');
	const reqData = {
		method: 'post',
		url,
		headers: {
			'content-type': 'application/json',
		},
		data: {
			token: process.env.TU_SHARE_TOKEN,
			api_name: 'daily_basic',
			params: {
				ts_code: stock.ts_code,
				start_date: startDate,
				end_date: endDate
			}
		}
	};
	const res = await axios(reqData);
	if (!(res.data.code === 0 && res.data.data && res.data.data.items)) {
		return null;
	}
	let items = res.data.data.items.map((item) => {
		return {
			trade_date: item[1], // 交易日期
			total_mv: item[16] / 10000, // 总市值原始数据是万元，转换为亿
		}
	});
	return {
		stockId: stock.stockId,
		ts_code: stock.ts_code,
		items
	}
}

async function requestAllDailyBasic() {
	for (let i = 0; i < allStocks.length; i += concurrence) {
		console.log('requestAllDailyBasic', i, new Date().toISOString());
		let startTime = new Date().getTime();
		let tasks = [];
		for (let j = i; j < i + concurrence && j < allStocks.length; j++) {
			tasks.push(requestDailyBasic(allStocks[j]));
		}
		let list = await Promise.all(tasks);
		for (let stock of list) {
			if (!stock) {
				continue;
			}
			if (!(stock.items && stock.items.length)) {
				continue;
			}
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
		let endTime = new Date().getTime();
		let timeout = 60 * 1000 - (endTime - startTime);
		if (timeout <= 0) {
			timeout = 0;
		}
		timeout += 1000;
		await sleep(timeout);
	}
}
async function main() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB');

        const db = client.db('mytrade');
        const collection = db.collection('tushare_daily_basic');

        

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

main();