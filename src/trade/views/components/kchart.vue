<template>
    <div class="kchart-container">
		<div class="stock-name">{{ data.stockName }}</div>
		<div class="space"></div>
		<div class="y-axis" :style="{top: `${data.yAxis1}px`}"></div>
		<div class="y-axis-txt" :style="{top: `${data.yAxis1}px`}">{{ data.yAxisText1 }}</div>
		<div class="y-axis" :style="{top: `${data.yAxis2}px`}"></div>
		<div class="y-axis-txt" :style="{top: `${data.yAxis2}px`}">{{ data.yAxisText2 }}</div>
		<div class="y-axis" :style="{top: `${data.yAxis3}px`}"></div>
		<div class="y-axis-txt" :style="{top: `${data.yAxis3}px`}">{{ data.yAxisText3 }}</div>
		<div class="y-axis" :style="{top: `${data.yAxis4}px`}"></div>
		<div class="y-axis-txt" :style="{top: `${data.yAxis4}px`}">{{ data.yAxisText4 }}</div>
		<div class="y-axis" :style="{top: `${data.yAxis5}px`}"></div>
		<div class="y-axis-txt" :style="{top: `${data.yAxis5}px`, transform: 'translateY(-100%)'}">{{ data.yAxisText5 }}</div>
        <div v-if="data.dataLoaded" class="candles-container">
			<Candle
				v-for="(item, i) in data.myKList" :key="i"
				:candleType="data.type"
				:date="item[0]"
				:openPrice="item[1]"
				:closePrice="item[2]"
				:highPrice="item[3]"
				:lowPrice="item[4]"
				:lowPriceInAll="data.lowPriceInAll"
				:highPriceInAll="data.highPriceInAll"
				:candleMaxHeight="data.candleMaxHeight"
			/>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue'
import { findFromRight } from '../../util/str';
import Candle from '../components/candle.vue';

let data = ref({
	dataLoaded: false,
	type: 'day',
	stockName: '',
    lowPriceInAll: 0,
	highPriceInAll: 0,
    candleMaxHeight: 200,
	start: '',
    end: '',
    myKList: [],
	yAxis1: 0,
    yAxis2: 0,
    yAxis3: 0,
    yAxis4: 0,
    yAxis5: 0,
    yAxisText1: '',
    yAxisText2: '',
    yAxisText3: '',
    yAxisText4: '',
    yAxisText5: '',
})

onMounted(async () => {

});

function resetData(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stockName = stock.stockName;
	data.value.myKList = [];
	data.value.start = start;
    data.value.end = end;
}

async function requestDayK(stock, start, end, count) {
	resetData(stock, start, end, count);
    var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",day," + start + "," + end + "," + count + ",qfq");
    let res = await axios.get(url);
	/*
    [
		"2021-03-10", 0-交易日
		"1977.000", 1-开盘价
		"1970.010", 2-收盘价
		"1999.870", 3-最高价
		"1967.000", 4-最低价
		"51172.000" 5-总手
	]
    */
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
	let myKList = [];
	if (res.data.data[stock.stockFullId]['qfqday']) {
		myKList = res.data.data[stock.stockFullId].qfqday;
    } else {
		myKList = res.data.data[stock.stockFullId].day;
    }
	convertKListToNumbers(myKList);
	requestToday(stock.stockFullId)
}

async function requestToday(stockFullId) {
	var url = "https://qt.gtimg.cn/q=" + stockFullId;

	let res = await axios.get(url, {
        responseType: 'arraybuffer' 
    });
    if (!res.data) {
		return;
    }

    let gbkData = res.data;
    const decoder = new TextDecoder('gbk');
    const utf8String = decoder.decode(gbkData);
    const jsonStr = utf8String;
	if (!jsonStr) {
        return;
    }
	var todayStr = "";
	var index = jsonStr.indexOf('"');
	if (index > 0) {
		todayStr = jsonStr.substring(index + 1);
    }
	index = findFromRight(todayStr, '"');
	if (index > 0) {
		todayStr = todayStr.substring(0, index)
    }

	let todayData = todayStr.split('~');
	const kData = [
		data.value.end,
		todayData[5],  // 开盘价
		todayData[3],  // 收盘价
		todayData[33], // 最高价
		todayData[34], // 最低价
		todayData[6],  // 总手
	];
	convertKListToNumbers([ ...data.value.myKList, kData ]);
	updateChart("day");
}

async function requestWeekK(stock, start, end, count) {
	resetData(stock, start, end, count);
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",week," + start + "," + end + "," + count + ",qfq");
	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqweek']) {
		myKList = res.data.data[stock.stockFullId].qfqweek;
    } else {
		myKList = res.data.data[stock.stockFullId].week;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	convertKListToNumbers(myKList);
	updateChart("week");
}

async function requestMonthK(stock, start, end, count) {
	resetData(stock, start, end, count);
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
	let myKList = [];
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		myKList = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		myKList = res.data.data[stock.stockFullId].month;
    }
		
	let dates = []
	for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	convertKListToNumbers(myKList);
	updateChart("month")
}

