import * as mongo from '../../database/mongo.js';

/**
 * 每日上涨股票数(和前 N 天每天的股价相比)
 * 假如股票A在7月27日的收盘价是100, 那和前 N 天每天的收盘价相比，100都是最大值的话，
 * 那么就把7月27日的上涨股票数加 1
 */
export async function queryDailyUpCount(req, res) {
    const statDayCount = parseInt(req.params.dayCount);
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
        statDayCount, 
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
        { $match: { date: { $gte: '2026-01-01' } } },
        { $sort: { date: 1 } },
        // 按 concept 分组，把所需字段压入数组
        { $group: {
            _id: '$concept',
            dates: { $push: { amount: '$amount', date: '$date', stocks: '$stocks' } }
        }},
        // 调整输出结构：_id 改名为 name，去掉 _id
        { $project: {
            _id: 0,
            name: '$_id',
            dates: 1
        }}
    ]).toArray();

    list.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
    });

    const names = list.map(item => {
        for (let i = 1; i < item.dates.length; i++) {
            let data1 = item.dates[i - 1];
            let data2 = item.dates[i];
            data2.amount = data1.amount + data2.amount; // 累计成交额
        }
        return item.name;
    });
    res.json({
        code: 0,
        data: {
            names,
            list,
        }
    });
}

/**
 * 每日暴涨暴跌的股票数(幅度超过 9.5%)
 */
export async function queryDailySurgePlungeCount(req, res) {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const db = await mongo.getDB();
    const collection = db.collection('stat_daily_surge_plunge');

    const projection = {
        createdAt: 0,
        _id: 0 // 不返回 _id
    };
    let list = await collection.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }, { projection }).sort({ date: 1 }).toArray();

    res.json({
        code: 0,
        data: {
            list,
        }
    });
}


/**
 * 腾落线
 */
export async function queryDailyAdLine(req, res) {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const db = await mongo.getDB();
    const collection = db.collection('stat_daily_adline');

    const projection = {
        createdAt: 0,
        updatedAt: 0,
        _id: 0 // 不返回 _id
    };
    let list = await collection.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }, { projection }).sort({ date: 1 }).toArray();

    let prevAD = 0;
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        // 累计腾落线
        const adLine = prevAD + item.upCount - item.downCount;
        item.adLine = adLine;
        prevAD = adLine;
    }

    res.json({
        code: 0,
        data: {
            list,
        }
    });
}