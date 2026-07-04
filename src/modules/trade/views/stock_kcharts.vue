<template>
    <div>
        <KChartList :type="data.type" 
            :start="data.start"
            :end="data.end"
            :page="data.page"
            :stocks="data.curStocks"
            :filterData="data.filterData"
            @start-change="onStartChange"
            @end-change="onEndChange"
            @type-change="onTypeChange"
            @local-key-change="onLocalKeyChange"
            @stock-search="onStockSearch"
            @stocks-union="onStocksUion"></KChartList>
        <div class="page-container">
            <Page @on-change="onPageChange" :modelValue="data.page" :page-size="data.pageSize" :total="data.total" simple />
            <div style="margin-left: 10px;">共 {{ data.total }} 条</div>
        </div>
        <div class="space"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import KChartList from './components/kchart/kchart_list.vue';
import { formatLocalYMD } from '../util/date';
import { useRoute } from 'vue-router'

const route = useRoute()

let data = ref({
    type: 'day',
    start: formatLocalYMD(new Date(new Date().getTime() - 100 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    curStocks: [],
    total: 0,
    pageSize: 20,
    page: 1,
    filterData: null,
})

onMounted(async () => {
    init();
});

function init() {
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);

    // type: day week month year
    if (settings.type) {
        data.value.type = settings.type;
    }
    if (settings.start) {
        data.value.start = settings.start;
    }
    if (settings.end) {
        data.value.end = settings.end;
    }
    if (settings.page) {
        data.value.page = settings.page;
    }
    if (settings.filterData) {
        data.value.filterData = settings.filterData;
    }

    let stocks = getStocks();
    data.value.total = stocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
}

function onTypeChange(type) {
    // type: day week month year
    data.value.type = type;
    saveSettings();
}

function onStartChange(dateStr) {
    data.value.start = dateStr;
    saveSettings();
}

function onEndChange(dateStr) {
    data.value.end = dateStr;
    saveSettings();
}

function onPageChange(page) {
    data.value.page = page;

    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
}

function getStocks() {
    let kChartLocalKey = localStorage.getItem('tradeKChartLocalKey');
    if (!kChartLocalKey) {
        kChartLocalKey = 'tradeTrackedStocks';
        localStorage.setItem('tradeKChartLocalKey', kChartLocalKey)
    }
    let stocks = JSON.parse(localStorage.getItem(kChartLocalKey) || '[]');
    stocks = filterStocks(stocks);
    data.value.total = stocks.length;
    return stocks;
}

function onLocalKeyChange() {
    data.value.page = 1;
    saveSettings();
    location.reload();
}

function onStockSearch(filterData) {
    let page = 1
    data.value.page = page;

    data.value.filterData = filterData;
    let stocks = getStocks();
    
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
}

function filterStocks(stocks) {
    let filterData = data.value.filterData;
    let theStocks = [];
    for (let i = 0; i < stocks.length; i++) {
        let stock = stocks[i];
        if (filterData && filterData.stockInput) {
            if (stock.stockId.indexOf(filterData.stockInput) >= 0) {
                theStocks.push(stock);
                continue;
            }
            if (stock.stockName.indexOf(filterData.stockInput) >= 0) {
                theStocks.push(stock);
                continue;
            }
        } else {
            theStocks.push(stock);
        }
    }
    return theStocks;
}

function onStocksUion() {
    let page = 1
    data.value.page = page;

    let stocks = getStocks();
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
}

function saveSettings() {
    let jsonStr = JSON.stringify({
        type: data.value.type,
        start: data.value.start,
        end: data.value.end,
        page: data.value.page,
        filterData: data.value.filterData
    });
    localStorage.setItem('tradeTrackedStockKChartSettings', jsonStr)
}
</script>

<style scoped>
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

<style>
.ivu-page-simple .ivu-page-simple-pager input {
    width: 60px!important;
}
</style>
