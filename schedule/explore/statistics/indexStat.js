import { MongoClient } from 'mongodb';

let years = [ 2026, 2025, 2024 ];

const uri = 'mongodb://admin:admin123@127.0.0.1:27017';
const client = new MongoClient(uri);

function getKList(year, list) {
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < list.length; i++) {
        let theYear = parseInt(list[i].date.split('-')[0]);
        if (theYear === year && startIndex < 0) {
            startIndex = i - 1;
        }
        if (theYear > year && endIndex < 0) {
            endIndex = i;
        }
    }
    endIndex = endIndex >= 0 ? endIndex : list.length;
    return list.slice(startIndex, endIndex);
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
        // if (date === '2026-07-17') {
        //     console.log();
        // }
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
    console.log(mdArr.join('\n'));
    console.log();
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

async function doAnalyze(db, option) {
    console.log('## ' + option.indexTitle);
    const collection = db.collection('kline_index');

    const kLineData = await collection.findOne({ stockFullId: option.stockFullId });
    if (!kLineData) {
        console.log('kline_index 集合里没数据');
        console.log();
        process.exit(0);
    }

    for (let i = 0; i < years.length; i++) {
        await analyzePriceChange(years[i], kLineData.kList, option);
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
    console.log('\n' + option.nextRateTableTip);
    // console.log(JSON.stringify(rate2List));
    console.log(str);
    console.log();
}

(async function() {
    try {
        await client.connect();
        console.log('✅ 成功连接到 MongoDB\n');

        const db = client.db('mytrade');

        // 上证指数
        const option1 = {
            stockFullId: 'sh000001',
            rateConst3: 0.03,
            rateConst2: 0.02,
            nextRateTableTip: ``,
            indexTitle: '上证指数',
            rate2List: []
        };
        option1.nextRateTableTip = `### 上证指数 跌幅超过 ${option1.rateConst2 * 100}%`;
        await doAnalyze(db, option1);

        // 科创50
        const option2 = {
            stockFullId: 'sh000688',
            rateConst3: 0.05,
            rateConst2: 0.03,
            nextRateTableTip: ``,
            indexTitle: '科创50',
            rate2List: []
        };
        option2.nextRateTableTip = `### 科创50 跌幅超过 ${option2.rateConst2 * 100}%`,
        await doAnalyze(db, option2);
    } catch (error) {
        console.error('❌ 错误:', error);
    } finally {
        await client.close();
    }
}());