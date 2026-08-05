import stockNetUtil from '../../util/stock_net_util.js'

/**
 * 请求股票分时
 */
export async function requestMinuteK(req, res) {
    let stockFullId = req.query.stockFullId;
    let resData = await stockNetUtil.requestMinuteK(stockFullId);
    res.json({
        code: 0,
        data: resData
    });
}

/**
 * 请求股票K线
 */
export async function queryKLineByInterval(req, res) {
    let interval = req.params.interval;
    let stockFullId = req.query.stockFullId;
    let startStr = req.query.start;
    let endStr = req.query.end;
    let countStr = req.query.count;

    let myKList = [];
    if (interval === 'day') {
        myKList = await stockNetUtil.requestDayK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'week') {
        myKList = await stockNetUtil.requestWeekK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'month') {
        myKList = await stockNetUtil.requestMonthK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'year') {
        myKList = await stockNetUtil.requestYearK(stockFullId, startStr, endStr, countStr);
    }
    res.json({
        code: 0,
        data: {
            kList: myKList,
        }
    });
}