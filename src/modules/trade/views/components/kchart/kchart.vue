<template>
	<template v-if="!props.isNewPriceMode">
		<div class="kchart-container">
			<div class="stock-name">
				<div class="stock-name-left-box"></div>
				<div class="stock-name-space"></div>
				<div class="stock-name-txt">
					<a class="stock-name-link" :href="`https://xueqiu.com/S/${data.stock && data.stock.stockFullId}`" target="_blank">
						{{ data.stockName }}
					</a>
					{{ data.stockDetail ? `&nbsp;(总市值&nbsp;${zongShiZhi})` : '' }}
					<span class="stock-cur-price" :style="{color: data.lastPriceUpColor}">¥{{ data.curPrice.toFixed(2) }}</span>
					<span class="stock-price-change" :style="{color: data.lastPriceUpColor}">{{ data.dtPriceUpdated ? (data.dtPrice > 0 ? '+' : '') + data.dtPrice.toFixed(2) : ''}}</span>
					<span class="stock-price-change" :style="{color: data.lastPriceUpColor, 'margin-left': '10px'}">{{data.dtRate > 0 ? '+' : ''}}{{ ((data.dtRate * 100).toFixed(2) + '%')}}</span>
					<template v-if="props.kChartLocalKey !== 'tradeAllFullIdStocks'">
						<span v-if="data.stock && currentDownRate" class="stop-rate-label">当前参考跌幅 {{ currentDownRate }}</span>
						<span v-if="data.stock && allowMaxDownRate" class="stop-rate-label">止损参考跌幅 {{  allowMaxDownRate }}</span>
						<span v-if="data.stock && stopRate" class="stop-rate-label">实际止损 {{ stopRate }}</span>
						<span v-if="data.stock && chiCangShiZhi" class="stop-rate-label">持仓市值 {{ chiCangShiZhi.toLocaleString() }}</span>
						<span v-if="data.stock && props.kChartLocalKey === 'tradeTrail'" class="stop-rate-label">买入金额 {{ maiRuJinE.toLocaleString() }}</span>
						<span v-if="data.stock && isSoldOut" class="stop-rate-label">卖出价格 {{  sellPrice.toFixed(4) }}</span>
						<span v-if="data.stock && profitRate" class="stop-rate-label">利润 <span :style="{color: profitRateColor}">{{ profitRate }}</span></span>
						<Button v-if="props.kChartLocalKey !== 'tradeCustomStocks'" @click="onShowEditModal" type="primary" icon="md-brush" size="small" style="margin-left: 10px;">编辑</Button>
					</template>
					<Button v-if="allowAddToPotential" @click="onShowPotentialModal" type="primary" size="small" style="margin-left: 10px;">加入候选股</Button>
					<Button v-if="props.kChartLocalKey === 'tradePotentialStocks'" @click="onShowRemovePotentialModal" type="primary" size="small" style="margin-left: 10px;">移出候选股</Button>
				</div>
				<div class="stock-name-space"></div>
				<div class="stock-name-right-box">
					<Button @click="onShowAskAIModal" type="warning" size="small" style="margin-left: 10px;">问AI?</Button>
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
			
			<template v-if="data.activeKItemData && data.activeKItemData.tradeAction">
				<div v-if="data.activeKItemData.tradeAction.type === 'buy'" class="kchart-trade-buy-or-sell">
					买入 {{data.activeKItemData.tradeAction.price.toFixed(4)}} X {{data.activeKItemData.tradeAction.count}} 股
				</div>
				<div v-else-if="data.activeKItemData.tradeAction.type === 'sell'" class="kchart-trade-buy-or-sell" style="background-color: #5287ee;">
					卖出 {{data.activeKItemData.tradeAction.price.toFixed(4)}} X {{data.activeKItemData.tradeAction.count}} 股
				</div>
			</template>

			<div v-if="data.stock && data.stock.highPrice > 0" class="y-axis-price-line avg-high-line" :style="{top: `${data.highPriceY}px`}">
				<div class="y-axis-price-line-price avg-high-line-price">{{ data.stock.highPrice }}</div>
			</div>
			<div v-if="avgCost > 0" class="y-axis-price-line avg-cost-line" :style="{top: `${data.avgCostY}px`}">
				<div class="y-axis-price-line-price avg-cost-line-price">{{ avgCost.toFixed(4) }}</div>
			</div>
			<div v-if="data.stock && data.stock.stopPrice > 0" class="y-axis-price-line avg-stop-price-line" :style="{top: `${data.stopPriceY}px`}">
				<div class="y-axis-price-line-price avg-stop-price-line-price">{{ data.stock.stopPrice }}</div>
			</div>

			<div v-if="data.activeKItemData && data.isMouseMoveOnKItem" class="y-axis-price-line" :style="{top: `${data.yAxisPriceLine}px`}">
				<div class="y-axis-price-line-price">{{ data.yAxisPriceLinePrice }}</div>
			</div>
			<div v-if="data.type !== 'minute' && data.dataLoaded" ref="candlesContainerRef"
				@scroll="onCandlesContainerScroll" class="candles-container">
				<Candle
					:ref="el => { if (el) candleRefs[i] = el }"
					v-for="(item, i) in data.myKList" :key="i"
					:stockId="data.stock.stockId"
					:stockHighPrice="data.stock.highPrice"
					:kLineType="data.type"
					:date="item[0]"
					:tradeAction="getTradeAction(item[0])"
					:openPrice="item[1]"
					:closePrice="item[2]"
					:highPrice="item[3]"
					:lowPrice="item[4]"
					:volume="item[5]"
					:amount="item[8]"
					:lowPriceInAll="data.lowPriceInAll"
					:highPriceInAll="data.highPriceInAll"
					:candleMaxHeight="data.candleMaxHeight"
					@mouse-over="(candleData) => onCandleMouseOver(i, candleData)"
					@mouse-out="() => onCandleMouseOut(i)"
					@mouse-move="(candleData) => onCandleMouseMove(i, candleData)"
				/>
			</div>
			<div v-else-if="data.dataLoaded" ref="minuteLinesContainerRef"
				@scroll="onMinuteLinesContainerScroll" class="minute-lines-container">
				<MinuteLine 
					:ref="el => { if (el) minuteLineRefs[i] = el }"
					v-for="(item, i) in data.minuteList" :key="i"
					:stock="data.stock"
					:kLineType="data.type"
					:index="i"
					:time="item.time"
					:minute="item.minute"
					:price="item.price"
					:prevDayClosePrice="item.prevDayClosePrice"
					:highPriceInAll="item.highPriceInAll"
					:lowPriceInAll="item.lowPriceInAll"
					:nextPrice="item.nextPrice"
					:volume="item.volume"
					:amount="item.amount"
					:maxHeight="data.candleMaxHeight"
					@mouse-over="(candleData) => onMinuteLineMouseOver(i, candleData)"
					@mouse-out="() => onMinuteLineMouseOut(i)"
					@mouse-move="(candleData) => onMinuteLineMouseMove(i, candleData)"
				/>
			</div>
			<StockInfoPopup v-if="data.activeKItemData" :info="data.activeKItemData" />
			<AuditTrail v-if="props.auditTrailVisible" @audit-trail-change="onAuditTrailChange" :trailData="data.stock?.trailData"/>
		</div>
		<Volume ref="volumeRef" :maxVolume="data.maxVolume" :minVolume="data.minVolume" 
			:kLineType="data.type" :volumeList="data.volumeList" :activeKItemData="data.activeKItemData" 
			@mouse-over="onVolumeMouseOver"
			@mouse-out="onVolumeMouseOut"
			@scroll="onVolumeScroll" />
		<EditKChartModal :kChartLocalKey="props.kChartLocalKey" @hide-modal="onHideEditModal" :stock="data.stock" :modalVisible="data.editModalVisible" />
		<AddPotentialModal @hide-modal="onHidePotentialModal" :stock="data.stock" :modalVisible="data.addPotentialModalVisible" />
		<RemovePotentialModal @hide-modal="onHideRemovePotentialModal"
			@stocks-remove-potential="onStocksRemovePotential" 
			:stock="data.stock" :modalVisible="data.removePotentialModalVisible" />
		<AskAIModal @hide-modal="onHideAskAIModal"
			:stock="data.stock" :modalVisible="data.askAIModalVisible" />
	</template>
	<template v-else>
		<StockNewPrice :stockName="data.stockName"
		:stockFullId="data.stock?.stockFullId"
		:lastPriceUpColor="data.lastPriceUpColor"
		:curPrice="data.curPrice"
		:dtPrice="data.dtPrice"
		:dtRate="data.dtRate"
		:dtPriceUpdated="data.dtPriceUpdated" />
	</template>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import * as stockUtil from '../../../util/stock_util';
