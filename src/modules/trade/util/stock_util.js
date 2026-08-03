import axios from 'axios';
import config from '../config/config.js'
import stock_common_util from './stock_common_util';

async function requestYahooStockDetail(stockFullIdId) {
	let url = config.url + `/api/stocks/detail?stockFullId=${stockFullIdId}`;
	let res = await axios.get(url);
	return res.data.data;
}

async function requestYahooMinuteK(stockFullId) {
	let url = config.url + `/api/stocks/kline/minute?stockFullId=${stockFullId}`;
	let res = await axios.get(url);
	return res;
}

async function requestYahooDayK(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/day?stockFullId=${stockFullId}&start=${start}&end=${end}`;
	let res = await axios.get(url);
	return res.data.data.kList;
}

async function requestYahooWeekK(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/week?stockFullId=${stockFullId}&start=${start}&end=${end}`;
	let res = await axios.get(url);
	return res.data.data.kList;
}

async function requestYahooMonthK(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/month?stockFullId=${stockFullId}&start=${start}&end=${end}`;
	let res = await axios.get(url);
	return res.data.data.kList;
}

async function requestYahooYearK(stockFullId, start, end, count) {
	let url = config.url + `/api/stocks/kline/year?stockFullId=${stockFullId}&start=${start}&end=${end}`;
	let res = await axios.get(url);
	return res.data.data.kList;
}

stock_common_util.requestYahooStockDetail = requestYahooStockDetail;
stock_common_util.requestYahooMinuteK = requestYahooMinuteK;
stock_common_util.requestYahooDayK = requestYahooDayK;
stock_common_util.requestYahooWeekK = requestYahooWeekK;
stock_common_util.requestYahooMonthK = requestYahooMonthK;
stock_common_util.requestYahooYearK = requestYahooYearK;

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