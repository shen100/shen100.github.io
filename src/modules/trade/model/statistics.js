import axios from 'axios'
import trans from './trans'
import stock from './stock'
import { addStockExchangePrefix } from '../util/big_a'

class Statistics {
    constructor() {
        this.yongJin = 0.0
        this.yongJinRate = 0.0
        this.yinHuaShui = 0.0
        this.yinHuaShuiRate = 0.0
        this.guoHuFei = 0.0
        this.guoHuFeiRate = 0.0
        this.jingShouFei = 0.0
        this.jingShouFeiRate = 0.0
        this.zhengGuanFei = 0.0
        this.zhengGuanFeiRate = 0.0

        this.zhuanRu = 0.0
        this.zhuanChu = 0.0
        this.shengYu = 0.0

        this.maiRu = 0.0
        this.maiChu = 0.0

        this.guXi = 0.0

        // 批量利息归本
        this.pllxgbRu = 0.0

		// 股息红利税补缴
		this.gxhlsBuJiao = 0.0
        this.gxhlsBuJiaoRate = 0.0

        this.shiZhi = 0.0

        // 历史持股(支)
        this.chiGu = 0

        this.shouYi = 0.0
        this.shouYiRate = 0.0
    }
}

let statistics = new Statistics();
let stockMap = {};
let stockProfitList = [];
let priceMap = {} // 每支股票最新价
let priceLoaded = false // 每支股票最新价都加载完成
let stockCount = 0; // 手中还保留了多少支股票
let isInited = false;

// 不要出现 -0 的情况
function absAndMinZero(value) {
	if (value) {
		return Math.abs(value);
	}
	return 0;
}

function createOrGetStock(stockId) {
	var stockData
	if (!stockMap[stockId]) {
		stockData = new stock.Stock();
		stockData.stockId = stockId
		stockMap[stockId] = stockData
	} else {
		stockData = stockMap[stockId]
	}
	return stockData
}

// https://developer.aliyun.com/article/545892
//0: 未知  
//1: 名字  
//2: 代码  
//3: 当前价格  
//4: 昨收  
//5: 今开  
//6: 成交量（手）  
//7: 外盘  
//8: 内盘  
//9: 买一  
//10: 买一量（手）  
//11-18: 买二 买五  
//19: 卖一  
//20: 卖一量  
//21-28: 卖二 卖五  
//29: 最近逐笔成交  
//30: 时间  
//31: 涨跌  
//32: 涨跌%  
//33: 最高  
//34: 最低  
//35: 价格/成交量（手）/成交额  
//36: 成交量（手）  
//37: 成交额（万）  
//38: 换手率  
//39: 市盈率  
//40:   
//41: 最高  
//42: 最低  
//43: 振幅  
//44: 流通市值  
//45: 总市值  
//46: 市净率  
//47: 涨停价  
//48: 跌停价
async function requestStock(stockId, callback) {
    let stockFullId = addStockExchangePrefix(stockId);
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

	let data = jsonStr.split('~');
	let price = Number(data[3])
	priceMap[stockId] = price
	
	if (Object.keys(priceMap).length == stockCount) {
		priceMap["600887"] = 27.88
		priceMap["603345"] = 75.10
		priceMap['000858'] = 124.52
		priceMap['002223'] = 35.51
		priceMap['601012'] = 16.38
		// priceMap["000089"] = 7.06
		//priceMap["000089"] = 6.39
		//priceMap["002507"] = 12.09
		//priceMap["603288"] = 34.22
		//priceMap["600305"] = 6.97
		//priceMap["601012"] = 13.46
		//priceMap["601633"] = 24.01
		
		priceLoaded = true
		isInited = true
		initStatistics()
        callback && callback();
    }
}

function getAllShouXuFei(tranData) {
	let amount = 0;
	amount += absAndMinZero(tranData.yongJin)
	amount += absAndMinZero(tranData.yinHuaShui)
	amount += absAndMinZero(tranData.guoHuFei)
	amount += absAndMinZero(tranData.jingShouFei)
	amount += absAndMinZero(tranData.zhengGuanFei)
	return amount;
}

let stockBuyTotal = 0;
let amount2 = 0;

