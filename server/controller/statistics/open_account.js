import * as mongo from '../../database/mongo.js';

const openAccountList = [
    // 2024
    { "date": "2024-01", "count": 195.64 },
    { "date": "2024-02", "count": 129.66 },
    { "date": "2024-03", "count": 241.79 },
    { "date": "2024-04", "count": 147.35 },
    { "date": "2024-05", "count": 126.62 },
    { "date": "2024-06", "count": 107.60 },
    { "date": "2024-07", "count": 115.14 },
    { "date": "2024-08", "count": 99.93  },
    { "date": "2024-09", "count": 182.74 },
    { "date": "2024-10", "count": 684.68 }, // 924行情高峰
    { "date": "2024-11", "count": 269.84 },
    { "date": "2024-12", "count": 198.91 },

    // 2025
    { "date": "2025-01", "count": 157.00 },
    { "date": "2025-02", "count": 283.59 },
    { "date": "2025-03", "count": 306.55 },
    { "date": "2025-04", "count": 192.44 },
    { "date": "2025-05", "count": 155.56 },
    { "date": "2025-06", "count": 164.64 },
    { "date": "2025-07", "count": 196.36 },
    { "date": "2025-08", "count": 265.03 },
    { "date": "2025-09", "count": 293.72 },
    { "date": "2025-10", "count": 230.99 },
    { "date": "2025-11", "count": 238.14 },
    { "date": "2025-12", "count": 259.67 },

    // 2026
    { "date": "2026-01", "count": 491.58 },
    { "date": "2026-02", "count": 252.30 },
    { "date": "2026-03", "count": 460.14 },
    { "date": "2026-04", "count": 249.13 },
    { "date": "2026-05", "count": 276.53 },
    { "date": "2026-06", "count": 286.46 },
    { "date": "2026-07", "count": 265.54 },
    { "date": "2026-08", "count": 239.73 },
];

/**
 * 查询开户数
 */
export async function queryOpenAccount(req, res) {
    const startStr = req.query.start;
    const endStr = req.query.end;
    const list = openAccountList.slice(0);
    res.json({
        code: 0,
        data: {
            list
        }
    });
}