<template>
    <div class="kchart-container">
		<div class="stock-name" @mouseleave="onStockNameMouseLeave">
			<div class="stock-name-txt" @mouseenter="onStockNameMouseEnter">
				<a class="stock-name-link" :href="`https://xueqiu.com/S/${data.stock && data.stock.stockFullId}`" target="_blank">
					{{ data.stockName }}
				</a>
				{{ data.stockData ? `&nbsp;(总市值&nbsp;${zongShiZhi})` : '' }}
				<span class="stock-cur-price" :style="{color: data.lastPriceUpColor}">¥{{ data.curPrice }}</span>
				<span class="stock-price-change" :style="{color: data.lastPriceUpColor}">{{ data.dtPriceUpdated ? (data.dtPrice > 0 ? '+' : '') + data.dtPrice.toFixed(2) : ''}}</span>
				<span class="stock-price-change" :style="{color: data.lastPriceUpColor, 'margin-left': '10px'}">{{ ((data.dtRate * 100).toFixed(2) + '%')}}</span>
				<template v-if="props.kChartLocalKey !== 'tradeAllFullIdStocks'">
					<span v-if="data.stock && currentDownRate" class="stop-rate-label">当前跌幅 {{ currentDownRate }}</span>
					<span v-if="data.stock && allowMaxDownRate" class="stop-rate-label">最多可跌 {{  allowMaxDownRate }}</span>
					<span v-if="data.stock && stopRate" class="stop-rate-label">止损 {{ stopRate }}</span>
					<Button @click="onShowEditModal" type="primary" icon="md-brush" size="small" style="margin-left: 10px;">编辑</Button>
					<Button v-if="allowAddToPotential" @click="onShowPotentialModal" type="primary" size="small" style="margin-left: 10px;">加入候选股</Button>
					<Button v-if="props.kChartLocalKey === 'tradePotentialStocks'" @click="onShowRemovePotentialModal" type="primary" size="small" style="margin-left: 10px;">移出候选股</Button>
				</template>
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
		
		<div v-if="data.stock && data.stock.highPrice > 0" class="y-axis-price-line avg-high-line" :style="{top: `${data.highPriceY}px`}">
			<div class="y-axis-price-line-price avg-high-line-price">{{ data.stock.highPrice }}</div>
		</div>
		<div v-if="avgCost > 0" class="y-axis-price-line avg-cost-line" :style="{top: `${data.avgCostY}px`}">
			<div class="y-axis-price-line-price avg-cost-line-price">{{ avgCost.toFixed(2) }}</div>
		</div>
		<div v-if="data.stock && data.stock.stopPrice > 0" class="y-axis-price-line avg-stop-price-line" :style="{top: `${data.stopPriceY}px`}">
			<div class="y-axis-price-line-price avg-stop-price-line-price">{{ data.stock.stopPrice }}</div>
		</div>

		<div v-if="data.activeCandleData" class="y-axis-price-line" :style="{top: `${data.yAxisPriceLine}px`}">
			<div class="y-axis-price-line-price">{{ data.yAxisPriceLinePrice }}</div>
		</div>
        <div v-if="data.dataLoaded" class="candles-container">
			<Candle
				v-for="(item, i) in data.myKList" :key="i"
				:candleType="data.type"
				:date="item[0]"
				:tradeActions="data.stock.tradeActions"
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
	<div class="kchart-volume">
		<div class="kchart-volume-list">
			<div v-for="(item, i) in data.myKList" :key="i" class="kchart-volume-item-box">
				<div class="kchart-volume-item" :style="{height: getVolumeItemHeight(item), 'background-color': getVolumeItemColor(item)}"></div>
				<div v-if="data.activeCandleData && data.activeCandleData.date === item[0]" class="full-line"></div>
			</div>
		</div>
	</div>
	<EditKChartModal @hide-modal="onHideEditModal" :stock="data.stock" :modalVisible="data.editModalVisible" />
	<AddPotentialModal @hide-modal="onHidePotentialModal" :stock="data.stock" :modalVisible="data.addPotentialModalVisible" />
	<RemovePotentialModal @hide-modal="onHideRemovePotentialModal" :stock="data.stock" :modalVisible="data.removePotentialModalVisible" />
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue'
import { findFromRight } from '../../../util/str';
import Candle from './candle.vue';
import StockInfoPopup from './stock_info_popup.vue';
import EditKChartModal from './edit_kchart_modal.vue';
import AddPotentialModal from './add_potential_modal.vue';
import RemovePotentialModal from './remove_potential_modal.vue';

const props = defineProps([
	'kChartLocalKey'
]);

