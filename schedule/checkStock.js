import axios from 'axios';
import bluebird from 'bluebird';
import iconv from 'iconv-lite';

const stocks = [
    {
        stockFullId: 'sh513010',
        stockName: '恒生科技ETF易方达',
        maxPrice: 0.818
    },
    {
        stockFullId: 'sh600036',
        stockName: '招商银行',
        minPrice: 44
    }
]

function findFromRight(str, char) {
    const reversed = str.split('').reverse().join('');
    
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1;
    }
  
    return str.length - reversedIndex - 1;
}

async function requetStockTodayData(stockData) {
    let url = "https://qt.gtimg.cn/q=" + stockData.stockFullId;

    let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!res.data) {
        return;
    }

    let gbkData = res.data;
    const utf8String = iconv.decode(gbkData, 'gbk');
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
    const kData = [
        todayData[30], 
        todayData[5],  // 开盘价
        todayData[3],  // 收盘价
        todayData[33], // 最高价
        todayData[34], // 最低价
        todayData[6],  // 总手
    ];
    let price = kData[2];
    if (stockData.minPrice && price <= stockData.minPrice) {
        console.log(stockData.stockName + ' 的股价小于 ' + stockData.minPrice);
    } else if (stockData.maxPrice && price >= stockData.maxPrice) {
        console.log(stockData.stockName + ' 的股价大于 ' + stockData.maxPrice);
    }
}

(async function() {
    console.log(new Date().toISOString());
    await bluebird.map(stocks, function (stockData) {
        return requetStockTodayData(stockData);
    }, { concurrency: 20 });

    console.log('checkStock cron done.');
}());
