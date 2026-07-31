import axios from 'axios';
import YahooFinance from 'yahoo-finance2';
import { Socks5ProxyAgent } from 'undici';
import config from '../config/config.js'
import { formatLocalYMD, formatHHMM } from './date.js'

const yahooFinance = new YahooFinance();
const proxyUrl = "socks5://127.0.0.1:1086";
const dispatcher = new Socks5ProxyAgent(proxyUrl);

function findFromRight(str, char) {
    const reversed = str.split('').reverse().join('');
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1;
    }
  
    return str.length - reversedIndex - 1;
}

export async function requestStockDetail(stock) {
	let url = `https://sqt.gtimg.cn/?q=${stock.stockFullId}&fmt=json&app=wzq&t=${Date.now()}`;
    let res = await axios.get(url);
	if (!(res.data && res.data[stock.stockFullId])) {
		return null;
	}
	let arr = res.data[stock.stockFullId] || [];
	return {
		stockId: stock.stockId,
		stockFullId: stock.stockFullId,
		stockName: stock.stockName,
		zongShiZhi: Number(arr[45] || '0'), // 总市值
		price: Number(arr[3] || '0'), // 当前价格  
	}
}

export async function requestDayKLine(stockFullId, start, end, count) {
	let url = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param="
	url += (stockFullId + ",day," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
	let str = res.data.replace('kline_dayqfq=', '');
	let resData = JSON.parse(str);
	/*
    [
		"2021-03-10", 0-交易日
		"1977.000", 1-开盘价
		"1970.010", 2-收盘价
		"1999.870", 3-最高价
		"1967.000", 4-最低价
		"51172.000" 5-成交量(即多少股，不用乘 100)
	]
    */
	let myKList = [];
	if (resData.data[stock.stockFullId]['qfqday']) {
		myKList = resData.data[stock.stockFullId].qfqday;
    } else {
		myKList = resData.data[stock.stockFullId].day;
    }
	myKList = myKList || [];

	let todayStr = new Date().toISOString().substring(0, 10);
	let endStr = myKList && myKList.length && myKList[myKList.length - 1][0];
	if (endStr && todayStr > endStr && todayStr <= end) {
		let todayKData = await requestToday(stock.stockFullId);
		if (todayKData[0] > endStr) {
			myKList.push(todayKData);
		}
	}
	let index = -1;
	// 如果 start, end 之间的交易日数量 小于 count，那返回的数据可能会有 start 之前的交易日数据
	for (let i = 0; i < myKList.length; i++) {
		if (myKList[i][0] >= start) {
			index = i;
			break;
		}
	}
	if (index > 0) {
		myKList = myKList.slice(index);
	}

	castKListToNumbers(myKList);
	return myKList;
}

async function requestToday(stockFullId) {
	let url = "https://qt.gtimg.cn/q=" + stockFullId;

	let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!res.data) {
		return null;
    }

    let gbkData = res.data;
    const decoder = new TextDecoder('gbk');
    const utf8String = decoder.decode(gbkData);
    const jsonStr = utf8String;
	if (!jsonStr) {
        return null;
    }
	let todayStr = "";
	let index = jsonStr.indexOf('"');
	if (index > 0) {
		todayStr = jsonStr.substring(index + 1);
    }
	index = findFromRight(todayStr, '"');
	if (index > 0) {
		todayStr = todayStr.substring(0, index)
    }

	let todayData = todayStr.split('~');
    let dateStr = todayData[30];
	const kData = [
		`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`,
		todayData[5],  // 开盘价
		todayData[3],  // 收盘价
		todayData[33], // 最高价
		todayData[34], // 最低价
		todayData[6],  // 成交量
		{},
		todayData[38], // 换手率
		todayData[37], // 成交额，单位万
	];
	return kData;
}

function castKListToNumbers(myKList) {
    for (let i = 0; i < myKList.length; i++) {
        myKList[i][1] = Number(myKList[i][1]); // 开盘价
        myKList[i][2] = Number(myKList[i][2]); // 收盘价
        myKList[i][3] = Number(myKList[i][3]); // 最高价
        myKList[i][4] = Number(myKList[i][4]); // 最低价
        myKList[i][5] = Number(myKList[i][5]); // 成交量(即多少股，不用乘 100)
		myKList[i][6] = myKList[i][6];
		myKList[i][7] = Number(myKList[i][7]); // 换手率
		myKList[i][8] = Number(myKList[i][8]); // 成交额(竞)，单位 万
    }
}

