import * as mongo from '../../database/mongo.js';

/**
 * 每日上涨股票数(和前十天每天的股价相比)
 * 假如股票A在7月27日的收盘价是100, 那和前十天每天的收盘价相比，100都是最大值的话，
 * 那么就把7月27日的上涨股票数加 1
 */
export async function queryDailyUpCount(req, res) {
    const db = await mongo.getDB();
    const collection = db.collection('daily_up_count');

    const projection = {
        date: 1,
        count: 1,
        statDayCount: 1,
        stocks: 1,
        _id: 0 // 不返回 _id
    };
    let list = await collection.find({
        statDayCount: 10, 
        date: {$gte: '2025-10-01' }
    }, { projection }).sort({ date: 1 }).toArray();

    res.json({
        code: 0,
        data: {
            list,
        }
    });
}

/**
 * 概念板块每日资金流向
 */
export async function queryDailyMoneyFlow(req, res) {
    const db = await mongo.getDB();
    const collection = db.collection('money_flow');
    let list = await collection.aggregate([
        { $match: { date: { $gt: '2026-01-01' } } },
        { $sort: { date: 1 } },
        // 按 concept 分组，把所需字段压入数组
        { $group: {
            _id: '$concept',
            dates: { $push: { amount: '$amount', date: '$date' } }
        }},
        // 调整输出结构：_id 改名为 name，去掉 _id
        { $project: {
            _id: 0,
            name: '$_id',
            dates: 1
        }}
    ]).toArray();

    const names = list.map(item => item.name);
    res.json({
        code: 0,
        data: {
            names,
            list,
        }
    });
}