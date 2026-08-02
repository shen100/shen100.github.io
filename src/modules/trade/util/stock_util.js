import axios from 'axios';
import config from '../config/config';

function findFromRight(str, char) {
    const reversed = str.split('').reverse().join('');
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1;
    }
  
    return str.length - reversedIndex - 1;
}

export async function requestStockDetail(stock) {
	if ([ '^KS11' ].indexOf(stock.stockFullId) >= 0) {
		let stockDetail = await requestStockDetailByServer(stock);
		return {
			stockId: stock.stockId,
			stockFullId: stock.stockFullId,
			stockName: stock.stockName,
			zongShiZhi: stockDetail.zongShiZhi, // 总市值
			price: stockDetail.price, // 当前价格  
		}
	}
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

async function requestStockDetailByServer(stock, start, end, count) {
	let url = config.url + `/api/stocks/kline/detail?stockFullId=${stock.stockFullId}`;
	let res = await axios.get(url);
	return res.data.data;
}

export async function requestMinuteK(stockFullId) {
	let res;
	if ([ '^KS11' ].indexOf(stockFullId) >= 0) {
		let url = config.url + `/api/stocks/kline/minute?stockFullId=${stockFullId}`;
		res = await axios.get(url);
	} else {
		// https://www.cnblogs.com/soarowl/p/20516538
		let url = `https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${stockFullId}`;
		res = await axios.get(url);
	}

	const minuteList = [];
	const resList = res.data.data[stockFullId].data.data;
	const stockInfo = res.data.data[stockFullId].qt[stockFullId];
	console.log('stockInfo', stockInfo);
	const prevDayClosePrice = Number(stockInfo[4]);

	let dateStr = res.data.data[stockFullId].data.date;
	let date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
	let highPriceInAll = -1;
	let lowPriceInAll = 1000000;
	for (let i = 0; i < resList.length; i++) {
		let arr = resList[i].split(' ');
		let minute = arr[0].slice(0, 2) + ':' + arr[0].slice(2); // 转成 09:30
		let price = Number(arr[1]); // 当前分钟最新成交价格
		let sumVolume = Number(arr[2]); // 开盘至当前分钟累计成交总量
		let sumAmount = Number(arr[3]) / 10000; // 开盘至当前分钟累计成交总金额 ( 接口返回的是元，转成万)
		// 和东方财富分时的成交量数据是一致的，和招商证券，雪球分时的成交量数据不一致
		let volume = i === 0 ? sumVolume: (sumVolume - minuteList[i - 1].sumVolume);
		let amount = i === 0 ? sumAmount: (sumAmount - minuteList[i - 1].sumAmount);

		// 普通股成交量返回的是手，科创板的股票返回的是股
		let avgPrice = price; // (openPrice + closePrice + highPrice + lowPrice) / 4;
		let amount1 = avgPrice * volume;
		let amount2 = avgPrice * volume * 100;
		let amountYuan = amount * 10000; // 单位是万， 乘以 10000 转成元
		let dt1 = Math.abs(amount1 - amountYuan);
		let dt2 = Math.abs(amount2 - amountYuan);
		if (dt2 < dt1) {
			// dt2 更接近真实的成交额，成交量统一转为股，而不是手
			volume = volume * 100;
		}

		if (price < lowPriceInAll) {
			lowPriceInAll = price;
		}
		if (price > highPriceInAll) {
			highPriceInAll = price;
		}
		minuteList.push({
			time: date + ' ' + minute,
			minute,
			prevDayClosePrice,
			price, // 当前分钟最新成交价格
			openPrice: i === 0 ? prevDayClosePrice : minuteList[i - 1].price,
			closePrice: price,
			volume,
			sumVolume,
			amount,
			sumAmount
		});
	}
	for (let i = 0; i < minuteList.length; i++) {
		minuteList[i].highPriceInAll = highPriceInAll;
		minuteList[i].lowPriceInAll = lowPriceInAll;
		if (i < minuteList.length - 1) {
			minuteList[i].nextPrice = minuteList[i + 1].price;
		}
	}

	return {
		minuteList,
		curPrice: Number(stockInfo[3]),
		prevDayClosePrice
	}
}

export async function requestDayK(stockFullId, start, end, count) {
	if ([ '^KS11' ].indexOf(stockFullId) >= 0) {
		return await requestDayKByServer(stockFullId, start, end, count);
	}
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
		"51172.000" 5-总手
	]
    */
	let myKList = [];
	if (resData.data[stockFullId]['qfqday']) {
		myKList = resData.data[stockFullId].qfqday;
    } else {
		myKList = resData.data[stockFullId].day;
    }
	myKList = myKList || [];

	let todayStr = new Date().toISOString().substring(0, 10);
	let endStr = myKList && myKList.length && myKList[myKList.length - 1][0];
	if (endStr && todayStr > endStr && todayStr <= end) {
		let todayKData = await requestToday(stockFullId);
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

async function requestDayKByServer(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/day?stockFullId=${stockFullId}&start=${start}&end=${end}&count=${count}`;
	let res = await axios.get(url);
	let myKList = res.data.data.kList;
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
		let openPrice  = Number(myKList[i][1]); // 开盘价
		let closePrice = Number(myKList[i][2]); // 收盘价
		let highPrice  = Number(myKList[i][3]); // 最高价
		let lowPrice   = Number(myKList[i][4]); // 最低价
		let volume     = Number(myKList[i][5]); // 成交量
		let amount     = Number(myKList[i][8]); // 成交额(竞)，单位 万
		
        myKList[i][1] = openPrice;
        myKList[i][2] = closePrice;
        myKList[i][3] = highPrice;
        myKList[i][4] = lowPrice;
        myKList[i][5] = volume;
		myKList[i][6] = myKList[i][6];
		myKList[i][7] = Number(myKList[i][7]); // 换手率
		myKList[i][8] = amount;

		// 普通股成交量返回的是手，科创板的股票返回的是股
		let avgPrice = (openPrice + closePrice + highPrice + lowPrice) / 4;
		let amount1 = avgPrice * volume;
		let amount2 = avgPrice * volume * 100;
		let amountYuan = amount * 10000; // 单位是万， 乘以 10000 转成元
		let dt1 = Math.abs(amount1 - amountYuan);
		let dt2 = Math.abs(amount2 - amountYuan);
		if (dt2 < dt1) {
			// dt2 更接近真实的成交额，成交量统一转为股，而不是手
			volume = volume * 100;
			myKList[i][5] = volume;
		}
    }
}

export async function requestWeekK(stockFullId, start, end, count) {
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stockFullId + ",week," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
		
	let myKList = [];
    if (res.data.data[stockFullId]['qfqweek']) {
		myKList = res.data.data[stockFullId].qfqweek;
    } else {
		myKList = res.data.data[stockFullId].week;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	castKListToNumbers(myKList);
	return myKList;
}

export async function requestMonthK(stockFullId, start, end, count) {
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
		
	let myKList = [];
    if (res.data.data[stockFullId]['qfqmonth']) {
		myKList = res.data.data[stockFullId].qfqmonth;
    } else {
		myKList = res.data.data[stockFullId].month;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	castKListToNumbers(myKList);
	return myKList;
}

export async function requestYearK(stockFullId, start, end, count) {
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
		
    let monthData;
    if (res.data.data[stockFullId]['qfqmonth']) {
		monthData = res.data.data[stockFullId].qfqmonth;
    } else {
		monthData = res.data.data[stockFullId].month;
    }
		
	let yearMap = {};
	let curYear;
	let maxPrice = -100000000;
	let minPrice = 1000000000;

    for (let i = 0; i < monthData.length; i++) {
		let arr = monthData[i];
		let year = arr[0].substr(0, 4); // arr[0] 是日期字符串，2019-08-30
		if (!yearMap[year]) {
			yearMap[year] = [
				arr[0], // 2019-08-30
				arr[1], // 1-开盘价
				0, // 2-收盘价
				0, // 3-最高价
				0, // 4-最低价
				0, // 5-总手
			]
			curYear = year;
			maxPrice = Number(arr[3])
			minPrice = Number(arr[4])
        }
		let theMaxPrice = Number(arr[3]);
		let theMinPrice = Number(arr[4]);
		if (theMaxPrice > maxPrice) {
			maxPrice = theMaxPrice;
        }

		if (theMinPrice < minPrice) {
			minPrice = theMinPrice;
        }

		yearMap[curYear][5] += Number(arr[5]);

		if (i + 1 < monthData.length) {
			let nextYear = monthData[i + 1][0].substr(0, 4)
			if (curYear != nextYear) {
				yearMap[curYear][2] = arr[2]; // 2-收盘价
				yearMap[curYear][3] = '' + maxPrice; // 最高价
				yearMap[curYear][4] = '' + minPrice; // 最低价
				// 以每年的最后一个交易日作为这年的日期
				yearMap[curYear][0] = arr[0];
            }
        } else {
			yearMap[curYear][2] = arr[2];
			yearMap[curYear][3] = '' + maxPrice;
			yearMap[curYear][4] = '' + minPrice;
			// 以每年的最后一个交易日作为这年的日期
			yearMap[curYear][0] = arr[0];
        }
    }

	let yearTmpList = [];
	let yearList = [];
	for (let key in yearMap) {
		yearTmpList.push({
			"year": key,
			"data": yearMap[key]
		});
    }
	yearTmpList.sort((a, b) => a.year > b.year ? 1 : -1);

	for (let i = 0; i < yearTmpList.length; i++) {
		yearList.push(yearTmpList[i].data);
    }

	let myKList = yearList;
	
	let dates = [];
    for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	castKListToNumbers(myKList);
	return myKList;
}