let data = ref({
	dataLoaded: false,
	type: 'day',
	stock: null, // { "stockFullId": "sz000858", "stockId": "000858", "stockName": "五粮液", highPrice: 100, stopPrice: 90, tradeActions: [] }
	stockData: null, //  { stockId: '000858', zongShiZhi: '4623.77亿' }
	stockName: '',
	highPriceY: -1, // 前一最高价
	avgCostY: -1, // 成本价
	stopPriceY: -1, // 止损价
    lowPriceInAll: 0,
	highPriceInAll: 0,
    candleMaxHeight: 280,
	start: '',
    end: '',
    myKList: [],
	maxVolume: 0,
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
	dtPriceUpdated: false,
	dtPrice: 0,
	dtRate: 0,
	curPrice: 0,
	lastPriceUpColor: '',
	editModalVisible: false,
	addPotentialModalVisible: false,
	removePotentialModalVisible: false
})

onMounted(async () => {

});

const zongShiZhi = computed(() => {
	if (data.value.stockData && data.value.stockData.zongShiZhi > 10000) {
		return (data.value.stockData.zongShiZhi / 10000).toFixed(2) + '万亿';
	}
	return data.value.stockData ? data.value.stockData.zongShiZhi + '亿' : '';
})

const avgCost = computed(() => {
	if (!data.value.stock || !data.value.stock.tradeActions || !data.value.stock.tradeActions.length) {
		return 0;
	}
	let amount = 0;
	let count = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'buy') {
			amount = amount + (action.price * action.count);
			count = count + action.count;
		} else if (action.type === 'sell') {
			amount = amount - (action.price * action.count);
			count = count - action.count;
		}
	}
	return Number(amount / count);
})

const currentDownRate = computed(() => {
	if (!data.value.stock || !data.value.stock.highPrice) {
		return '';
	}
	let rate = (data.value.stock.highPrice - data.value.curPrice) / data.value.stock.highPrice * 100;
	return rate.toFixed(2) + '%'
})

const stopRate = computed(() => {
	if (!data.value.stock || !avgCost.value || !data.value.stock.stopPrice) {
		return '';
	}
	let rate = (avgCost.value - data.value.stock.stopPrice) / avgCost.value * 100;
	return rate.toFixed(2) + '%'
})

const allowMaxDownRate = computed(() => {
	if (!data.value.stock || !data.value.stock.stopPrice || !data.value.stock.highPrice) {
		return '';
	}
	let rate = (data.value.stock.highPrice - data.value.stock.stopPrice) / data.value.stock.highPrice * 100;
	return rate.toFixed(2) + '%'
})

const allowAddToPotential = computed(() => {
	let arr = [ 'tradeTrackedStocks', 'tradeTrackedStocksByStrategy1' ];
	return arr.indexOf(props.kChartLocalKey) >= 0;
})

function resetData(stock, start, end, count) {
	data.value.dataLoaded = false;
	data.value.stock = stock;
	data.value.highPriceY = -1;
	data.value.avgCostY = -1;
	data.value.stopPriceY = -1;
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

	let todayStr = new Date().toISOString().substring(0, 10);
	let endStr = myKList && myKList.length && myKList[myKList.length - 1][0];
	if (endStr && todayStr > endStr && todayStr <= end) {
		let todayKData = await requestToday(stock.stockFullId);
		if (todayKData[0] > endStr) {
			myKList.push(todayKData);
		}
	}
	convertKListToNumbers(myKList);
	updateChart("day");
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
    let dateStr = todayData[30];
	const kData = [
		`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`,
		todayData[5],  // 开盘价
		todayData[3],  // 收盘价
		todayData[33], // 最高价
		todayData[34], // 最低价
		todayData[6],  // 总手
	];
	return kData;
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
	data.value.maxVolume = 0;
	for (let i = 0; i < myKList.length; i++) {
		myKList[i][1] = Number(myKList[i][1]); // 开盘价
		myKList[i][2] = Number(myKList[i][2]); // 收盘价
		myKList[i][3] = Number(myKList[i][3]); // 最高价
		myKList[i][4] = Number(myKList[i][4]); // 最低价
		myKList[i][5] = Number(myKList[i][5]); // 成交量

		if (myKList[i][5] > data.value.maxVolume) {
			data.value.maxVolume = myKList[i][5];
		}
	}
	data.value.myKList = myKList;
}

function getVolumeItemHeight(item) {
	let volume = item[5];
	return (volume / data.value.maxVolume) * 100 + '%'
}