import StockNewPrice from '../stock_new_price.vue';
import MinuteLine from './minute_line.vue';
import Candle from './candle.vue';
import Volume from './volume.vue';
import StockInfoPopup from './stock_info_popup.vue';
import EditKChartModal from './edit_kchart_modal.vue';
import AddPotentialModal from './add_potential_modal.vue';
import RemovePotentialModal from './remove_potential_modal.vue';
import AskAIModal from './ask_ai_modal.vue';
import AuditTrail from './audit_trail.vue';

const emit = defineEmits(['stocks-remove-potential', 'audit-trail-change']);

const props = defineProps([
	'kChartLocalKey',
	'type',
	'isNewPriceMode',
	'auditTrailVisible'
]);

let candlesContainerRef = ref(null);
let minuteLinesContainerRef = ref(null);

const candleRefs = ref([]);
const minuteLineRefs = ref([]);

let volumeRef = ref(null);

let data = ref({
	dataLoaded: false,
	type: 'day',
	stock: null, // { "stockFullId": "sz000858", "stockId": "000858", "stockName": "五粮液", highPrice: 100, stopPrice: 90, tradeActions: [] }
	stockDetail: null, //  { stockId: '000858', zongShiZhi: '4623.77亿' }
	stockName: '',
	highPriceY: -1, // 最高参考价的 Y 坐标
	avgCostY: -1, // 平均成本价的 Y 坐标
	stopPriceY: -1, // 止损价的 Y 坐标
    lowPriceInAll: 0,
	highPriceInAll: 0,
    candleMaxHeight: 280,
	start: '',
    end: '',
    myKList: [],
	volumeList: [],
	maxVolume: 0,
	minVolume: 0,
	yAxis1: 0,
    yAxis2: 0,
    yAxis3: 0,
    yAxis4: 0,
    yAxis5: 0,
	yAxisPriceLine: 0, // 鼠标滑动的过程中，鼠标光标位置水平线的 Y 坐标
	yAxisPriceLinePrice: 0, // 鼠标滑动的过程中，鼠标光标位置水平线对应的价格
	isMouseMoveOnKItem: false, // 鼠标在K线图的蜡烛上滑动，或分时图的分时点上滑动
	activeKItemData: null, // 鼠标在K线图的蜡烛上滑动，或分时图的分时点上滑动，对应的数据
    yAxisText1: '',
    yAxisText2: '',
    yAxisText3: '',
    yAxisText4: '',
    yAxisText5: '',
	dtPrice: 0, // 价格改变量， 如 +0.81
	dtPriceUpdated: false, // 价格改变量更新了
	dtRate: 0, // 价格涨幅
	curPrice: 0, // 当前最新价
	lastPriceUpColor: '', // 价格涨跌的颜色
	editModalVisible: false,
	addPotentialModalVisible: false,
	removePotentialModalVisible: false,
	askAIModalVisible: false,
	minuteList: [] // 分时点数据
});

