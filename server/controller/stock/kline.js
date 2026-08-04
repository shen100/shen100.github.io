import stockUtil from '../../util/stock_util.js'

/**
 * 请求股票分时
 */
export async function requestMinuteK(req, res) {
    let stockFullId = req.query.stockFullId;
    let resData = await stockUtil.requestMinuteK(stockFullId);
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
        myKList = await stockUtil.requestDayK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'week') {
        myKList = await stockUtil.requestWeekK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'month') {
        myKList = await stockUtil.requestMonthK(stockFullId, startStr, endStr, countStr);
    } else if (interval === 'year') {
        myKList = await stockUtil.requestYearK(stockFullId, startStr, endStr, countStr);
    }
    res.json({
        code: 0,
        data: {
            kList: myKList,
        }
    });
}