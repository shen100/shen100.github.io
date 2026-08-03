import axios from 'axios';
import config from '../config/config.js'
import stock_common_util from './stock_common_util';

async function requestYahooStockDetail(stockFullIdId) {
	let url = config.url + `/api/stocks/kline/detail?stockFullId=${stockFullIdId}`;
	let res = await axios.get(url);
	return res.data.data;
}

async function requestYahooMinuteK(stockFullId) {
	let url = config.url + `/api/stocks/kline/minute?stockFullId=${stockFullId}`;
	let res = await axios.get(url);
	return res;
}

async function requestYahooDayK(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/day?stockFullId=${stockFullId}&start=${start}&end=${end}&count=${count}`;
	res = await axios.get(url);
	return res;
}

stock_common_util.requestYahooStockDetail = requestYahooStockDetail;
stock_common_util.requestYahooMinuteK = requestYahooMinuteK;
stock_common_util.requestYahooDayK = requestYahooDayK;

export async function requestStockDetail(stock) {
	return await stock_common_util.requestStockDetail(stock);
}

export async function requestMinuteK(stockFullId) {
	return await stock_common_util.requestMinuteK(stockFullId);
}

export async function requestDayK(stockFullId, start, end, count) {
	return await stock_common_util.requestDayK(stockFullId, start, end, count);
}

export async function requestWeekK(stockFullId, start, end, count) {
	return await stock_common_util.requestWeekK(stockFullId, start, end, count);
}

export async function requestMonthK(stockFullId, start, end, count) {
	return await stock_common_util.requestMonthK(stockFullId, start, end, count);
}

export async function requestYearK(stockFullId, start, end, count) {
	return await stock_common_util.requestYearK(stockFullId, start, end, count);
}