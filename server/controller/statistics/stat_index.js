import * as mongo from '../../database/mongo.js';

/**
 * 查询每日全A等权指数
 */
export async function queryEqualWeightIndex(req, res) {
    const startStr = req.query.start;
    const endStr = req.query.end;
    const db = await mongo.getDB();
    const coll = db.collection('equal_weight_index');
    const list = await coll.find({
        date: {
            $gte: startStr,
            $lte: endStr
        }
    }, { projection: { _id: 0, } }).toArray();

    res.json({
        code: 0,
        data: {
            list
        }
    });
}