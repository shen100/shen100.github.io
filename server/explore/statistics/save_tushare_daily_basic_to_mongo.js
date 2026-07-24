import { MongoClient } from 'mongodb';
import bluebird from 'bluebird';
import axios from 'axios';
import { formatLocalYMD } from '../../util/date.js';
import { getAllStocks } from '../allStocks.js';

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

let allStocks = getAllStocks();

function sleep(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

async function requestDailyBasic(collection, stock) {
	let stockInDB = await collection.findOne({ stockFullId: stock.stockFullId});
	if (stockInDB) {
		return null;
	}

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
				ts_code: stock.tsCode,
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
		ts_code: stock.tsCode,
		items
	}
}

async function requestAllDailyBasic(collection) {
	let concurrence = 200;
	for (let i = 0; i < allStocks.length; i += concurrence) {
		let startTime = new Date().getTime();
		let tasks = [];
		for (let j = i; j < i + concurrence && j < allStocks.length; j++) {
			tasks.push(requestDailyBasic(collection, allStocks[j]));
		}
		let list = await Promise.all(tasks);
		for (let stock of list) {
			if (!stock) {
				continue;
			}
			if (!(stock.items && stock.items.length)) {
				continue;
			}
			const result = await collection.insertOne(stock);

            console.log(new Date().toISOString(), '📝 插入成功:', i, ' ', result.insertedId);
            console.log();
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

        await requestAllDailyBasic(collection);

    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}

main();