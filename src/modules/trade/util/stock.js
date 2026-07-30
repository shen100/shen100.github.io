import axios from 'axios'

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

export async function requestDayK(stock, start, end, count) {
	let url = "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param="
	url += (stock.stockFullId + ",day," + start + "," + end + "," + count + ",qfq");
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
        myKList[i][5] = Number(myKList[i][5]); // 成交量(总手)
		myKList[i][6] = myKList[i][6];
		myKList[i][7] = Number(myKList[i][7]); // 换手率
		myKList[i][8] = Number(myKList[i][8]); // 成交额(竞)，单位 万
    }
}

export async function requestWeekK(stock, start, end, count) {
	resetData(stock, start, end, count);
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",week," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqweek']) {
		myKList = res.data.data[stock.stockFullId].qfqweek;
    } else {
		myKList = res.data.data[stock.stockFullId].week;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	updateKListData(myKList);
	updateChart("week");
}

export async function requestMonthK(stock, start, end, count) {
	resetData(stock, start, end, count);
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		myKList = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		myKList = res.data.data[stock.stockFullId].month;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	updateKListData(myKList);
	updateChart("month")
}

export async function requestYearK(stock, start, end, count) {
	resetData(stock, start, end, count);
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
    let monthData;
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		monthData = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		monthData = res.data.data[stock.stockFullId].month;
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
	updateKListData(myKList);
	updateChart("year")
}