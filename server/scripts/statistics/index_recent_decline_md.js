import { fileURLToPath } from 'url';
import * as mongo from '../../database/mongo.js';
import stockNetUtil from '../../util/stock_net_util.js';

const __filename = fileURLToPath(import.meta.url);

let isMain = false;

if (process.argv[1] === __filename) {
    isMain = true;
}

let years = [ 2026, 2025, 2024 ];

function getKList(year, list) {
    let startIndex = -1;
    let endIndex = -1;
    // list 里的数据，从小日期，往大日期 排序
    for (let i = 0; i < list.length; i++) {
        let theYear = parseInt(list[i].date.split('-')[0]);
        // 如果 year 是 2026，那把 2025 年的最后一个交易日也返回
        // 因为2026 年第一个交易日的涨幅，是相对于2025 年的最后一个交易日的
        if (theYear === year && startIndex < 0) {
            startIndex = i - 1;
        }
        if (theYear > year && endIndex < 0) {
            endIndex = i;
        }
    }
    endIndex = endIndex >= 0 ? endIndex : list.length;
    const list2 =  list.slice(startIndex, endIndex);
    return list2;
}

function padStr(list, padCount) {
    padCount = padCount || 11;
    for (let i = 0; i < list.length; i++) {
        let str = list[i];
        str = str.padEnd(padCount, ' '); // 在字符串末尾填充，适用于左对齐
        str = str.replace(/ /g, "&nbsp;");
        list[i] = str;
    }
    return list.join('');
}

async function analyzePriceChange(year, list, option) {
    let kList = getKList(year, list);

    let upCount = 0;
    let downCount = 0;

    let up3RateCount = 0;
    let up3RateList = [];
    let up3DateList = [];

    let down3RateCount = 0;
    let down3RateList = [];
    let down3DateList = [];

    for (let i = 1; i < kList.length; i++) {
        let date = kList[i].date;
        let price1 = kList[i - 1].closePrice;
        let price2 = kList[i].closePrice;
        if (price2 > price1) {
            upCount++;
        }
        if (price2 < price1) {
            downCount++;
        }

        let rate = (price2 - price1) / price1;
        if (rate >= option.rateConst3) {
            up3RateCount++;
            up3RateList.push((rate * 100).toFixed(2) + '%');
            up3DateList.push(date.substring(5));
        }
        if (rate <= -option.rateConst3) {
            down3RateCount++;
            down3RateList.push((rate * 100).toFixed(2) + '%');
            down3DateList.push(date.substring(5));
        }

        if (rate <= -option.rateConst2 && i + 1 < kList.length) {
            let price3 = kList[i + 1].closePrice;
            let nextRate = (price3 - price2) / price2;
            option.rate2List.push({
                date,
                rate: (rate * 100).toFixed(2) + '%',
                nextRate,
                nextRatePercent: (nextRate * 100).toFixed(2) + '%',
            });
        }
    }

    let mdArr = [
    `### ${year}年${option.indexTitle}`,
    `|   字段  |  值 |`,
    `| ---------- | --------- |`,
    `| 上涨天数  | ${upCount}   |`,
    `| 下跌天数  | ${downCount}     | `,
    `| 涨幅 >= ${option.rateConst3 * 100}% 的天数 | ${up3RateCount}<br>${padStr(up3DateList)}<br>${padStr(up3RateList)} |`,
    `| 跌幅 >= ${option.rateConst3 * 100}% 的天数 | ${down3RateCount}<br>${padStr(down3DateList, 12)}<br>${padStr(down3RateList)} |`
    ];
    if (up3RateCount === 0) {
        mdArr[5] = `| 涨幅 >= ${option.rateConst3 * 100}% 的天数 | ${up3RateCount}`;
    }
    if (down3RateCount === 0) {
        mdArr[6] = `| 跌幅 >= ${option.rateConst3 * 100}% 的天数 | ${down3RateCount}`;
    }
    return mdArr.join('\n') + '\n';
}

async function requestKList(stockFullId, startStr, endStr, count) {
    let myKList = await stockNetUtil.requestDayK(stockFullId, startStr, endStr, count);
    let kList = myKList.map((item) => {
        return {
            date: item[0],
            openPrice: item[1],
            closePrice: item[2],
            highPrice: item[3],
            lowPrice: item[4],
            volume: item[5]
        }
    });
    return kList;
}

async function runTask(db, option) {
    let outputStr = '## ' + option.indexTitle + '\n'

    for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const kList = await requestKList(option.stockFullId, `${year - 1}-12-01`, `${year}-12-31`, 1000);
        if (!(kList && kList.length)) {
            console.log('kList 没数据');
            return '';
        }
        outputStr += await analyzePriceChange(year, kList, option);
        outputStr += '\n';
    }

    option.rate2List.sort((a, b) => {
        return a.date > b.date ? 1 : -1;
    });
    let rate2List = option.rate2List;

    let str = `|     日期    |   跌幅   |    下一交易日涨幅(%)     | 下一交易日涨幅 |
| ----------- | -------- | ------------------------ | -------------- |\n`;
    for (let i = 0; i < rate2List.length; i++) {
        str = str + `| ${rate2List[i].date}  | ${rate2List[i].rate}   |  ${rate2List[i].nextRatePercent} | ${rate2List[i].nextRate}   |\n`;
    }

    outputStr += ('\n' + option.nextRateTableTip);
    outputStr += ('\n' + str);
    outputStr += '\n';
    return outputStr;
}

export async function exec(option) {
    try {
        const logger = option && option.logger || defaultLogger;
        let startTime = Date.now();
        logger.info('开始执行');
        const db = await mongo.getDB();

        // 上证指数
        const option1 = {
            stockFullId: 'sh000001',
            rateConst3: 0.03, // 跌幅超过 3%
            rateConst2: 0.02, // 跌幅超过 2%
            nextRateTableTip: ``,
            indexTitle: '上证指数',
            rate2List: []
        };
        option1.nextRateTableTip = `### 上证指数 跌幅超过 ${option1.rateConst2 * 100}%`;
        let outputStr1 = await runTask(db, option1);
        

        // 科创50
        const option2 = {
            stockFullId: 'sh000688',
            rateConst3: 0.05,
            rateConst2: 0.03,
            nextRateTableTip: ``,
            indexTitle: '科创50',
            rate2List: []
        };
        option2.nextRateTableTip = `### 科创50 跌幅超过 ${option2.rateConst2 * 100}%`;
        let outputStr2 = await runTask(db, option2);
        console.log(outputStr1);
        console.log(outputStr2);

        const createdAt = new Date();
        const taskExecCol = db.collection('task_exec_history');
        await taskExecCol.insertOne({
            taskName: 'index_recent_decline_md',
            createdAt
        });

        let endTime = Date.now();
        let logMsg = `总用时 ${(endTime - startTime) / 1000} 秒`;
        console.log(logMsg);
        logger.info(logMsg);

        return {
            chapterId: 1784641704413,
            outputStr: outputStr1 + outputStr2,
            createdAt
        };
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        if (isMain) {
            await mongo.close();
        }
    }
}

/**
 * 统计上证指数、科创50近几年的跌幅
 */
if (isMain) {
    await exec();
}