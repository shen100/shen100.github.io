<template>
    <div>
        <KChartList 
            :isCustomStocks="data.isCustomStocks"
            :type="data.type" 
            :start="data.start"
            :end="data.end"
            :page="data.page"
            :stocks="data.curStocks"
            :filterData="data.filterData"
            :refHighPriceVisible="data.refHighPriceVisible"
            :relativeStrengthVisible="data.relativeStrengthVisible"
            @start-change="onStartChange"
            @end-change="onEndChange"
            @type-change="onTypeChange"
            @local-key-change="onLocalKeyChange"
            @stock-search="onStockSearch"
            @stocks-union="onStocksUion"
            @filter-shizhi="onFilterShiZhi"
            @stocks-remove-potential="onStocksRemovePotential"></KChartList>
        <div class="page-container">
            <Page @on-change="onPageChange" :modelValue="data.page" :page-size="data.pageSize" :total="data.total" simple />
            <div style="margin-left: 10px;">共 {{ data.total }} 条</div>
        </div>
        <div class="space"></div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router'
import KChartList from './components/kchart/kchart_list.vue';
import { formatLocalYMD } from '../util/date';
import { trim } from '../util/str';
import config from '../config/config.js';

const route = useRoute()

let kChartLocalKey;

let data = ref({
    type: 'day', // minute, day, week, month, year
    start: formatLocalYMD(new Date(new Date().getTime() - 100 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    curStocks: [],
    isCustomStocks: false, // 通过地址栏传 uuid，uuid 对应一堆股票
    customStocks: [],
    total: 0,
    pageSize: 20,
    page: 1,
    filterData: null,
    refHighPriceVisible: false,
    relativeStrengthVisible: false
})

onMounted(async () => {
    init();
});

async function init() {
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);

    let uuid = trim(route.query.uuid || '');
    if (uuid) {
        data.value.isCustomStocks = true;
        data.value.customStocks = [];
    }

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
    data.value.refHighPriceVisible = !!settings.refHighPriceVisible;
    data.value.relativeStrengthVisible = !!settings.relativeStrengthVisible;

    // /trade/tracked_kcharts?selectShiZhiIndex=1&minValue=100&maxValue=500
    // 直接访问全部股票，市值 >= minValue 且 < maxValue
    if (route.query.selectShiZhiIndex) {
        settings.filterData = settings.filterData || {
            stockInput: '',
            filterShiZhi: {
                minValue: -1,
                maxValue: 10000 * 10000,
                value: '-1'
            }
        };
        settings.filterData.filterShiZhi.value = route.query.selectShiZhiIndex;
        settings.filterData.filterShiZhi.minValue = parseInt(route.query.minValue) || 0;
        settings.filterData.filterShiZhi.maxValue = parseInt(route.query.maxValue) || 0;
        data.value.filterData = settings.filterData;
        saveSettings();
    }

    kChartLocalKey = localStorage.getItem('tradeKChartLocalKey');
    if (!kChartLocalKey) {
        kChartLocalKey = 'tradeAllFullIdStocks';
        localStorage.setItem('tradeKChartLocalKey', kChartLocalKey)
    }

    if (uuid) {
        localStorage.setItem('tradeKChartLocalKey', 'tradeCustomStocks');
        kChartLocalKey = 'tradeCustomStocks'
    } else {
        // 地址栏没有传 uuid， 但本地存的 tradeKChartLocalKey 为 tradeCustomStocks
        // 因为，没有在本地存 key 为 tradeCustomStocks 对应的数据(在地址栏传uuid 获取股票数据, 可能每次获取的股票不一样)， 
        // 所以将 tradeKChartLocalKey 设为 tradeAllFullIdStocks
        if (kChartLocalKey === 'tradeCustomStocks') {
            kChartLocalKey = 'tradeAllFullIdStocks';
            localStorage.setItem('tradeKChartLocalKey', kChartLocalKey)
        }
    }

    if (uuid) {
        let url = config.url + '/api/stocks/get_stocks_by_uuid/' + uuid;
        const res = await axios.get(url);
		data.value.customStocks = res.data.data.stocks;
    }

    let stocks = getStocks();
    data.value.total = stocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
}

function onTypeChange(type) {
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
    let stocks;
    if (data.value.isCustomStocks) {
        stocks = data.value.customStocks.slice(0);
    } else {
        stocks = JSON.parse(localStorage.getItem(kChartLocalKey) || '[]');
    }
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

function onLocalKeyChange() {
    data.value.page = 1;
    saveSettings();
    location.href = '/trade/tracked_kcharts';
}

function onStockSearch(filterData) {
    let page = 1;
    data.value.page = page;
    data.value.filterData = filterData;
    let stocks = getStocks();
    
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
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

function filterStocks(stocks) {
    let filterData = data.value.filterData;
    let theStocks = stocks.slice(0);

    if (filterData && filterData.stockInput) {
        for (let i = theStocks.length - 1; i >= 0; i--) {
            const stock = theStocks[i];
            if (!checkStockInput(stock.stockId, filterData.stockInput) && !checkStockInput(stock.stockName, filterData.stockInput)) {
                theStocks.splice(i, 1);
            }
        }
    }

    if (filterData && filterData.filterShiZhi && kChartLocalKey === 'tradeAllFullIdStocks') {
        for (let i = theStocks.length - 1; i >= 0; i--) {
            const stock = theStocks[i];
            if (!(stock.zongShiZhi >= filterData.filterShiZhi.minValue && stock.zongShiZhi < filterData.filterShiZhi.maxValue)) {
                theStocks.splice(i, 1);
            }
        }
    }
    return theStocks;
}

function onStocksUion() {
    let page = 1;
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

function onStocksRemovePotential() {
	let page = 1;
    data.value.page = 1;
    let stocks = getStocks();
    
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
}

function onFilterShiZhi(filterData) {
    let page = 1;
    data.value.page = page;
    data.value.filterData = filterData;
    let stocks = getStocks();
    
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    saveSettings();
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
