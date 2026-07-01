import axios from 'axios'

function findFromRight(str, char) {
    const reversed = str.split('').reverse().join('');
    
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1;
    }
  
    return str.length - reversedIndex - 1;
}

export async function requestStockDetail(dayJSONMap, stock) {
    let key = `${stock.stockFullId}`;
    if (dayJSONMap && dayJSONMap[key]) {
        return dayJSONMap[key];
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

export async function requestDayK(dayJSONMap, stock, start, end, count) {
    let key = `${stock.stockFullId}-${start}-${end}-${count}`;

    if (dayJSONMap && dayJSONMap[key]) {
        return dayJSONMap[key];
    }
    let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",day," + start + "," + end + "," + count + ",qfq");
    let res = await axios.get(url);
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
	if (res.data.data[stock.stockFullId]['qfqday']) {
		myKList = res.data.data[stock.stockFullId].qfqday;
    } else {
		myKList = res.data.data[stock.stockFullId].day;
    }

	let todayStr = new Date().toISOString().substring(0, 10);
	let endStr = myKList && myKList.length && myKList[myKList.length - 1][0];
	if (endStr && todayStr > endStr && todayStr <= end) {
		let todayKData = await requestToday(stock.stockFullId);
		if (todayKData[0] > endStr) {
			myKList.push(todayKData);
		}
	}

	convertKListToNumbers(myKList)
	return myKList;
}

function convertKListToNumbers(myKList) {
    for (let i = 0; i < myKList.length; i++) {
        myKList[i][1] = Number(myKList[i][1]);
        myKList[i][2] = Number(myKList[i][2]);
        myKList[i][3] = Number(myKList[i][3]);
        myKList[i][4] = Number(myKList[i][4]);
        myKList[i][5] = Number(myKList[i][5]);
    }
}

async function requestToday(stockFullId) {
	let url = "https://qt.gtimg.cn/q=" + stockFullId;

	let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!res.data) {
		return;
    }

    let gbkData = res.data;
    const decoder = new TextDecoder('gbk');
    const utf8String = decoder.decode(gbkData);
    const jsonStr = utf8String;
	if (!jsonStr) {
        return;
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
		todayData[6],  // 总手
	];
	return kData;
}