import trans from './trans'
import stock from './stock'

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

        // 红利差异税扣税
        this.hlcysKouShui = 0.0
        this.hlcysKouShuiRate = 0.0

        this.shiZhi = 0.0

        // 历史持股(支)
        this.chiGu = 0.0

        // 卖出股(支)
        this.maiChuGu = 0.0

        this.shouYi = 0.0
        this.shouYiRate = 0.0
    }
}

let statistics = new Statistics();
let stockMap = {};
let stockProfitList = [];

function absAndMinZero(value) {
	if (value) {
		return Math.abs(value);
	}
	return 0;
}

function createOrGetStock(stockId) {
	var stockData
	if (!stockMap[stockId]) {
		stockData = stock.Stock;
		stockData.stockId = stockId
		stockMap[stockId] = stock
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

// 每支股票最新价
let priceMap = {}
let priceLoaded = false

async function requestStock(stockFullId) {
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
	let price = float(data[3])
	priceMap[stockFullId.substr(2)] = price
	
	let keyCount1 = 0
	for (key in priceMap) {
		keyCount1 += 1
	}

	let keyCount2 = 0
	for (key in StockModule.stockIdMap) {
		keyCount2 += 1
	}
	if (keyCount1 == keyCount2) {
		//priceMap["600900"] = 29.39
		//priceMap["688981"] = 46.16
		//priceMap["600887"] = 25.61
		//priceMap["000089"] = 6.39
		//priceMap["002507"] = 12.09
		//priceMap["603288"] = 34.22
		//priceMap["600305"] = 6.97
		//priceMap["601012"] = 13.46
		//priceMap["601633"] = 24.01
		
		priceLoaded = true
		initStatistics()
    }
}

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

			statistics.shengYu -= absAndMinZero(tranData.yongJin)
			statistics.shengYu -= absAndMinZero(tranData.yinHuaShui)
			statistics.shengYu -= absAndMinZero(tranData.guoHuFei)
			statistics.shengYu -= absAndMinZero(tranData.jingShouFei)
			statistics.shengYu -= absAndMinZero(tranData.zhengGuanFei)
			statistics.shengYu -= absAndMinZero(tranData.price * tranData.count)

			let stock = createOrGetStock(tranData.stockId);
			stock.stockName = tranData.stockName
			stock.count += absAndMinZero(tranData.count)
			stock.spent += absAndMinZero(tranData.price * tranData.count)
			stock.spent += absAndMinZero(tranData.yongJin)
			stock.spent += absAndMinZero(tranData.yinHuaShui)
			stock.spent += absAndMinZero(tranData.guoHuFei)
			stock.spent += absAndMinZero(tranData.jingShouFei)
			stock.spent += absAndMinZero(tranData.zhengGuanFei)
		}
		if (tranData.action == "maiChu") {
			statistics.yongJin += absAndMinZero(tranData.yongJin)
			statistics.yinHuaShui += absAndMinZero(tranData.yinHuaShui)
			statistics.guoHuFei += absAndMinZero(tranData.guoHuFei)
			statistics.jingShouFei += absAndMinZero(tranData.jingShouFei)
			statistics.zhengGuanFei += absAndMinZero(tranData.zhengGuanFei)
			statistics.maiChu += absAndMinZero(tranData.price * tranData.count)

			statistics.shengYu -= absAndMinZero(tranData.yongJin)
			statistics.shengYu -= absAndMinZero(tranData.yinHuaShui)
			statistics.shengYu -= absAndMinZero(tranData.guoHuFei)
			statistics.shengYu -= absAndMinZero(tranData.jingShouFei)
			statistics.shengYu -= absAndMinZero(tranData.zhengGuanFei)
			statistics.shengYu += absAndMinZero(tranData.price * tranData.count)

			let stock = createOrGetStock(tranData.stockId)
			stock.count -= absAndMinZero(tranData.count)
			stock.got += absAndMinZero(tranData.price * tranData.count)
			stock.got -= absAndMinZero(tranData.yongJin)
			stock.got -= absAndMinZero(tranData.yinHuaShui)
			stock.got -= absAndMinZero(tranData.guoHuFei)
			stock.got -= absAndMinZero(tranData.jingShouFei)
			stock.got -= absAndMinZero(tranData.zhengGuanFei)
		}
		if (tranData.action == "guXiRu") {
			statistics.guXi += absAndMinZero(tranData.amount)
			statistics.shengYu += absAndMinZero(tranData.amount)
			let stock = createOrGetStock(tranData.stockId)
			stock.got += absAndMinZero(tranData.amount)
		}
		if (tranData.action == "pllxgbRu") {
			// 不属于某一支股票
			statistics.pllxgbRu += absAndMinZero(tranData.amount)
			statistics.shengYu += absAndMinZero(tranData.amount)
		}
		if (tranData.action == "hlcysKouShui") {
			let stock = createOrGetStock(tranData.stockId);
			stock.got -= absAndMinZero(tranData.amount)
			statistics.hlcysKouShui += absAndMinZero(tranData.amount)
			statistics.shengYu -= absAndMinZero(tranData.amount)
		}
		if (tranData.action == "hongGuRu") {
			let stock = createOrGetStock(tranData.stockId)
			stock.count += tranData.count
        }
    }

	for (key in stockMap) {
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
			statistics.maiChuGu += 1
        }
		stockProfitList.append(stock)
    }
	
	let maiMai = statistics.maiRu + statistics.maiChu
	statistics.yongJinRate = statistics.yongJin / maiMai
	statistics.yinHuaShuiRate = statistics.yinHuaShui / maiMai
	statistics.guoHuFeiRate = statistics.guoHuFei / maiMai
	statistics.jingShouFeiRate = statistics.jingShouFei / maiMai
	statistics.zhengGuanFeiRate = statistics.zhengGuanFei / maiMai
	statistics.hlcysKouShuiRate = statistics.hlcysKouShui / maiMai

	let addAmount = statistics.shiZhi + statistics.maiChu 
	addAmount += statistics.guXi
	addAmount += statistics.pllxgbRu
	let subtractAmount = statistics.maiRu + statistics.yongJin 
	subtractAmount += statistics.yinHuaShui 
	subtractAmount += statistics.guoHuFei 
	subtractAmount += statistics.jingShouFei 
	subtractAmount += statistics.zhengGuanFei
	subtractAmount += statistics.hlcysKouShui
	statistics.shouYi = addAmount - subtractAmount

	let finalIn = statistics.zhuanRu - statistics.zhuanChu - statistics.shengYu
	statistics.shouYiRate = ((addAmount - subtractAmount) / finalIn) * 100

	stockProfitList.sort((a, b) => {
		if (a.earn > b.earn) {
			return -1
        }
		return 1
	})
	
	// SignalManager.emitter.statistics_inited.emit()
}

function init() {
    let stockCountMap = {};
    for (let i = 0; i < trans.length; i++) {
        let stockId = trans[i].stockId;
        stockCountMap[stockId] = stockCountMap[stockId] || { stockId, count: 0 };
        if (tranData.action == "maiRu") {
            stockCstockCountMapountMap[stockId].count += absAndMinZero(trans[i].count);
        } else if (tranData.action == "maiChu") {
            stockCountMap[stockId].count -= absAndMinZero(trans[i].count);
        }
    }

    for (key in stockCountMap) {
        if (stockCountMap[key].count <= 0) {
            delete StockModule.stockIdMap[key];
        }
    }
	for (key in stockCountMap) {
        requestStock(key)
    }
}

export default {
    init
}