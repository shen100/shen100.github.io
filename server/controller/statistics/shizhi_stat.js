import * as mongo from '../../database/mongo.js';

let data = {
    "shiZhi": {
        name: '总市值',
        "amount": 1204892.3600000013, 
        "count": 5656
    }, 
    "shiZhiList": [
        {
            name: '市值<100亿',
            "count": 3997, 
            "percent": "70.67"
        }, 
        {
            name: '市值 >= 100亿 且 < 500亿',
            "count": 1283, 
            "percent": "22.68"
        }, 
        {
            name: '[500亿, 1000亿)',
            "count": 189, 
            "percent": "3.34"
        }, 
        {
            name: '[1000亿, 2000亿)',
            "count": 111, 
            "percent": "1.96"
        }, 
        {
            name: '[2000亿, 5000亿)',
            "count": 46, 
            "percent": "0.81"
        }, 
        {
            name: '[5000亿, 1万亿)',
            "count": 16, 
            "percent": "0.28"
        }, 
        {
            name: '1万亿以上',
            "count": 14, 
            "percent": "0.25"
        }
    ]
}

export async function queryShiZhi(req, res) {
    // const db = mongo.getDB();
    // const collection = db.collection('tushare_daily_basic');
    // const list = await collection.find({}).toArray();


    res.json({
        code: 0,
        data
    });
}