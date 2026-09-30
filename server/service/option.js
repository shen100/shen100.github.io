import axios from 'axios';
import iconv from 'iconv-lite';
import config from '../config/config.js';
import { doFilterOptionContracts } from './all_option_contracts_filter.js';

export async function requestOptionMinuteK(stockFullId) {
    let contractId = stockFullId.replace('option_', '');

    let reqUrl = config.sinaOptionMinuteUrl.replaceAll('{contractId}', contractId);
    reqUrl = reqUrl.replaceAll('{random}', Date.now());
    let res = await axios.get(reqUrl);

    const reg = /.*?var\s+(\w+)\s*=\s*\(\s*(\{[\s\S]*?\})\s*\)/s;

    let myKList = [];
    let prevDayClosePrice;
    let curPrice;

    const matchResult = res.data.match(reg);
    if (matchResult) {
        const jsonStr = matchResult[2];
        const obj = JSON.parse(jsonStr);
        const list = obj.result && obj.result.data || [];
        list.forEach(item => {
            if (typeof prevDayClosePrice === 'undefined') {
                prevDayClosePrice = item.p;
            }
            curPrice = item.p;
            let str = '';
            let arr = item.i.split(':');
            str += `${arr[0]}${arr[1]}`;
            str += ' ' + item.p;
            str += ' 0'; // 开盘至当前分钟累计成交总量
            str += ' 0'; // 开盘至当前分钟累计成交总金额 ( 接口返回的是元，转成万)
            myKList.push(str);
        });
    }

    return {
        myKList,
        stockInfo: [
            '',
            '',
            '',
            '' + curPrice, // 3
            '' + prevDayClosePrice, // 4
        ]
    }
}

export async function requestOptionDayK(stockFullId, startStr, endStr) {
    let contractId = stockFullId.replace('option_', '');

    let reqUrl = config.sinaOptionDayUrl.replaceAll('{contractId}', contractId);
    reqUrl = reqUrl.replaceAll('{stockFullId}', stockFullId);
    
    let res = await axios.get(reqUrl);

    const reg2 = /=\s*\(\s*(\[.*?\])\s*\)\s*;/s;
    const matchResult = res.data.match(reg2);
    let myKList = [];
    let dateInDayK;
    if (matchResult) {
        let kList = JSON.parse(matchResult[1]);
        kList = kList.filter(item => item.d >= startStr && item.d <= endStr);
        kList.forEach(item => {
            dateInDayK = item.d;
            myKList.push([
                item.d,
                item.o,
                item.c,
                item.h,
                item.l,
                item.v
            ]);
        });
    }

    if (dateInDayK && dateInDayK < endStr) {
        let resData = await getOptionQuote(contractId);
        if (resData && resData.date === endStr) {
            myKList.push([
                resData.date,
                resData.openPrice + '',
                resData.closePrice + '',
                resData.highPrice + '',
                resData.lowPrice + '',
                resData.volume + ''
            ]);
        }
    }

    return myKList;
}

/**
 * 实时盘口快照接口
 */
async function getOptionQuote(contractId) {
    let reqUrl = config.sinaRealTimeOptionQuoteUrl.replaceAll('{contractId}', contractId);
    reqUrl = reqUrl.replaceAll('{random}', Math.random);
    const res = await axios.get(reqUrl, {
        headers: {
            'Referer': 'https://stock.finance.sina.com.cn/',
            'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36"
        },
        responseType: 'arraybuffer'
    });

    // 编码改为 gb18030
    const buf = Buffer.from(res.data);
    const text = iconv.decode(buf, 'gb18030');

    const reg = /hq_str_(\w+)="([^"]*)"/g;
    const result = {};
    let m;
    while ((m = reg.exec(text)) !== null) {
        const code = m[1];
        const arr = m[2].split(',');
        result[code] = arr;
    }

    const list = result[`CON_OP_${contractId}`] || [];
    for (let i = 0; i < list.length; i++) {
        console.log(i, list[i]);
    }
    if (!list.length) {
        return null;
    }
    if (list.length === 1 && !list[0]) {
        return null;
    }
    return {
        date: list[32].split(' ')[0],
        closePrice: Number(list[2]),
        openPrice: Number(list[9]),
        highPrice: Number(list[39]),
        lowPrice: Number(list[40]),
        volume: Number(list[41]), // 成交量(张)
    }
}

// doFilterOptionContracts({
//     stockFullId: 'sh588000',
//     stockId: '588000',
//     stockName: '科创50ETF华夏', 
//     optionType: '购',
//     endMonth: '202606'
// });

doFilterOptionContracts({
    stockFullId: 'sh588000',
    stockId: '588000',
    stockName: '科创50ETF华夏', 
    optionType: '沽',
    endMonth: '202607'
});