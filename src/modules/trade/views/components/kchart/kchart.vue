<template>
    <div class="kchart-container">
		<div class="stock-name" @mouseleave="onStockNameMouseLeave">
			<div class="stock-name-txt" @mouseenter="onStockNameMouseEnter">
				{{ data.stockData ? `${data.stockName}&nbsp;(总市值&nbsp;${zongShiZhi})` : data.stockName }}
			</div>
			<div v-if="props.addToTrackingEnabled" class="add-to-tracking">
				<Button v-if="data.addToTrackingBtnVisible" @click="onShowAddToTrackingModal" type="primary" size="small">加入跟踪K线</Button>
			</div>
		</div>
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
		<div v-if="data.activeCandleData" class="y-axis-price-line" :style="{top: `${data.yAxisPriceLine}px`}">
			<div class="y-axis-price-line-price">{{ data.yAxisPriceLinePrice }}</div>
		</div>
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
				@mouse-over="(candleData) => onCandleMouseOver(i, candleData)"
				@mouse-out="() => onCandleMouseOut(i)"
				@mouse-move="(candleData) => onCandleMouseMove(i, candleData)"
			/>
        </div>
		<StockInfoPopup v-if="data.activeCandleData" :info="data.activeCandleData" />
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue'
import { findFromRight } from '../../../util/str';
import Candle from './candle.vue';
import StockInfoPopup from './stock_info_popup.vue';

const emit = defineEmits(['add-to-tracking']);

const props = defineProps([
    'addToTrackingEnabled',
]);

let data = ref({
	dataLoaded: false,
	type: 'day',
	stock: null, // { "stockFullId": "sz000858", "stockId": "000858", "stockName": "五粮液" }
	stockData: null, //  { stockId: '000858', zongShiZhi: '4623.77亿' }
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
	yAxisPriceLine: 0,
	yAxisPriceLinePrice: 0,
    yAxisText1: '',
    yAxisText2: '',
    yAxisText3: '',
    yAxisText4: '',
    yAxisText5: '',
	activeCandleData: null,
	addToTrackingBtnVisible: false,
})

onMounted(async () => {

});

const zongShiZhi = computed(() => {
	if (data.value.stockData && data.value.stockData.zongShiZhi > 10000) {
		return (data.value.stockData.zongShiZhi / 10000).toFixed(2) + '万亿';
	}
	return data.value.stockData ? data.value.stockData.zongShiZhi + '亿' : '';
})

function resetData(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stock = stock;
	data.value.stockData = null;
	data.value.stockName = stock.stockName;
	data.value.myKList = [];
	data.value.start = start;
    data.value.end = end;
}

async function requestStockDetail(stock) {
	if (data.value.stockData && data.value.stockData.stockId === stock.stockId) {
		return;
	}
	let url = `https://sqt.gtimg.cn/?q=${stock.stockFullId}&fmt=json&app=wzq&t=${Date.now()}`;
    let res = await axios.get(url);
	if (!(res.data && res.data[stock.stockFullId])) {
		return;
	}
	let arr = res.data[stock.stockFullId] || [];
	data.value.stockData = {
		stockId: stock.stockId,
		zongShiZhi: Number(arr[45] || '0').toFixed(2), // 总市值
	}
}

async function requestDayK(stock, start, end, count) {
	resetData(stock, start, end, count);
	requestStockDetail(stock);
    let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
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
	let url = "https://qt.gtimg.cn/q=" + stockFullId;

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
	let todayStr = "";
	let index = jsonStr.indexOf('"');
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
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
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
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=";
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
	requestStockDetail(stock);
	let url = "https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param="
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

	let yearTmpList = [];
	let yearList = [];
	for (let key in yearMap) {
		yearTmpList.push({
			"year": key,
			"data": yearMap[key]
		});
    }
	yearTmpList.sort((a, b) => a.year > b.year ? 1 : -1);

	for (let i = 0; i < yearTmpList.length; i++) {
		yearList.push(yearTmpList[i].data);
    }


	let myKList = yearList;
	
	let dates = [];
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
		let highPrice = myKList[i][3];
		let lowPrice = myKList[i][4];
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

	let incAxis = (highPriceInAll - lowPriceInAll) / 4;
	data.value.yAxisText1 = highPriceInAll.toFixed(2);
	data.value.yAxisText2 = (highPriceInAll - incAxis).toFixed(2);
	data.value.yAxisText3 = (highPriceInAll - 2 * incAxis).toFixed(2);
	data.value.yAxisText4 = (highPriceInAll - 3 * incAxis).toFixed(2);
	data.value.yAxisText5 = lowPriceInAll.toFixed(2);
	data.value.dataLoaded = true;
}

function onCandleMouseOver(i, candleData) {
	data.value.activeCandleData = candleData;
}

function onCandleMouseOut(i) {
	data.value.activeCandleData = null;
}

function onCandleMouseMove(i, candleData) {
	data.value.yAxisPriceLine = candleData.y + 55;
	data.value.yAxisPriceLinePrice = candleData.price;
}

function onStockNameMouseEnter() {
	data.value.addToTrackingBtnVisible = true;
}

function onStockNameMouseLeave() {
	data.value.addToTrackingBtnVisible = false;
}

function onShowAddToTrackingModal() {
	emit('add-to-tracking', data.value.stock);
}

defineExpose({ requestDayK, requestWeekK, requestMonthK, requestYearK });
</script>

<style scoped>
.kchart-container {
	background-color: #fff;
	height: 290px;
	padding: 15px 20px 20px 20px;
	box-sizing: border-box;
	margin-bottom: 20px;
	position: relative;
}

.stock-name {
	text-align: center;
	font-size: 0;
}

.stock-name-txt {
	display: inline-block;
	vertical-align: top;
	height: 30px;
	line-height: 30px;
	font-size: 22px;
	font-weight: 700;
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

.y-axis-price-line {
	position: absolute;
	z-index: 2;
	border-top: 1px dashed #cecece;
	left: 0;
	width: calc(100vw - 320px);
	pointer-events: none;
}

.y-axis-price-line-price {
	position: absolute;
	top: -10px;
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	background-color: #e7e7e7;
    color: #222;
    width: 40px;
    text-align: center;
}

.candles-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	height: 201px; /* 比 data.candleMaxHeight 高出 1px */
}

.add-to-tracking {
	width: 200px;
	height: 30px;
	line-height: 30px;
	display: inline-block;
	vertical-align: top;
	margin-left: 20px;
	text-align: left;
}
</style>