onMounted(async () => {
	data.value.type = props.type;
});

function getTradeAction(date) {
	if (!data.value.stock) {
        return null;
    }
	const tradeActions = data.value.stock.tradeActions;
	if (!tradeActions) {
        return null;
    }
	for (let i = 0 ; i < tradeActions.length; i++) {
		if (tradeActions[i].date === date) {
			return tradeActions[i]
		}
	}
	return null;
}

const zongShiZhi = computed(() => {
	if (data.value.stockDetail && data.value.stockDetail.zongShiZhi > 10000) {
		return (data.value.stockDetail.zongShiZhi / 10000).toFixed(2) + '万亿';
	}
	return data.value.stockDetail ? data.value.stockDetail.zongShiZhi + '亿' : '';
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
	if (count === 0) {
		return 0;
	}
	return Number(amount / count);
})

// 相对于最高参考价的涨跌幅
const currentDownRate = computed(() => {
	if (!data.value.stock || !data.value.stock.highPrice) {
		return '';
	}
	let rate = -(data.value.stock.highPrice - data.value.curPrice) / data.value.stock.highPrice * 100;
	return rate.toFixed(2) + '%'
})

// 持仓市值
const chiCangShiZhi = computed(() => {
	if (!(data.value.stock && data.value.stock.tradeActions && data.value.stock.tradeActions.length)) {
		return '';
	}
	let remainingCount = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'buy') {
			remainingCount += action.count;
		} else if (action.type === 'sell') {
			remainingCount -= action.count;
		}
	}
	if (remainingCount > 0) {
		return data.value.curPrice * remainingCount;
	}
	return '';
});

