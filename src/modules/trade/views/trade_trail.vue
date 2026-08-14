<template>
    <div>
        <Card class="kcharts-type-card">
            <div style="display: flex;">
                <div class="date-label" style="margin-left: 10px;">开始日期</div>
                <DatePicker :model-value="data.start"
                    type="date" placeholder="Select date" style="width: 150px"
                    @on-change="(dateStr, dateType) => onStartDateChange(dateStr, dateType, data.type)"/>
                <div class="date-label date-label-end">结束日期</div>
                <DatePicker :model-value="data.end" 
                    type="date" placeholder="Select date" style="width: 150px" 
                    @on-change="(dateStr, dateType) => onEndDateChange(dateStr, dateType, data.type)" />
                <Button v-if="data.type === 'day'" type="text" @click="onNextDay(data.type)">下一天</Button>
                <ButtonGroup class="button-group">
                    <Button @click="onTypeChange('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                    <Button @click="onTypeChange('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                    <Button @click="onTypeChange('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                    <Button @click="onTypeChange('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
                </ButtonGroup>
                <Input v-model="data.stockInput" @on-clear="onClearStockInput" clearable placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">搜素</Button>
                <Button v-if="data.viewType === 'tradeTraining'" type="primary" @click="onRandomStock" style="margin-left: 15px">随机选股</Button>
                <div class="space-all"></div>
                <Button v-if="data.viewType === 'tradeTraining'" type="primary" @click="onCalSumProfit">计算总利润</Button>
                <div style="margin-left: 5px;">
                    <span class="profit-label">总利润:</span>
                    <span class="profit-label" :style="{'margin-left': '5px', color: data.sumProfit >= 0 ? 'rgb(238, 37, 0)' : 'rgb(2, 179, 61)' }">{{ data.sumProfit }}</span>
                    <span class="profit-label" style="margin-left: 5px;">成功:</span>
                    <span class="profit-label" style="margin-left: 5px;">{{ data.successCount }}</span>
                    <span class="profit-label" style="margin-left: 5px;">失败:</span>
                    <span class="profit-label" style="margin-left: 5px;">{{ data.failCount }}</span>
                </div>
            </div>
        </Card>
        <div v-if="data.kCharts && data.kCharts.length">
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }" v-for="(kChartData, i) in data.kCharts" 
                :kChartLocalKey="data.kChartLocalKey"
                :auditTrailVisible="data.auditTrailVisible"
                @audit-trail-change="onAuditTrailChange" />
        </div>

        <div class="page-container">
            <Page @on-change="onPageChange" :modelValue="data.page" :page-size="data.pageSize" :total="data.total" simple />
            <div style="margin-left: 10px;">共 {{ data.total }} 条</div>
        </div>
        <div class="space"></div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { nextTick, onMounted, ref } from 'vue';
import { Message } from 'view-ui-plus';
import { useRoute } from 'vue-router';
import KChart from './components/kchart/kchart.vue';
import { formatLocalYMD, parseLocalYMDString, getNextDay } from '../util/date';
import { globalEventEmitter } from '../../../util/event';
import { trim } from '../util/str';
import config from '../config/config.js';

const route = useRoute()

const itemRefs = ref([]);

let data = ref({
    auditTrailVisible: true, // 是否显示复盘的编辑框
    kChartLocalKey: 'tradeTrail',
    viewType: 'tradeTrail',
    type: 'day',
    stocks: [],
    kCharts: [],
    stockInput: '',
    total: 0,
    page: 1,
    pageSize: 20,
    start: '2026-01-01', // formatLocalYMD(new Date(new Date().getTime() - 180 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    refHighPriceVisible: false,
    relativeStrengthVisible: false,
    allStocks: [],
    allStocksMap: {},
    sumProfit: 0,
    successCount: 0,
    failCount: 0
})

function calStockProfit(stock) {
	if (!(stock && stock.tradeActions && stock.tradeActions.length)) {
		return 0;
	}
	let buyAmount = 0;
	let sellAmount = 0;
	let remainingCount = 0;
	for (let i = 0; i < stock.tradeActions.length; i++) {
		let action = stock.tradeActions[i];
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
		// finalAmount += (data.value.curPrice * remainingCount);
        Message.error({
            duration: 10,
            content: `${stock.stockName} 的买入和卖出数量不相等，可能还没有清仓`
        });
        return 0;
	}
	return finalAmount - buyAmount;
}

