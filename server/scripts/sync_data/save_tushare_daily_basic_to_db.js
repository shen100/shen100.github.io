import axios from 'axios';
import * as mongo from '../../database/mongo.js';
import * as stockService from '../../service/stock.js';
import { formatLocalYMD } from '../../util/date.js';
import { convertStockFullIdToTsCode } from '../../util/tushare_util.js';

let allStocks = await stockService.getAllStocksFromDB();

function sleep(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

async function requestDailyBasic(stock) {
	let url = 'https://api.tushare.pro';
	let before = 10; // 查询多少年前的数据
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
				ts_code: convertStockFullIdToTsCode(stock.stockFullId),
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
		stockFullId: stock.stockFullId,
		stockId: stock.stockId,
		items
	}
}

async function requestAllDailyBasic() {
	const db = await mongo.getDB();
    const collection = db.collection('tushare_daily_basic');
	let concurrence = 200;
	for (let i = 0; i < allStocks.length; i += concurrence) {
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

			const filter = { stockFullId: stock.stockFullId };
            const updateDoc = {
                $set: {
					stockFullId: stock.stockFullId,
                    stockId: stock.stockId,
                    items: stock.items
                },
                $setOnInsert: {
                    createdAt: new Date() // 只有插入时才设置
                }
            };
            const result = await collection.updateOne(filter, updateDoc, { upsert: true });
            console.log('📝 更新成功 stockFullId ', stock.stockFullId, ' result.upsertedId', result.upsertedId);
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

/**
 * 把每个公司每日的市值存入数据库，用来计算整个大盘每日的总市值
 */
async function main() {
    try {
		let startTime = Date.now();
        await requestAllDailyBasic();
		let endTime = Date.now();
		console.log(`总用时 ${(endTime - startTime) / 1000 / 60} 分`);
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await mongo.close();
    }
}

await main();