// 买入金额
const maiRuJinE = computed(() => {
	if (!(data.value.stock && data.value.stock.tradeActions && data.value.stock.tradeActions.length)) {
		return 0;
	}
	let buyAmount = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'buy') {
			buyAmount += (action.price * action.count);
		}
	}
	return buyAmount;
});


// 利润
const profitRate = computed(() => {
	if (!(data.value.stock && data.value.stock.tradeActions && data.value.stock.tradeActions.length)) {
		return '';
	}
	let buyAmount = 0;
	let sellAmount = 0;
	let remainingCount = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'buy') {
			buyAmount += (action.price * action.count);
			remainingCount += action.count;
		} else if (action.type === 'sell') {
			sellAmount += (action.price * action.count);
			remainingCount -= action.count;
		}
	}
	let finalAmount = sellAmount;
	if (remainingCount > 0) {
		finalAmount += (data.value.curPrice * remainingCount);
	}
	return (finalAmount - buyAmount).toFixed(2) + ' ' + (100 * (finalAmount - buyAmount) / buyAmount).toFixed(2) + '%';
})

const profitRateColor = computed(() => {
	if (profitRate.value.charAt(0) === '-') {
		return '#02b33d';
	}
	return '#ee2500';
});

// 是否卖完了
const isSoldOut = computed(() => {
	if (!(data.value.stock && data.value.stock.tradeActions && data.value.stock.tradeActions.length)) {
		return false;
	}
	let buyCount = 0;
	let sellCount = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'buy') {
			buyCount += action.count;
		} else if (action.type === 'sell') {
			sellCount += action.count;
		}
	}
	if (buyCount > 0 && buyCount === sellCount) {
		return true;
	}
	return false;
});

// 卖出价格(平均卖出价格)
const sellPrice = computed(() => {
	if (!(data.value.stock && data.value.stock.tradeActions && data.value.stock.tradeActions.length)) {
		return '';
	}
	let sellAmount = 0;
	let sellCount = 0;
	for (let i = 0; i < data.value.stock.tradeActions.length; i++) {
		let action = data.value.stock.tradeActions[i];
		if (action.type === 'sell') {
			sellAmount += (action.price * action.count);
			sellCount += action.count;
		}
	}
	return sellAmount / sellCount;
})

