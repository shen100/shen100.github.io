import * as mongo from '../../database/mongo.js';
import { formatLocalYMD } from '../../util/date.js';

/**
 * 查询今日待办事项
 */
export async function today(req, res) {
    let list = [
        {
            label: '看东方财富全A'
        },
        {
            label: '看大盘总市值'
        },
        {
            label: '看每日成交额'
        },
        {
            label: '看每日两融余额'
        },
        {
            label: '看指数行情'
        },
        {
            label: '看韩国KOSPI行情'
        },
        {
            label: '看当前持仓行情'
        },
        {
            label: '看候选股行情'
        },
        {
            label: '看存储行情'
        },
        {
            label: '看物理AI行情'
        },
        {
            label: '看资金流向'
        },
        {
            label: '看每日暴涨暴跌数'
        },
        {
            label: '每日3组俯卧撑, 一组5个'
        },
        {
            label: '每日3组卷腹, 一组20个'
        },
    ];
    list.forEach(item => item.done = false);

    const db = await mongo.getDB();
    const collection = db.collection('todo_list');
    let date = formatLocalYMD(new Date());
    // let date = formatLocalYMD(new Date(2026, 7, 4));

    let todoListData = await collection.findOne({
        date
    });
    if (!todoListData) {
        todoListData = {
            date,
            list
        }
    }

    res.json({
        code: 0,
        data: todoListData
    });
}

/**
 * 打卡
 */
export async function done(req, res) {
    const list = req.body.list;
    const date = req.body.date + '';
    const db = await mongo.getDB();
    const todoListCol = db.collection('todo_list');
    const filter = { date };
    const updateDoc = {
        $set: {
            list
        },
        $setOnInsert: {
            createdAt: new Date() // 只有插入时才设置
        }
    };
    await todoListCol.updateOne(filter, updateDoc, { upsert: true });
    res.json({
        code: 0,
        data: {
            date,
            list
        }
    });
}

/**
 * 查询近三年的历史打卡数
 */
export async function getDailyFinishedTaskCount(req, res) {
    const db = await mongo.getDB();
    const coll = db.collection('todo_list');

    const dateAgo = new Date(Date.now() - 3 * 365 * 24 * 3600 * 1000);
    const startDateStr = dateAgo.toISOString().split('T')[0];

    const pipeline = [
        {
            $match: {
                date: {
                    $gte: startDateStr
                }
            }
        },
        // 增加字段：当天todo 完成数量
        {
            $addFields: {
                finishedTodoCount: {
                    $size: {
                        $filter: {
                            input: '$list',
                            as: 'item',
                            cond: { $eq: [ '$$item.done', true ] }
                        }
                    }
                }
            }
        },
        { $sort: { date: 1 } },
        {
            $project: {
                _id: 0,
                date: 1,
                finishedTodoCount: 1
            }
        }
    ];

    const list = await coll.aggregate(pipeline).toArray();
    res.json({
        code: 0,
        data: {
            list
        }
    });
}