import * as mongo from '../../database/mongo.js';

/**
 * 把公司按市值分组，统计每个分组下的公司数、总市值
 */
export async function queryShiZhi(req, res) {
    const db = await mongo.getDB();
    const collection = db.collection('stock_detail');
    const list = await collection.find({}).toArray();

    const shiZhiData = { count: 0, amount: 0 };
    const shiZhiList = [];
    const names = [ 
        '市值 < 100亿',
        '市值 >= 100亿 且 < 500亿',
        '市值 >= 500亿 且 < 1000亿',
        '市值 >= 1000亿 且 < 2000亿',
        '市值 >= 2000亿 且 < 5000亿',
        '市值 >= 5000亿 且 < 1万亿',
        '市值 >= 1万亿'
    ];
    for (let i = 0; i < 7; i++) {
        shiZhiList.push({ count: 0, amount: 0, percent: 0, name: names[i] });
    }

    const cond = [ 100, 500, 1000, 2000, 5000, 10000, 1000000 ];
    const stocks = [];
    for (let stock of list) {
        stocks.push({
            stockFullId: stock.stockFullId,
            stockId: stock.stockId,
            stockName: stock.stockName,
            zongShiZhi: stock.zongShiZhi,
        });
        shiZhiData.count += 1;
        shiZhiData.amount += stock.zongShiZhi || 0;
        for (let i = 0; i < cond.length; i++){
            if (stock.zongShiZhi < cond[i]) {
                shiZhiList[i].count += 1;
                shiZhiList[i].amount += stock.zongShiZhi;
                shiZhiList[i].minValue = cond[i - 1] || -1;
                shiZhiList[i].maxValue = cond[i];
                break;
            }
        }
    }
    for (let i = 0; i < cond.length; i++){
        shiZhiList[i].percent = (shiZhiList[i].count / shiZhiData.count * 100).toFixed(2) + '%';
    }

    res.json({
        code: 0,
        data: {
            stocks,
            shiZhiData,
            shiZhiList,
        }
    });
}