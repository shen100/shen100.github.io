<template>
    <div>
        <KChartList :type="data.type" 
            :start="data.start"
            :end="data.end"
            :page="data.page"
            :stocks="data.curStocks"
            :addToTrackingEnabled="data.addToTrackingEnabled"
            @start-change="onStartChange"
            @end-change="onEndChange"
            @type-change="onTypeChange"
            @stock-add="onStockAdd"></KChartList>
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
import store from '../model/store';
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
    addToTrackingEnabled: false
})

onMounted(async () => {
    init();
});

function init() {
    console.log('init', route.name)
    let stocks;
    data.value.addToTrackingEnabled = false;
    if (route.name === 'allKCharts') {
        data.value.addToTrackingEnabled = true;
        data.value.type = store.settings.allStockKChart.type;
        data.value.start = store.settings.allStockKChart.start;
        data.value.end = store.settings.allStockKChart.end;
        data.value.page = store.settings.allStockKChart.page;
        stocks = store.allStocks;
    } else if (route.name === 'investedKCharts') {
        data.value.type = store.settings.investedStockKChart.type;
        data.value.start = store.settings.investedStockKChart.start;
        data.value.end = store.settings.investedStockKChart.end;
        data.value.page = store.settings.investedStockKChart.page;
        stocks = store.getInvestedStocks();
    } else if (route.name === 'trackedKCharts') {
        data.value.type = store.settings.trackedStockKChart.type;
        data.value.start = store.settings.trackedStockKChart.start;
        data.value.end = store.settings.trackedStockKChart.end;
        data.value.page = store.settings.trackedStockKChart.page;
        stocks = store.getTrackedStocks();
    } else if (route.name === 'selectedKCharts') {
        data.value.addToTrackingEnabled = true;
        data.value.type = store.settings.selectedStockKChart.type;
        data.value.start = store.settings.selectedStockKChart.start;
        data.value.end = store.settings.selectedStockKChart.end;
        data.value.page = store.settings.selectedStockKChart.page;
        stocks = store.getSelectedStocks();
    } else if (route.name === 'etfKCharts') {
        data.value.addToTrackingEnabled = true;
        data.value.type = store.settings.etfStockKChart.type;
        data.value.start = store.settings.etfStockKChart.start;
        data.value.end = store.settings.etfStockKChart.end;
        data.value.page = store.settings.etfStockKChart.page;
        stocks = store.getEtfStocks();
    }
    data.value.total = stocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
}

function onStartChange(dateStr) {
    if (route.name === 'allKCharts') {
        store.settings.allStockKChart.start = dateStr;
    } else if (route.name === 'investedKCharts') {
        store.settings.investedStockKChart.start = dateStr;
    } else if (route.name === 'trackedKCharts') {
        store.settings.trackedStockKChart.start = dateStr;
    } else if (route.name === 'selectedKCharts') {
        store.settings.selectedStockKChart.start = dateStr;
    } else if (route.name === 'etfKCharts') {
        store.settings.etfStockKChart.start = dateStr;
    }
    store.setSettings(store.settings);
}

function onEndChange(dateStr) {
    if (route.name === 'allKCharts') {
        store.settings.allStockKChart.end = dateStr;
    } else if (route.name === 'investedKCharts') {
        store.settings.investedStockKChart.end = dateStr;
    } else if (route.name === 'trackedKCharts') {
        store.settings.trackedStockKChart.end = dateStr;
    } else if (route.name === 'selectedKCharts') {
        store.settings.selectedStockKChart.end = dateStr;
    } else if (route.name === 'etfKCharts') {
        store.settings.etfStockKChart.end = dateStr;
    }
    store.setSettings(store.settings);
}

function onPageChange(page) {
    let stocks;
    if (route.name === 'allKCharts') {
        store.settings.allStockKChart.page = page;
        stocks = store.allStocks;
    } else if (route.name === 'investedKCharts') {
        store.settings.investedStockKChart.page = page;
        stocks = store.getInvestedStocks();
    } else if (route.name === 'trackedKCharts') {
        store.settings.trackedStockKChart.page = page;
        stocks = store.getTrackedStocks();
    } else if (route.name === 'selectedKCharts') {
        store.settings.selectedStockKChart.page = page;
        stocks = store.getSelectedStocks();
    } else if (route.name === 'etfKCharts') {
        store.settings.etfStockKChart.page = page;
        stocks = store.getEtfStocks();
    }
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = stocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
    store.setSettings(store.settings);
}

function onTypeChange(type) {
    if (route.name === 'allKCharts') {
        store.settings.allStockKChart.type = type;
    } else if (route.name === 'investedKCharts') {
        store.settings.investedStockKChart.type = type;
    } else if (route.name === 'trackedKCharts') {
        store.settings.trackedStockKChart.type = type;
    } else if (route.name === 'selectedKCharts') {
        store.settings.selectedStockKChart.type = type;
    } else if (route.name === 'etfKCharts') {
        store.settings.etfStockKChart.type = type;
    }
    store.setSettings(store.settings);
}

function onStockAdd(stock) {
    store.addTrackedStock(stock);
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
