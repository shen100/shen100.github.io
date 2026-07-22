<template>
    <div>
        <Card class="kcharts-type-card">
            <div style="display: flex;">
                <div class="date-label" style="margin-left: 10px;">开始日期</div>
                <DatePicker :model-value="data.start"
                    type="date" placeholder="Select date" style="width: 200px"
                    @on-change="(dateStr, dateType) => onStartDateChange(dateStr, dateType, data.type)"/>
                <div class="date-label date-label-end">结束日期</div>
                <DatePicker :model-value="data.end" 
                    type="date" placeholder="Select date" style="width: 200px" 
                    @on-change="(dateStr, dateType) => onEndDateChange(dateStr, dateType, data.type)" />
                <ButtonGroup class="button-group">
                    <Button @click="onTypeChange('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                    <Button @click="onTypeChange('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                    <Button @click="onTypeChange('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                    <Button @click="onTypeChange('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
                </ButtonGroup>
                <Input v-model="data.stockInput" @on-clear="onClearStockInput" clearable placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">搜素</Button>
                <div class="space-all"></div>
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
import { nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import KChart from './components/kchart/kchart.vue';
import { formatLocalYMD, parseLocalYMDString } from '../util/date';
import { trim } from '../util/str';

const route = useRoute()

const itemRefs = ref([]);

let data = ref({
    auditTrailVisible: true,
    kChartLocalKey: 'tradeTrail',
    type: 'day',
    stocks: [],
    kCharts: [],
    stockInput: '',
    total: 0,
    page: 1,
    pageSize: 20,
    start: '2026-01-01', // formatLocalYMD(new Date(new Date().getTime() - 180 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
})

onMounted(async () => {
    if (route.path === '/trade/paper') {
        data.value.auditTrailVisible = false;
        data.value.kChartLocalKey = 'tradePaperStocks';
        data.value.start = '2025-01-01';
        data.value.end = '2026-01-01';
    }

    let stocks = getStocks();
    data.value.total = stocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    nextTick(() => {
        onRequest(data.value.type, data.value.stocks);
    })
});

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
    let theStocks = [];
    for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i];
        if (data.value.stockInput) {
            if (stock.stockId.indexOf(data.value.stockInput) >= 0) {
                theStocks.push(stock);
                continue;
            }
            if (stock.stockName.indexOf(data.value.stockInput) >= 0) {
                theStocks.push(stock);
                continue;
            }
        } else {
            theStocks.push(stock);
        }
    }
    return theStocks;
}

function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type, data.value.stocks);
}

function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type, data.value.stocks);
}

function onTypeChange(type) {
    data.value.type = type;
    onRequest(type, data.value.stocks);
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
	
    if (type === "day") {
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
            trailData: stock.trailData,
            tradeActions: stock.tradeActions,
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
            if (requestType == "day") {
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

function onPageChange(page) {
    data.value.page = page;

    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    console.log(page, start);
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);

    onRequest(data.value.type, data.value.stocks);
}

function onSearch() {
    data.value.stockInput = trim(data.value.stockInput || '');
    let page = 1;
    data.value.page = page;
    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    data.value.stocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);

    onRequest(data.value.type, data.value.stocks);
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
</style>
