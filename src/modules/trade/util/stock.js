import axios from 'axios'

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
		price: Number(arr[3] || '3'), // 当前价格  
	}
}

export async function requestMonthK(stock, start, end, count) {
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		return null;
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
	return myKList;
}