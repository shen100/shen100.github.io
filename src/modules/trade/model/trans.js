class Transaction {
    constructor() {
        this.action = ""; // zhuanRu, zhuanChu, maiRu, maiChu, guXiRu, hongGuRu, pllxgbRu, gxhlsBuJiao
		this.actionLabel = ""
		this.stockId = ""; // 603214, 603377
		this.stockName = ""
		this.price = 0.0
		this.firstBuyPrice = 0.0 // 首次买入这支股票的价格
		this.referencePrice = 0.0
		this.count = 0
		this.yongJin = 0.0
		this.yinHuaShui = 0.0
		this.guoHuFei = 0.0
		this.jingShouFei = 0.0
		this.zhengGuanFei = 0.0
		this.amount = 0.0 // 转入/转出金额
		this.createdAt = ""
		this.orderNO = 0 // 0, 1, 2, ...
    }
}

let trans = [];

function ymd(str) {
	return str.substr(0, 4) + "-" + str.substr(4, 2) + "-" + str.substr(6, 2)
}

function doZhuanRu(data) {
    for (let i = 0; i < data.length; i++) {
		let t = data[i];
		if (t.bussFlagName != "银行转存") {
			continue;
        }
		let tranData = new Transaction();
		tranData.action = "zhuanRu";
		tranData.actionLabel = t.bussFlagName;
		tranData.amount = Math.abs(Number(t.dealBalance));
		tranData.createdAt = ymd(t.dealDate);
		tranData.orderNO = i;
		trans.push(tranData);
    }
}

