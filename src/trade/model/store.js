import { formatLocalYMD } from '../util/date';

let settings = {
    allStockKChart: {
        type: 'year',
        start: '2000-01-01',
        end: formatLocalYMD(new Date()), // 2025-06-12
        page: 1
    }
};
let investedStocks = [];
let allStocks = [];

function init() {
    settings = JSON.parse(localStorage.getItem('tradeSettings') || JSON.stringify(settings));
    investedStocks = JSON.parse(localStorage.getItem('tradeInvestedStocks') || '[]');
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
}

init();

export default {
    settings,
    investedStocks,
    allStocks,
    setSettings: function(newSettings) {
        settings = newSettings;
        localStorage.setItem('tradeSettings', JSON.stringify(settings));
    },
}