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