// 实际止损比率(相对于平均成本)
const stopRate = computed(() => {
	if (!data.value.stock || !(avgCost.value > 0) || !data.value.stock.stopPrice) {
		return '';
	}
	let rate = -(avgCost.value - data.value.stock.stopPrice) / avgCost.value * 100;
	return rate.toFixed(2) + '%'
});

// 相对于最高参考价 的 止损比率
const allowMaxDownRate = computed(() => {
	if (!data.value.stock || !data.value.stock.stopPrice || !data.value.stock.highPrice) {
		return '';
	}
	let rate = -(data.value.stock.highPrice - data.value.stock.stopPrice) / data.value.stock.highPrice * 100;
	return rate.toFixed(2) + '%'
})

// 是否允许加入候选股
const allowAddToPotential = computed(() => {
	let arr = [ 'tradeAllFullIdStocks', 'tradeCustomStocks', 'tradeStocksByStrategy1', 'tradeStocksByStrategy2' ];
	return arr.indexOf(props.kChartLocalKey) >= 0;
})

function resetData(stock, start, end) {
	data.value.dataLoaded = false;
	data.value.stock = stock;
	data.value.highPriceY = -1;
	data.value.avgCostY = -1;
	data.value.stopPriceY = -1;
	data.value.stockDetail = null;
	data.value.stockName = stock.stockName;
	data.value.myKList = [];
	data.value.start = start;
    data.value.end = end;
}

async function requestMinuteK(stock, start, end, count) {
	resetData(stock, start, end);
	data.value.dataLoaded = false;
	const tasks = await Promise.all([
		stockUtil.requestStockDetail(stock),
		stockUtil.requestMinuteK(stock.stockFullId)
	]);
	data.value.dataLoaded = true;
	data.value.stockDetail = tasks[0];
	data.value.minuteList = tasks[1].minuteList;
	data.value.curPrice = tasks[1].curPrice;
	updateMinuteChart('minute', { prevDayClosePrice: tasks[1].prevDayClosePrice });
}

function updateMinuteChart(type, option) {
	data.value.type = type;
	data.value.volumeList = [];
	data.value.maxVolume = 0;
	data.value.minVolume = -1;
	const minuteList = data.value.minuteList;
    for (let i = 0; i < minuteList.length; i++) {
		data.value.volumeList.push({
			time: minuteList[i].time,
			volume: minuteList[i].volume,
			amount: minuteList[i].amount,
			openPrice: minuteList[i].openPrice,
			closePrice: minuteList[i].closePrice,
		});

		if (minuteList[i].volume > data.value.maxVolume) {
			data.value.maxVolume = minuteList[i].volume;
		}
		if (minuteList[i].volume < data.value.minVolume || data.value.minVolume === -1) {
			data.value.minVolume = minuteList[i].volume;
		}
    }

	data.value.dtPriceUpdated = true;
	data.value.dtPrice = data.value.curPrice - option.prevDayClosePrice;
	data.value.dtRate = data.value.dtPrice / option.prevDayClosePrice;
	if (data.value.curPrice > option.prevDayClosePrice) {
		data.value.lastPriceUpColor = '#ee2500'
	} else if (data.value.curPrice === option.prevDayClosePrice) {
		data.value.lastPriceUpColor = '#868686';
	} else {
		data.value.lastPriceUpColor = '#02b33d';
	}
}

async function requestDayK(stock, start, end, count) {
	resetData(stock, start, end);
	data.value.dataLoaded = false;
	const tasks = await Promise.all([
		stockUtil.requestStockDetail(stock),
		stockUtil.requestDayK(stock.stockFullId, start, end, count)
	]);
	data.value.dataLoaded = true;
	updateKListData(tasks[0], tasks[1]);
	updateChart("day");
}