function onCalSumProfit() {
    let stocks = JSON.parse(localStorage.getItem(data.value.kChartLocalKey) || '[]');
    let sumProfit = 0;
    data.value.successCount = 0;
    data.value.failCount = 0;
    for (let i = 0; i < stocks.length; i++) {
        const profit = calStockProfit(stocks[i]);
        if (profit > 0) {
            data.value.successCount++;
        } else if (profit < 0) {
            data.value.failCount++;
        }
        sumProfit += profit;
    }
    data.value.sumProfit = sumProfit;
}

onMounted(async () => {
    // 默认是交易复盘
    if (route.path === '/trade/paper') {
        // 程序化交易
        data.value.viewType = 'tradePaper';
        data.value.auditTrailVisible = false;
        data.value.kChartLocalKey = 'tradePaperStocks';
        data.value.start = '2025-01-01';
        data.value.end = '2026-01-01';
    } else if (route.path === '/trade/training') {
        // 交易训练
        data.value.viewType = 'tradeTraining';
        data.value.kChartLocalKey = 'tradeTrainingStocks';
        data.value.end = '2026-05-10';
        initAllStocks();
    }

    // 只读了 refHighPriceVisible、relativeStrengthVisible, 没有往本地写tradeTrackedStockKChartSettings
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);
    data.value.refHighPriceVisible = !!settings.refHighPriceVisible;
    data.value.relativeStrengthVisible = !!settings.relativeStrengthVisible;

    initBreadcrumb();

    let url = config.url + '/api/stocks/setting?key=' + data.value.viewType;
    const res = await axios.get(url);
    if (res.data && res.data.data) {
        // settingData: {
        data.value.start = res.data.data.start;
        data.value.end = res.data.data.end;
        data.value.page = res.data.data.page;
        data.value.type = res.data.data.type;
        data.value.stockInput = res.data.data.stockInput;
    }

    let stocks = getStocks();
    data.value.total = stocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    nextTick(() => {
        onRequest(data.value.type, data.value.stocks);
    })
});

function initBreadcrumb() {
    const labelMap = {
        tradeTrail: '交易复盘',
        tradePaper: '程序化交易',
        tradeTraining: '交易训练'
    };
    globalEventEmitter.emit('breadcrumb', {
        list: [
            {
                to: '/',
                label: '首页'
            },
            {
                label: labelMap[data.value.viewType]
            }
        ]
    });
}

function initAllStocks() {
    const allStockStr = localStorage.getItem('tradeAllFullIdStocks') || '[]';
    data.value.allStocks = JSON.parse(allStockStr);
    for (let i = 0; i < data.value.allStocks.length; i++) {
        data.value.allStocksMap[data.value.allStocks[i].stockFullId] = data.value.allStocks[i];
    }
}

function getStocks() {
    let stocks = JSON.parse(localStorage.getItem(data.value.kChartLocalKey) || '[]');
    stocks = filterStocks(stocks);
    stocks.sort((a, b) => {
        if (a.isStar && !b.isStar) {
            return -1;
        }
        if (b.isStar && !a.isStar) {
            return 1;
        }
        return 0;
    });
    data.value.total = stocks.length;
    return stocks;
}

function filterStocks(stocks) {
    let theStocks = stocks.slice(0);
    for (let i = theStocks.length - 1; i >= 0; i--) {
        let stock = stocks[i];
        let stockInput = data.value.stockInput;
        if (!checkStockInput(stock.stockId, stockInput) && !checkStockInput(stock.stockName, stockInput)) {
            theStocks.splice(i, 1);
        }
    }
    return theStocks;
}

function checkStockInput(text, stockInput) {
    let arr = stockInput.split(',');
    for (let i = 0; i < arr.length; i++) {
        let input = arr[i].trim();
        if (text.indexOf(input) >= 0) {
            return true;
        }
    }
    return false;
}

async function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type, data.value.stocks);
    await saveSettingToServer();
}

async function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type, data.value.stocks);
    await saveSettingToServer();
}

async function saveSettingToServer() {
    let url = config.url + '/api/stocks/setting';
    await axios.post(url, {
        key: data.value.viewType,
        settingData: {
            start: data.value.start,
            end: data.value.end,
            page: data.value.page,
            type: data.value.type,
            stockInput: data.value.stockInput
        }
    });
}

async function onNextDay(type) {
    const nextDay = getNextDay(data.value.end);
    data.value.end = nextDay;
    onRequest(type, data.value.stocks);
    await saveSettingToServer();
}

async function onTypeChange(type) {
    data.value.type = type;
    onRequest(type, data.value.stocks);
    await saveSettingToServer();
}

