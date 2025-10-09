import { formatLocalYMD } from '../util/date';

let settings = {
    investedStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    },
    trackedStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    },
    allStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    },
    selectedStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    },
    etfStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    },
};

let tuShareToken = '';
let investedStocks = [];
let trackedStocks = [];
let allStocks = [];
let allStocksWithZongShiZhi = [];
let stockMarketStats = null;
let compositeIndex = null;

let etfStocks = [
    {
        stockFullId: "sh510300",
        stockId: "510300",
        stockName: "沪深300ETF"
    },
    {
        stockFullId: "sh588000",
        stockId: "588000",
        stockName: "科创50ETF"
    },
    {
        stockFullId: "sz159915",
        stockId: "159915",
        stockName: "创业板ETF"
    },
    {
        stockFullId: "sh513010",
        stockId: "513010",
        stockName: "恒生科技ETF易方达"
    },
    {
        stockFullId: "sz159696",
        stockId: "159696",
        stockName: "纳指ETF易方达"
    },
    {
        stockFullId: "sh513000",
        stockId: "513000",
        stockName: "日经225ETF易方达"
    },
    {
        stockFullId: "sh513730",
        stockId: "513730",
        stockName: "东南亚科技ETF"
    },
    {
        stockFullId: "sh513030",
        stockId: "513030",
        stockName: "德国ETF"
    },
    {
        stockFullId: "sh513080",
        stockId: "513080",
        stockName: "法国CAC40ETF"
    },
    {
        stockFullId: "sh518880",
        stockId: "518880",
        stockName: "黄金ETF"
    },
    {
        stockFullId: "sh512660",
        stockId: "512660",
        stockName: "军工ETF"
    },
    {
        stockFullId: "sz159928",
        stockId: "159928",
        stockName: "消费ETF"
    },
    {
        stockFullId: "sh512010",
        stockId: "512010",
        stockName: "医药ETF"
    },
    {
        stockFullId: "sz159869",
        stockId: "159869",
        stockName: "游戏ETF"
    },
    {
        stockFullId: "sz159566",
        stockId: "159566",
        stockName: "储能电池ETF"
    },
    {
        stockFullId: "sh515790",
        stockId: "515790",
        stockName: "光伏ETF"
    },
    {
        stockFullId: "sh562500",
        stockId: "562500",
        stockName: "机器人ETF"
    },
    {
        stockFullId: "sh512880",
        stockId: "512880",
        stockName: "证券ETF"
    },
    {
        stockFullId: "sz159995",
        stockId: "159995",
        stockName: "芯片ETF"
    },
    {
        stockFullId: "sh512200",
        stockId: "512200",
        stockName: "房地产ETF"
    },
    {
        stockFullId: "sh516310",
        stockId: "516310",
        stockName: "银行ETF易方达"
    },
    {
        stockFullId: "sh512400",
        stockId: "512400",
        stockName: "有色金属ETF"
    }
];

function initCompositeIndex() {
    compositeIndex = JSON.parse(localStorage.getItem('tradeCompositeIndex') || 'null');
    if (!compositeIndex) {
        return;
    }
    let dateMap = {};
    // compositeIndex 为
    // {
    //     "index0": {
    //         "20050620": {
    //             "amount": 0, 
    //             "count": 0
    //         }
    //     }
    // }
    for (let key in compositeIndex) {
        // key index0
        if (key === 'updatedAt') {
            continue;
        }
        // date 20050620
        for (let date in compositeIndex[key]) {
            dateMap[date] = true;
        }
    }
    for (let key in compositeIndex) {
        if (key === 'updatedAt') {
            continue;
        }
        for (let date in dateMap) {
            if (!compositeIndex[key][date]) {
                compositeIndex[key][date] = {
                    amount: 0,
                    count: 0,
                };
            }
        }
    }
}

function init() {
    tuShareToken = localStorage.getItem('tradeTuShareToken') || '';
    stockMarketStats = JSON.parse(localStorage.getItem('tradeStockMarketStats') || 'null');
    settings = JSON.parse(localStorage.getItem('tradeSettings') || JSON.stringify(settings));
    investedStocks = JSON.parse(localStorage.getItem('tradeInvestedStocks') || '[]');
    trackedStocks = JSON.parse(localStorage.getItem('tradeTrackedStocks') || '[]');
    let localAllStocks = JSON.parse(localStorage.getItem('tradeAllStocks') || '{"items": []}');
    allStocks = localAllStocks.items.map(stock => {
        let stockData = {};
        localAllStocks.fields.forEach((field, i) => {
            stockData[field] = stock[i];
            if (field === 'ts_code') {
                let arr = stock[i].split('.');
                stockData['stockId'] = arr[0];
                stockData['stockFullId'] = arr[1].toLowerCase() + '' + arr[0];
                stockData['stockName'] = stock[2];
            }
        });
        return stockData;
    });

    allStocksWithZongShiZhi = JSON.parse(localStorage.getItem('tradeAllStocksWithZongShiZhi') || '[]');

    initCompositeIndex();
}

init();

export default {
    tuShareToken,
    settings,
    allStocks,
    stockMarketStats,
    compositeIndex,
    getEtfStocks: function() {
        return etfStocks;
    },
    getInvestedStocks: function() {
        return investedStocks;
    },
    getTrackedStocks: function() {
        return trackedStocks;
    },
    getSelectedStocks: function() {
        let selectedStocks = JSON.parse(localStorage.getItem('tradeSelectedStocks') || '[]');
        if (!selectedStocks) {
            return [];
        }
        return selectedStocks;
    },
    setSelectedStocks: function(selectedStocks) {
        localStorage.setItem('tradeSelectedStocks', JSON.stringify(selectedStocks));
    },
    setSettings: function(newSettings) {
        settings = newSettings;
        localStorage.setItem('tradeSettings', JSON.stringify(settings));
    },
    setAllStocksWithZongShiZhi: function(stocks) {
        localStorage.setItem('tradeAllStocksWithZongShiZhi', JSON.stringify(stocks));
    },
    getAllStocksWithZongShiZhi: function() {
        return allStocksWithZongShiZhi;
    },
    addTrackedStock: function(stock) {
        if (!trackedStocks.some(s => s.stockId === stock.stockId)) {
            trackedStocks.push(stock);
            localStorage.setItem('tradeTrackedStocks', JSON.stringify(trackedStocks));
        }
    },
    addInvestedStock: function(stock) {
        if (!investedStocks.some(s => s.stockId === stock.stockId)) {
            investedStocks.push(stock);
            localStorage.setItem('tradeInvestedStocks', JSON.stringify(investedStocks));
        }
    },
    updateStockMarketStats: function(stats) {
        localStorage.setItem('tradeStockMarketStats', JSON.stringify(stats));
    },
    updateCompositeIndex: function(compositeIndex) {
        localStorage.setItem('tradeCompositeIndex', JSON.stringify(compositeIndex));
    }
}