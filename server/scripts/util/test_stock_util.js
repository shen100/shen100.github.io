import { requestDayK } from '../../util/stock_util.js';

const stock = {
    stockFullId: "sz000001",
    stockId: "000001",
    stockName: "平安银行",
};

const start = '2026-01-01';
const end = '2026-08-01';
const count = 300;

await requestDayK(stock, start, end, count);