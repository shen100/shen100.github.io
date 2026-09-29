import axios from 'axios';
import config from '../config/config.js';
import allOptionContracts from '../data/all_option_contracts.json' with { type: 'json' }


let fields = allOptionContracts.data.fields;
let optionContracts = [];

(function() {
    for (let i = 0; i < allOptionContracts.data.items.length; i++) {
        let myItem = {};
        let item = allOptionContracts.data.items[i];
        for (let j = 0; j < fields.length; j++) {
            myItem[fields[j]] = item[j];
            let arr = myItem.ts_code.split('.');
            myItem.stockFullId = arr[1].toLowerCase() + arr[0];
        }
        optionContracts.push(myItem);
    }

    let outputList = [];
    for (let i = 0; i < optionContracts.length; i++) {
        const optionContract = optionContracts[i];
        if (optionContract.opt_code.indexOf('588000') > 0
                && optionContract.name.indexOf('购') > 0
                && optionContract.s_month === '202411') {
            outputList.push({
                ...optionContract
            });
        }
    }
    outputList.sort((a, b) => a.name > b.name ? 1 : -1);
    for (let i = 0; i < outputList.length; i++) {
        console.log(`${outputList[i].ts_code} ${outputList[i].name}`);
    }
}());

console.log('全部期权合约数量:', optionContracts.length);
console.log('期权合约数据结构:', optionContracts[optionContracts.length - 1]);
console.log();

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
    if (matchResult) {
        let kList = JSON.parse(matchResult[1]);
        kList = kList.filter(item => item.d >= startStr && item.d <= endStr);
        kList.forEach(item => {
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

    return myKList;
}