export async function requestYahooDayKLine(stockFullIdId, startStr, endStr) {
	const start = new Date(startStr); // '2024-01-01'
	const end = new Date(endStr);

	const quote = await yahooFinance.historical(
		stockFullIdId,  // ^ 开头 是 市场指数, 没有 ^ 是 个股 /或 ETF
		{
			period1: start.getTime() / 1000,
			period2: end.getTime() / 1000,
			interval: '1d'
		},
		{
			fetchOptions: {
				dispatcher,
				signal: AbortSignal.timeout(15000) // 15秒超时
			}
		}
	);

	console.log(JSON.stringify(quote[0], null, 4));
	/*
	{
		"date": "2026-01-02T00:00:00.000Z",
		"high": 4313.5498046875,
		"volume": 406300,
		"open": 4224.52978515625,
		"low": 4216.68017578125,
		"close": 4309.6298828125, // 原始收盘价
		"adjClose": 4309.6298828125 // 前复权收盘价
	}
	*/
	const myKList = [];
	for (let i = 0; i < quote.length; i++) {
		const item = quote[i];
		myKList.push([
			item.date.toISOString().split('T')[0],
			item.open,
			item.adjClose,
			item.high,
			item.low,
			item.volume, // 指数本身不存在 “成交股数”，Yahoo 返回的指数 volume 不标准，不是官方交易所原始数据
		]);
	}
	return myKList;
}

export async function requestYahooMinuteKLine(stockFullIdId, interval = '1m') {
	const start = new Date(Date.now() - 1 * 24 * 3600 * 1000);
	const end = new Date();

	const tasks = await Promise.all([
		// 获取分时
		yahooFinance.chart(
			stockFullIdId,
			{
				period1: start.getTime() / 1000,
				period2: end.getTime() / 1000,
				interval: interval, // 1m,2m,5m,15m,30m,60m
				includePrePost: false, // 关闭盘前盘后，只保留交易所正式交易
			},
			{
				fetchOptions: {
					dispatcher,
					signal: AbortSignal.timeout(15000)
				}
			}
		),
		// 获取最新收盘
		yahooFinance.quote(
			stockFullIdId,
			{},
			{ fetchOptions: { dispatcher, signal: AbortSignal.timeout(15000) } }
		)
	]);
	const minuteRes = tasks[0];
	const quoteRes = tasks[1];

	const quotes = minuteRes.quotes || [];

	let latestData = quotes[quotes.length - 1];
	let latestDate = formatLocalYMD(latestData.date);
	console.log();
	let kLineList = quotes.filter(item => item.date.getDate() === latestData.date.getDate());
	let tentcentKLineList = [];
	let accumulateVolume = 0; // 独立累加变量，不碰原始数据

	for (let i = 0; i < kLineList.length; i++) {
		let item = kLineList[i];
		accumulateVolume += item.volume || 0;
		//  "0930 1.107 197409 21853176.54"
		let arr = [
			formatHHMM(item.date),
			item.close,
			accumulateVolume, // 开盘至当前分钟累计成交总量
			0 // 开盘至当前分钟累计成交总金额, yahoo 接口返回的没这个字段，腾讯接口有
		];
		tentcentKLineList.push(arr.join(' '));
	}

	const qtArr = [];
	for (let i = 0; i < 87; i++) {
		qtArr.push('');
	}
	qtArr['3'] = '' + quoteRes.regularMarketPrice; // 当前价格
	qtArr['4'] = '' + quoteRes.regularMarketPreviousClose; // 前一交易日收盘价
	const resData = {
		[stockFullIdId]: {
			data: {
				data: tentcentKLineList,
				date: latestDate.replaceAll('-', '')
			},
			qt: {
				[stockFullIdId]: qtArr
			}
		}
	};
	return resData;
}

export async function requestYahooStockDetail(stockFullIdId) {
	 const result = await yahooFinance.quote(
		stockFullIdId,
		{}, // 无额外参数
		{
		fetchOptions: {
			dispatcher,
			signal: AbortSignal.timeout(15000)
		}
		}
	);

	console.log(JSON.stringify(result, null, 4));
	return {
		price: result.regularMarketPrice,
		zongShiZhi: 0, // REGULAR / CLOSED 区分是否开盘
	};
}