async function requestWeekK(stock, start, end, count) {
	resetData(stock, start, end);
	data.value.dataLoaded = false;
	const tasks = await Promise.all([
		stockUtil.requestStockDetail(stock),
		stockUtil.requestWeekK(stock.stockFullId, start, end, count)
	]);
	data.value.dataLoaded = true;
	updateKListData(tasks[0], tasks[1]);
	updateChart("week");
}

async function requestMonthK(stock, start, end, count) {
	resetData(stock, start, end);
	data.value.dataLoaded = false;
	const tasks = await Promise.all([
		stockUtil.requestStockDetail(stock),
		stockUtil.requestMonthK(stock.stockFullId, start, end, count)
	]);
	data.value.dataLoaded = true;
	updateKListData(tasks[0], tasks[1]);
	updateChart("month")
}

async function requestYearK(stock, start, end, count) {
	resetData(stock, start, end);
	data.value.dataLoaded = false;
	const tasks = await Promise.all([
		stockUtil.requestStockDetail(stock),
		stockUtil.requestYearK(stock.stockFullId, start, end, count)
	]);
	data.value.dataLoaded = true;
	updateKListData(tasks[0], tasks[1]);
	updateChart("year")
}

function updateKListData(stockDetail, myKList) {
	data.value.stockDetail = {
		stockId: stockDetail.stockId,
		zongShiZhi: stockDetail.zongShiZhi.toFixed(2), // 总市值
	};
	data.value.maxVolume = 0;
	data.value.minVolume = -1;
	for (let i = 0; i < myKList.length; i++) {
		// 5 号元素是成交量
		if (myKList[i][5] > data.value.maxVolume) {
			data.value.maxVolume = myKList[i][5];
		}
		if (myKList[i][5] < data.value.minVolume || data.value.minVolume === -1) {
			data.value.minVolume = myKList[i][5];
		}
	}
	data.value.myKList = myKList;
}

 // 价格涨幅
function getDtRate() {
	return data.value.dtRate;
}

