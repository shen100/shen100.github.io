import * as mongo from '../../database/mongo.js';

/**
 * 保存设置
 */
export async function saveSetting(req, res) {
    const key = req.body.key;
    const settingData = req.body.settingData;
    const db = await mongo.getDB();
    const coll = db.collection('stock_setting');
    const filter = { key };

    const update = {
        $set: {
            ...settingData,
            updatedAt: new Date()
        },
        $setOnInsert: {
            createdAt: new Date()
        }
    };

    await coll.updateOne(filter, update, { upsert: true });

    res.json({
        code: 0
    });
}

/**
 * 获取设置
 */
export async function querySetting(req, res) {
    const key = req.query.key;
    const db = await mongo.getDB();
    const coll = db.collection('stock_setting');
    const settingData = await coll.findOne({ key }, { projection: { _id: 0, createdAt: 0, updatedAt: 0 } });

    res.json({
        code: 0,
        data: settingData
    });
}