function initStatistics() {
    for (let i = 0; i < trans.length; i++) {
		let tranData  = trans[i]
		if (tranData.action == "zhuanRu") {
			statistics.zhuanRu += absAndMinZero(tranData.amount)
			statistics.shengYu += absAndMinZero(tranData.amount)
		}
		if (tranData.action == "zhuanChu") {
			statistics.zhuanChu += absAndMinZero(tranData.amount)
			statistics.shengYu -= absAndMinZero(tranData.amount)
		}
		if (tranData.action == "maiRu") {
			statistics.yongJin += absAndMinZero(tranData.yongJin)
			statistics.yinHuaShui += absAndMinZero(tranData.yinHuaShui)
			statistics.guoHuFei += absAndMinZero(tranData.guoHuFei)
			statistics.jingShouFei += absAndMinZero(tranData.jingShouFei)
			statistics.zhengGuanFei += absAndMinZero(tranData.zhengGuanFei)
			statistics.maiRu += absAndMinZero(tranData.price * tranData.count)

			statistics.shengYu -= getAllShouXuFei(tranData)
			statistics.shengYu -= absAndMinZero(tranData.price * tranData.count)
			stockBuyTotal += absAndMinZero(tranData.price * tranData.count)

			let stock = createOrGetStock(tranData.stockId);
			stock.stockName = tranData.stockName
			stock.count += absAndMinZero(tranData.count)
			stock.spent += getAllShouXuFei(tranData)
			stock.spent += absAndMinZero(tranData.price * tranData.count)
		}
		if (tranData.action == "maiChu") {
			statistics.yongJin += absAndMinZero(tranData.yongJin)
			statistics.yinHuaShui += absAndMinZero(tranData.yinHuaShui)
			statistics.guoHuFei += absAndMinZero(tranData.guoHuFei)
			statistics.jingShouFei += absAndMinZero(tranData.jingShouFei)
			statistics.zhengGuanFei += absAndMinZero(tranData.zhengGuanFei)
			statistics.maiChu += absAndMinZero(tranData.price * tranData.count)

			statistics.shengYu -= getAllShouXuFei(tranData)
			statistics.shengYu += absAndMinZero(tranData.price * tranData.count)

			amount2 += absAndMinZero(tranData.price * tranData.count)

			let stock = createOrGetStock(tranData.stockId)
			stock.count -= absAndMinZero(tranData.count)
			stock.got -= getAllShouXuFei(tranData)
			stock.got += absAndMinZero(tranData.price * tranData.count)
		}
		if (tranData.action == "guXiRu") {
			statistics.guXi += absAndMinZero(tranData.amount)
			statistics.shengYu += absAndMinZero(tranData.amount)
			let stock = createOrGetStock(tranData.stockId)
			stock.got += absAndMinZero(tranData.amount)
		}
		if (tranData.action == "pllxgbRu") { // 批量利息归本
			// 不属于某一支股票
			statistics.pllxgbRu += absAndMinZero(tranData.amount)
			statistics.shengYu += absAndMinZero(tranData.amount)
		}
		if (tranData.action == "gxhlsBuJiao") { // 股息红利税补缴
			let stock = createOrGetStock(tranData.stockId);
			stock.got -= absAndMinZero(tranData.amount)
			statistics.gxhlsBuJiao += absAndMinZero(tranData.amount)
			statistics.shengYu -= absAndMinZero(tranData.amount)
		}
		if (tranData.action == "hongGuRu") {
			let stock = createOrGetStock(tranData.stockId)
			stock.count += tranData.count
        }
    }

	console.log('stockBuyTotal', stockBuyTotal, 'amount2', amount2)

	for (let key in stockMap) {
		let stock = stockMap[key]
		statistics.chiGu += 1
		if (stock.count) {
			var price = priceMap[key]
			if (price) {
				statistics.shiZhi += stock.count * price
				stock.price = price
				stock.earn = stock.count * price + stock.got - stock.spent
				// 0 = stock.count * stock.avgCost + stock.got - stock.spent
				stock.avgCost = (stock.spent - stock.got) / stock.count
            }
        } else {
			stock.earn = stock.got - stock.spent
        }
		stockProfitList.push(stock)
    }
	
	let maiMai = statistics.maiRu + statistics.maiChu
	statistics.yongJinRate = statistics.yongJin / maiMai
	statistics.yinHuaShuiRate = statistics.yinHuaShui / maiMai
	statistics.guoHuFeiRate = statistics.guoHuFei / maiMai
	statistics.jingShouFeiRate = statistics.jingShouFei / maiMai
	statistics.zhengGuanFeiRate = statistics.zhengGuanFei / maiMai
	statistics.gxhlsBuJiaoRate = statistics.gxhlsBuJiao / maiMai

	let addAmount = statistics.shiZhi + statistics.maiChu 
	addAmount += statistics.guXi
	addAmount += statistics.pllxgbRu
	let subtractAmount = statistics.maiRu + statistics.yongJin 
	subtractAmount += statistics.yinHuaShui 
	subtractAmount += statistics.guoHuFei 
	subtractAmount += statistics.jingShouFei 
	subtractAmount += statistics.zhengGuanFei
	subtractAmount += statistics.gxhlsBuJiao
	statistics.shouYi = addAmount - subtractAmount

	let finalIn = statistics.zhuanRu - statistics.zhuanChu - statistics.shengYu
	statistics.shouYiRate = (statistics.shouYi / finalIn) * 100;

	stockProfitList.sort((a, b) => {
		if (a.earn > b.earn) {
			return -1
        }
		return 1
	})
	
	// SignalManager.emitter.statistics_inited.emit()
}

function init(callback) {
	if (isInited) {
		if (callback) {
			setTimeout(() => callback(), 10);
		}
		return;
	}
    let stockCountMap = {};
    stockCount = 0;
    for (let i = 0; i < trans.length; i++) {
        let stockId = trans[i].stockId;
        stockCountMap[stockId] = stockCountMap[stockId] || { stockId, count: 0 };
        if (trans[i].action == "maiRu") {
            stockCountMap[stockId].count += absAndMinZero(trans[i].count);
        } else if (trans[i].action == "maiChu") {
            stockCountMap[stockId].count -= absAndMinZero(trans[i].count);
        }
    }

    for (let key in stockCountMap) {
        if (stockCountMap[key].count <= 0) {
            delete stockCountMap[key];
        }
    }
	for (let key in stockCountMap) {
        stockCount++;
        requestStock(key, callback)
    }
}

export default {
    init,
    getStatisticsData() {
        return statistics;
    },
    getStockProfitList() {
        return stockProfitList;
    }
}