function updateChart(type) {
	let lowPriceInAll = 10000000;
	let highPriceInAll = -10000000;
    data.value.type = type;

	const myKList = data.value.myKList;
	data.value.volumeList = [];
    for (let i = 0; i < myKList.length; i++) {
		let highPrice = myKList[i][3];
		let lowPrice = myKList[i][4];
		if (lowPrice < lowPriceInAll) {
			lowPriceInAll = lowPrice;
        }
		if (highPrice > highPriceInAll) {
			highPriceInAll = highPrice;
        }
		data.value.volumeList.push({
			time: myKList[i][0],
			openPrice: myKList[i][1],
			closePrice: myKList[i][2],
			volume: myKList[i][5],
		});
    }

	data.value.dtPriceUpdated = false;
	if (myKList.length > 1) {
		data.value.dtPriceUpdated = true;
		let item1 = myKList[myKList.length - 2];
		let item2 = myKList[myKList.length - 1];
		data.value.curPrice = item2[2];
		data.value.dtPrice = item2[2] - item1[2];
		data.value.dtRate = data.value.dtPrice / item1[2];
		if (item2[2] > item1[2]) {
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
		index: i,
		// 元素布局宽度 = 内容宽度 + padding + border，不含 margin、滚动条（部分浏览器）
		containerWidth: candlesContainerRef.value.offsetWidth,
		scrollLeft: candlesContainerRef.value.scrollLeft
	};
	if (data.value.myKList && data.value.myKList[i - 1]) {
		// i 的 前一个交易日的收盘价
		theData.prevClosePrice = data.value.myKList[i - 1][2]
	}
	data.value.activeKItemData = theData;
}

function onCandleMouseOut(i) {
	data.value.activeKItemData = null;
	data.value.isMouseMoveOnKItem = false;
}

function onCandleMouseMove(i, candleData) {
	data.value.yAxisPriceLine = candleData.y + 55;
	data.value.yAxisPriceLinePrice = candleData.price;
	data.value.isMouseMoveOnKItem = true;
}

function onMinuteLineMouseOver(i, minuteLineData) {
	let theData = {
		...minuteLineData,
		index: i,
		containerWidth: minuteLinesContainerRef.value.offsetWidth,
		scrollLeft: minuteLinesContainerRef.value.scrollLeft
	};
	if (data.value.minuteList && data.value.minuteList[i - 1]) {
		// i 的 前一个分时点的收盘价
		theData.prevClosePrice = data.value.minuteList[i - 1].price;
	}
	data.value.activeKItemData = theData;
}

function onMinuteLineMouseOut(i) {
	data.value.activeKItemData = null;
	data.value.isMouseMoveOnKItem = false;
}

function onMinuteLineMouseMove(i, minuteLineData) {
	data.value.yAxisPriceLine = minuteLineData.y + 55;
	data.value.yAxisPriceLinePrice = minuteLineData.price;
	data.value.isMouseMoveOnKItem = true;
}

function onVolumeMouseOver(i) {
	if (data.value.type === 'minute') {
		minuteLineRefs.value.forEach((el, index) => {
			if (index === i) {
				el.setMouseOver();
				let theData = el.getMinuteData();
				onMinuteLineMouseOver(i, theData);
			}
		});
		return;
	}
	candleRefs.value.forEach((el, index) => {
		if (index === i) {
			el.setMouseOver();
			let candleData = el.getCandleData();
			onCandleMouseOver(i, candleData);
		}
	});
}

function onVolumeMouseOut(i) {
	if (data.value.type === 'minute') {
		minuteLineRefs.value.forEach((el, index) => {
			if (index === i) {
				el.setMouseOut();
				data.value.activeKItemData = null;
			}
		});
		return;
	}
	candleRefs.value.forEach((el, index) => {
		if (index === i) {
			el.setMouseOut();
			data.value.activeKItemData = null;
		}
	});
}

function onVolumeScroll(scrollLeft) {
	if (data.value.type === 'minute') {
		minuteLinesContainerRef.value.scrollLeft = scrollLeft;
	} else {
		candlesContainerRef.value.scrollLeft = scrollLeft;
	}
}

function onCandlesContainerScroll(event) {
	volumeRef.value.setScrollLeft(event.target.scrollLeft);
}

function onMinuteLinesContainerScroll(event) {
	volumeRef.value.setScrollLeft(event.target.scrollLeft);
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

function onStocksRemovePotential() {
	emit('stocks-remove-potential');
}

function onShowAskAIModal() {
	data.value.askAIModalVisible = true;
}

function onHideAskAIModal() {
	data.value.askAIModalVisible = false;
}

function onAuditTrailChange(trailData) {
	emit('audit-trail-change', data.value.stock.stockId, {
		...trailData,
	});
}

defineExpose({ requestMinuteK, requestDayK, requestWeekK, requestMonthK, requestYearK, getDtRate });
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
	font-size: 0;
	display: flex;
    align-items: center;
}

.stock-name-space {
	flex: 1;
}

.stock-name-left-box {
	font-size: 12px;
}

.stock-name-right-box {
	font-size: 12px;
}

.stock-name-link {
	color: rgb(81, 90, 110);
}

.stock-name-link:hover {
	color: #2d8cf0;
}

.stock-name-txt {
	display: flex;
    align-items: center;
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
    width: 55px;
    text-align: center;
}

.candles-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	height: 301px; /* 比 data.candleMaxHeight 高出 21px */
}

.minute-lines-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
    height: 301px; /* 比 data.candleMaxHeight 高出 21px */
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

.kchart-trade-buy-or-sell {
	background-color: #ee2500;
	position: absolute;
	color: #fff;
	z-index: 3;
	left: 0;
	top: 55px;
	padding: 2px 6px;
}
</style>