function doNeiBuZhuanRu(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i];
		if (t.bussFlagName != "内部转账存") {
			continue;
        }
		let tranData = new Transaction();
		tranData.action = "zhuanRu"
		tranData.actionLabel = t.bussFlagName
		tranData.amount = Math.abs(Number(t.dealBalance))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doZhuanChu(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i];
		if (t.bussFlagName != "银行转取") {
			continue;
        }
		let tranData = new Transaction();
		tranData.action = "zhuanChu"
		tranData.actionLabel = t.bussFlagName
		tranData.amount = Math.abs(Number(t.dealBalance))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doMaiRu(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "证券买入") {
			continue;
        }
		let stockId = '' + t.stockCode; // 600887, 601012
		let tranData = new Transaction();
		tranData.action = "maiRu"
		tranData.actionLabel = t.bussFlagName
		tranData.stockId = stockId
		tranData.stockName = t.stockName
		tranData.price = Math.abs(Number(t.dealPrice))
		tranData.count = Math.abs(Number(t.dealNum))
		tranData.yongJin = Math.abs(Number(t.handingFee2))
		tranData.yinHuaShui = Math.abs(Number(t.stampTax))
		tranData.guoHuFei = Math.abs(Number(t.transferFee2))
		tranData.jingShouFei = Math.abs(Number(t.exchangeFare0))
		tranData.zhengGuanFei = Math.abs(Number(t.exchangeFare3))
		tranData.createdAt = ymd(t.dealDate)
		// 买时花的钱， 买股票本身花的钱加上各种手续费
		tranData.amount = tranData.price * tranData.count 
		tranData.amount += tranData.yongJin
		tranData.amount += tranData.yinHuaShui
		tranData.amount += tranData.guoHuFei
		tranData.amount += tranData.jingShouFei
		tranData.amount += tranData.zhengGuanFei
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doMaiChu(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "证券卖出") {
			continue;
        }
		let stockId = '' + t.stockCode; // 600887, 601012
		let tranData = new Transaction();
		tranData.action = "maiChu"
		tranData.actionLabel = t.bussFlagName
		tranData.stockId = stockId
		tranData.stockName = t.stockName
		tranData.price = Math.abs(Number(t.dealPrice))
		tranData.count = Math.abs(Number(t.dealNum))
		tranData.yongJin = Math.abs(Number(t.handingFee2))
		tranData.yinHuaShui = Math.abs(Number(t.stampTax))
		tranData.guoHuFei = Math.abs(Number(t.transferFee2))
		tranData.jingShouFei = Math.abs(Number(t.exchangeFare0))
		tranData.zhengGuanFei = Math.abs(Number(t.exchangeFare3))
		tranData.createdAt = ymd(t.dealDate)
		// 卖出后得到的钱， 减去各种手续费
		tranData.amount = tranData.price * tranData.count
		tranData.amount -= tranData.yongJin
		tranData.amount -= tranData.yinHuaShui
		tranData.amount -= tranData.guoHuFei
		tranData.amount -= tranData.jingShouFei
		tranData.amount -= tranData.zhengGuanFei
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doGuXiRuZhang(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "股息入账") {
			continue;
        }
		let tranData = new Transaction();
		let stockId = '' + t.stockCode; // 600887, 601012
		tranData.action = "guXiRu"
		tranData.actionLabel = t.bussFlagName
		tranData.stockId = stockId
		tranData.stockName = t.stockName
		tranData.amount = Math.abs(Number(t.dealBalance))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doPiLiangLiXiGuiBen(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "利息归本") {
			continue;
        }
		let tranData = new Transaction();
		tranData.action = "pllxgbRu"
		tranData.actionLabel = t.bussFlagName
		tranData.amount = Math.abs(Number(t.dealBalance))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doGuXiHongLiShuiBuJiao(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "股息红利税补缴") {
			continue;
        }
		let tranData = new Transaction();
		let stockId = '' + t.stockCode; // 600887, 601012
		tranData.action = "gxhlsBuJiao"
		tranData.actionLabel = t.bussFlagName
		tranData.stockId = stockId
		tranData.stockName = t.stockName
		tranData.amount = Math.abs(Number(t.dealBalance))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function doHongGuRuZhang(data) {
	for (let i = 0; i < data.length; i++) {
		let t = data[i]
		if (t.bussFlagName != "红股入账") {
			continue;
        }
		let stockId = '' + t.stockCode; // 600887, 601012
		let tranData = new Transaction();
		tranData.action = "hongGuRu"
		tranData.actionLabel = t.bussFlagName
		tranData.stockId = stockId
		tranData.stockName = t.stockName
		tranData.count = Math.abs(Number(t.dealNum))
		tranData.createdAt = ymd(t.dealDate)
		tranData.orderNO = i
		trans.push(tranData)
    }
}

function comparePrice(firstTran, trans) {
	for (let i = 0; i < trans.length; i++) {
		if (trans[i] == firstTran) {
			continue
        }
		if (trans[i].stockId == firstTran.stockId) {
			trans[i].firstBuyPrice = firstTran.price;
			trans[i].referencePrice = firstTran.price;
        }
    }
}

function init() {
    let localTrans = JSON.parse(localStorage.getItem('trans') || '[]');

    doZhuanRu(localTrans)
	doNeiBuZhuanRu(localTrans)
	doZhuanChu(localTrans)
	doMaiRu(localTrans)
	doMaiChu(localTrans)
	doGuXiRuZhang(localTrans)
	doPiLiangLiXiGuiBen(localTrans)
	doGuXiHongLiShuiBuJiao(localTrans)
	doHongGuRuZhang(localTrans);

    trans.sort((a, b) => {
		if (a.createdAt > b.createdAt) {
			return -1;
		} else if (a.createdAt < b.createdAt) {
			return 1;
		}
		return a.orderNO < b.orderNO
    });
	
	let tMap = {}

    for (let i = trans.length - 1; i >= 0; i--) {
        if (trans[i].action == "maiRu" && !tMap[trans[i].stockId]) {
			tMap[trans[i].stockId] = true
			let firstBuyTran = trans[i]; // 首次买入这支股票的价格
			comparePrice(firstBuyTran, trans)
        }
    }
}

init();

export default trans;