async function requestYearK(stock, start, end, count) {
	resetData(stock, start, end, count);
	var url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
	url += (stock.stockFullId + ",month," + start + "," + end + "," + count + ",qfq");

	let res = await axios.get(url);
	
	if (!(res.data && res.data.data)) {
		data.value.dataLoaded = true;
		return;
    }
		
    let monthData;
    if (res.data.data[stock.stockFullId]['qfqmonth']) {
		monthData = res.data.data[stock.stockFullId].qfqmonth;
    } else {
		monthData = res.data.data[stock.stockFullId].month;
    }
		
	let yearMap = {};
	let curYear;
	let maxPrice = -100000000;
	let minPrice = 1000000000;

    for (let i = 0; i < monthData.length; i++) {
		let arr = monthData[i];
		let year = arr[0].substr(0, 4); // arr[0] 是日期字符串，2019-08-30
		if (!yearMap[year]) {
			yearMap[year] = [
				arr[0], // 2019-08-30
				arr[1], // 1-开盘价
				0, // 2-收盘价
				0, // 3-最高价
				0, // 4-最低价
				0, // 5-总手
			]
			curYear = year;
			maxPrice = Number(arr[3])
			minPrice = Number(arr[4])
        }
		let theMaxPrice = Number(arr[3]);
		let theMinPrice = Number(arr[4]);
		if (theMaxPrice > maxPrice) {
			maxPrice = theMaxPrice;
        }

		if (theMinPrice < minPrice) {
			minPrice = theMinPrice;
        }

		yearMap[curYear][5] += Number(arr[5]);

		if (i + 1 < monthData.length) {
			let nextYear = monthData[i + 1][0].substr(0, 4)
			if (curYear != nextYear) {
				yearMap[curYear][2] = arr[2]; // 2-收盘价
				yearMap[curYear][3] = '' + maxPrice; // 最高价
				yearMap[curYear][4] = '' + minPrice; // 最低价
				// 以每年的最后一个交易日作为这年的日期
				yearMap[curYear][0] = arr[0];
            }
        } else {
			yearMap[curYear][2] = arr[2];
			yearMap[curYear][3] = '' + maxPrice;
			yearMap[curYear][4] = '' + minPrice;
			// 以每年的最后一个交易日作为这年的日期
			yearMap[curYear][0] = arr[0];
        }
    }

	let yearList = [];
	for (let key in yearMap) {
		yearList.push({
			"year": key,
			"data": yearMap[key]
		});
    }
	yearList.sort((a, b) => a.year > b.year ? 1 : -1);

	let myKList = yearList;
	
	var dates = [];
    for (let i = 0; i < myKList.length; i++) {
		dates.push(myKList[i][0]); // 之前请求成交量用了dates
    }
	convertKListToNumbers(myKList);
	updateChart("year")
}

function convertKListToNumbers(myKList) {
	for (let i = 0; i < myKList.length; i++) {
		myKList[i][1] = Number(myKList[i][1]);
		myKList[i][2] = Number(myKList[i][2]);
		myKList[i][3] = Number(myKList[i][3]);
		myKList[i][4] = Number(myKList[i][4]);
		myKList[i][5] = Number(myKList[i][5]);
	}
	data.value.myKList = myKList;
}

function updateChart(type) {
	let lowPriceInAll = 10000000;
	let highPriceInAll = -10000000;

    data.value.type = type;

	const myKList = data.value.myKList;
    for (let i = 0; i < myKList.length; i++) {
		var highPrice = myKList[i][3];
		var lowPrice = myKList[i][4];
		if (lowPrice < lowPriceInAll) {
			lowPriceInAll = lowPrice;
        }
		if (highPrice > highPriceInAll) {
			highPriceInAll = highPrice;
        }
    }

	data.value.lowPriceInAll = lowPriceInAll;
	data.value.highPriceInAll = highPriceInAll;
	

	data.value.yAxis1 = 0 * data.value.candleMaxHeight / 4 + 55;
	data.value.yAxis2 = 1 * data.value.candleMaxHeight / 4 + 55;
	data.value.yAxis3 = 2 * data.value.candleMaxHeight / 4 + 55;
	data.value.yAxis4 = 3 * data.value.candleMaxHeight / 4 + 55;
	data.value.yAxis5 = 4 * data.value.candleMaxHeight / 4 + 55;

	var incAxis = (highPriceInAll - lowPriceInAll) / 4;
	data.value.yAxisText1 = highPriceInAll.toFixed(2);
	data.value.yAxisText2 = (highPriceInAll - incAxis).toFixed(2);
	data.value.yAxisText3 = (highPriceInAll - 2 * incAxis).toFixed(2);
	data.value.yAxisText4 = (highPriceInAll - 3 * incAxis).toFixed(2);
	data.value.yAxisText5 = lowPriceInAll.toFixed(2);
	data.value.dataLoaded = true;
}

defineExpose({ requestDayK, requestWeekK, requestMonthK, requestYearK });
</script>

<style scoped>
.kchart-container {
	background-color: #fff;
	height: 570px;
	padding: 15px 20px 20px 20px;
	box-sizing: border-box;
	margin-bottom: 20px;
	position: relative;
}

.stock-name {
	text-align: center;
	font-size: 22px;
	font-weight: 700;
	height: 30px;
	line-height: 30px;
}

.space {
	height: 10px;
}

.y-axis {
	height: 1px;
	background-color: #f2f2f2;
	position: absolute;
	width: calc(100vw - 320px);
}

.y-axis-txt {
	position: absolute;
	font-size: 12px;
}

.candles-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	height: 200px; /* 和 data.candleMaxHeight 一样的值 */
}
</style>