async function onRequest(type, stocks) {
    data.value.type = type;
    data.value.kCharts = [];

    if (!(stocks && stocks.length > 0)) {
        return;
    }

    let startStr = data.value.start; // 2025-06-12
    let endStr = data.value.end;
	let startDate = parseLocalYMDString(startStr);
    let endDate = parseLocalYMDString(endStr);

	let count;
	
    if (type === 'minute') {
        // 
    } else if (type === "day") {
        count = Math.floor((endDate - startDate) / (24 * 3600 * 1000));
    } else if (type === "week") {
        count = Math.floor((endDate - startDate) / (7 * 24 * 3600 * 1000));
    } else if (type === "month") {
        count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    } else if (type === "year") {
		count = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    }
        
    stocks.forEach(stock => {
        data.value.kCharts.push({
            stockId: stock.stockId,
            stockFullId: stock.stockFullId,
            stockName: stock.stockName,
            highPrice: stock.highPrice,
            stopPrice: stock.stopPrice,
            isStar: !!stock.isStar,
            tradeActions: stock.tradeActions,
            trailData: stock.trailData
        });
    });

    await nextTick();

	itemRefs.value.forEach((el, index) => {
        if (el) {
            let stock = data.value.kCharts[index];
            // 每页 20 个，假如最后一页小于 20 个，翻到最后一页时，itemRefs 这时仍旧是 20 个，没有及时销毁
            // 此时 用 index 从 kCharts 里取 stock，就为空
            if (!stock) {
                return;
            }
            let requestType = data.value.type;
            if (requestType === 'minute') {
                el.requestMinuteK(stock, startStr, endStr, count);
            } else if (requestType == "day") {
                el.requestDayK(stock, startStr, endStr, count);
            } else if (requestType == "week") {
                el.requestWeekK(stock, startStr, endStr, count);
            } else if (requestType == "month") {
                el.requestMonthK(stock, startStr, endStr, count);
            } else if (requestType == "year") {
                el.requestYearK(stock, startStr, endStr, count);
            }
        }
    });
}

async function onPageChange(page) {
    data.value.page = page;

    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);

    onRequest(data.value.type, data.value.stocks);
    await saveSettingToServer();
}

async function onSearch() {
    data.value.stockInput = trim(data.value.stockInput || '');
    let page = 1;
    data.value.page = page;
    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);

    onRequest(data.value.type, data.value.stocks);
    await saveSettingToServer();
}

async function onRandomStock() {
    let end = '2026-05-06';
    let stocks = JSON.parse(localStorage.getItem(data.value.kChartLocalKey) || '[]');
    let url = config.url + `/api/stocks/get_stocks_by_market_value?date=${end}&minMarketValue=100&maxMarketValue=800`;
    let res = await axios.get(url);
    let stocksWithMarketValue = res.data.data.list;
    while (true) {
        const length = stocksWithMarketValue.length;
        const randomIndex = parseInt(Math.random() * length);
        const stockTmp = stocksWithMarketValue[randomIndex];
        const stock = data.value.allStocksMap[stockTmp.stockFullId];

        let found = false;
        for (let i = 0; i < stocks.length; i++) {
            if (stock.stockFullId === stocks[i].stockFullId) {
                found = true;
                break;
            }
        }
        if (!found) {
            stocks.unshift(stock);
            const stockStr = JSON.stringify(stocks);
            localStorage.setItem(data.value.kChartLocalKey, stockStr);
            data.value.end = end;
            await saveSettingToServer();
            location.reload();
            break;
        }
    }
}

function onClearStockInput() {
    data.value.stockInput = '';
}

function onAuditTrailChange(stockId, trailData) {
    let str = localStorage.getItem(data.value.kChartLocalKey) || '[]';
    let stocks = JSON.parse(str);
    for (let i = 0; i < stocks.length; i++) {
        if (stocks[i].stockId === stockId) {
            stocks[i].trailData = trailData;
            localStorage.setItem(data.value.kChartLocalKey, JSON.stringify(stocks, null, 4));
            location.reload();
            break;
        }
    }
}
</script>

<style scoped>
.kcharts-type-card {
    margin-bottom: 20px;
}

.date-label {
    margin-right: 10px;
    line-height: 32px;
}

.date-label-end {
    margin-left: 10px;
}

.button-group {
    margin-left: 10px;
}

.space-all {
    flex: 1;
}

.page-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.space {
    height: 100px;
}

.profit-label {
    line-height: 32px;
}
</style>
