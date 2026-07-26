import * as mongo from '../../database/mongo.js';
import { conceptSectors } from '../../explore/statistics/concept_sector.js';

export async function queryDailyUpCount(req, res) {
    const direction = req.params.direction;
    if ([ 'up', 'down' ].indexOf(direction) < 0) {
        res.json({
            code: 0,
            data: {
                list: [],
            }
        });
        return;
    }
    const db = mongo.getDB();
    const collection = db.collection('daily_up_count');
    let list = await collection.find({
        statDayCount: 10, 
        date: {$gte: '2025-01-01' },
        direction
    }).toArray();
    list = list.map(item => {
        return {
            date: item.date,
            count: item.count,
            statDayCount: item.statDayCount
        }
    });
    list.sort((a, b) => {
        if (a.statDayCount === 5) {
            console.log();
        }
        if (a.statDayCount === 10) {
            console.log();
        }
        return a.date > b.date ? 1 : -1;
    });
    res.json({
        code: 0,
        data: {
            list,
        }
    });
}

export async function queryDailyMoneyFlow(req, res) {
    const db = mongo.getDB();
    const collection = db.collection('money_flow');
    let list = await collection.aggregate([
        { $match: { date: { $gt: '2026-01-01' } } },
        // 1. 先按日期升序排序（让数组内文档有序）
        { $sort: { date: 1 } },
        
        // 2. 按 concept 分组，把所需字段压入数组
        { $group: {
            _id: "$concept",
            dates: { $push: { amount: "$amount", date: "$date" } }
        }},
        
        // 3. 调整输出结构：_id 改名为 name，去掉 _id
        { $project: {
            _id: 0,
            name: "$_id",
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