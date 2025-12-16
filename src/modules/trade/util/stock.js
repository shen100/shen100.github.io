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