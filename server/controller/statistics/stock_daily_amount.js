import * as mongo from '../../database/mongo.js';

export async function saveStockDailyAmount(req, res) {
    const type = req.body.type;
    const date = req.body.date;
    const amount = req.body.amount;

    const db = await mongo.getDB();
    const col = db.collection('stock_daily_amount');

    const filter = { date, type };
    const updateDoc = {
        $set: {
            date,
            type,
            amount,
        },
        $setOnInsert: {
            createdAt: new Date()  // 只有插入时才设置
        }
    };
    await col.updateOne(filter, updateDoc, { upsert: true });
    res.json({
        code: 0
    });
}

export async function queryStockDailyAmount(req, res) {
    const type = req.query.type;
    const start = req.query.start;
    const end = req.query.end;

    const db = await mongo.getDB();
    const col = db.collection('stock_daily_amount');

    const list = await col.find({
        type,
        date: {
            $gte: start,
            $lte: end
        }
    }, { projection: { _id: 0, createdAt: 0 } }).sort({ date: 1 }).toArray();
    res.json({
        code: 0,
        data: {
            list
        }
    });
}