function getVolumeItemColor(item) {
	let openPrice = item[1];
	let closePrice = item[2];
	if (closePrice > openPrice) {
        return '#ee2500';
    } else if (closePrice === openPrice) {
        return '#868686';
    } else {
        return '#02b33d';
    }
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

	data.value.dtPriceUpdated = false;
	if (myKList.length > 1) {
		data.value.dtPriceUpdated = true;
		let item1 = myKList[myKList.length - 1];
		let item2 = myKList[myKList.length - 2];
		data.value.curPrice = item1[2];
		data.value.dtPrice = item1[2] - item2[2];
		data.value.dtRate = data.value.dtPrice / item2[2];
		if (item1[2] > item2[2]) {
			data.value.lastPriceUpColor = '#ee2500'
		} else if (item1[2] === item2[2]) {
			data.value.lastPriceUpColor = '#868686';
		} else {
			data.value.lastPriceUpColor = '#02b33d';
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

	let priceDt = highPriceInAll - lowPriceInAll;
	if (data.value.stock && avgCost.value > 0) {
		let value1 = (avgCost.value - lowPriceInAll);
		// 加上 kchart-container 的 paddingTop
		// 加上 stock-name 的 高度
		// 加上 space 的高度
		// 总共加上 55
		data.value.avgCostY = (1 - value1 / priceDt) * data.value.candleMaxHeight + 15 + 30 + 10;
	}
	if (data.value.stock && typeof data.value.stock.stopPrice !== 'undefined') {
		let value2 = (data.value.stock.stopPrice - lowPriceInAll);
		data.value.stopPriceY = (1 - value2 / priceDt) * data.value.candleMaxHeight + 15 + 30 + 10;
	}
	if (data.value.stock && typeof data.value.stock.highPrice !== 'undefined') {
		let value3 = (data.value.stock.highPrice - lowPriceInAll);
		data.value.highPriceY = (1 - value3 / priceDt) * data.value.candleMaxHeight + 15 + 30 + 10;
	}
}

function onCandleMouseOver(i, candleData) {
	let theData = {
		...candleData,
	};
	if (data.value.myKList && data.value.myKList[i - 1]) {
		theData.prevClosePrice = data.value.myKList[i - 1][2]
	}
	data.value.activeCandleData = theData;
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

function onShowEditModal() {
	data.value.editModalVisible = true;
}

function onHideEditModal() {
	data.value.editModalVisible = false;
}

function onShowPotentialModal() {
	data.value.addPotentialModalVisible = true;
}

function onHidePotentialModal() {
	data.value.addPotentialModalVisible = false;
}

function onShowRemovePotentialModal() {
	data.value.removePotentialModalVisible = true;
}

function onHideRemovePotentialModal() {
	data.value.removePotentialModalVisible = false;
}

defineExpose({ requestDayK, requestWeekK, requestMonthK, requestYearK });
</script>

<style scoped>
.kchart-container {
	background-color: #fff;
	height: 370px; /* 比 data.candleMaxHeight 高出 90px */
	padding: 15px 20px 20px 20px;
	box-sizing: border-box;
	position: relative;
}

.stock-name {
	text-align: center;
	font-size: 0;
}

.stock-name-link {
	color: rgb(81, 90, 110);
}

.stock-name-link:hover {
	color: #2d8cf0;
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
    width: 46px;
    text-align: center;
}

.candles-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	height: 281px; /* 比 data.candleMaxHeight 高出 1px */
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

.kchart-volume {
	margin-top: 0px;
	margin-bottom: 20px;
	padding: 0px 20px 15px 20px;
	background-color: #fff;
}

.kchart-volume-list {
	border-top: 1px #eee dashed;
	display: flex;
	gap: 2px;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	/* background-color: #eee; */
}

.kchart-volume-item-box {
	width: 7px;
	height: 100px;
	/* background-color: #eee; */
	position: relative;
}

.kchart-volume-item {
	width: 7px;
	background-color: #f00;
	position: absolute;
	left: 0;
	bottom: 0;
}

.full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
	left: 3px;
}

.stock-cur-price {
	margin: 0 10px 0 20px;
}

.stock-price-change {
	font-size: 18px;
	font-weight: 400;
}

.avg-cost-line {
	border-color: #debf42;
}

.avg-cost-line-price {
	background-color: #debf42;
	color: #000;
}

.avg-stop-price-line {
	border-color: #9163f1;
}

.avg-stop-price-line-price {
	background-color: #9163f1;
	color: #fff;
}

.avg-high-line {
	border-color: #5cc255;
}

.avg-high-line-price {
	background-color: #5cc255;
	color: #fff;
}

.stop-rate-label {
	font-size: 14px;
	padding-left: 20px;
}
</style>
