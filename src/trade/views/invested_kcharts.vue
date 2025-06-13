<template>
    <div>
        <KChartList :type="data.type" 
            :start="data.start"
            :end="data.end"
            :page="data.page"
            :stocks="data.curStocks"
            @start-change="onStartChange"
            @end-change="onEndChange"
            @type-change="onTypeChange"
            @stock-add="onStockAdd"></KChartList>
        <div class="page-container">
            <Page @on-change="onPageChange" :modelValue="data.page" :page-size="data.pageSize" :total="data.total" simple />
        </div>
        <div class="space"></div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import KChartList from './components/kchart_list.vue';
import store from '../model/store';
import { formatLocalYMD } from '../util/date';

let data = ref({
    type: 'day',
    start: formatLocalYMD(new Date(new Date().getTime() - 100 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    curStocks: [],
    total: 0,
    pageSize: 20,
    page: 1,
})

onMounted(async () => {
    data.value.type = store.settings.investedStockKChart.type;
    data.value.start = store.settings.investedStockKChart.start;
    data.value.end = store.settings.investedStockKChart.end;
    data.value.page = store.settings.investedStockKChart.page;
    data.value.total = store.investedStocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.curStocks = store.investedStocks.slice(start, start + data.value.pageSize);
});

function onStartChange(dateStr) {
    store.settings.investedStockKChart.start = dateStr;
    store.setSettings(store.settings);
}

function onEndChange(dateStr) {
    store.settings.investedStockKChart.end = dateStr;
    store.setSettings(store.settings);
}

function onPageChange(page) {
    store.settings.investedStockKChart.page = page;
    store.setSettings(store.settings);
    let start = (page - 1) * data.value.pageSize;
    data.value.curStocks = store.investedStocks.slice(start, start + data.value.pageSize);
    window.scrollTo(0, 0);
}

function onTypeChange(type) {
    store.settings.investedStockKChart.type = type;
    store.setSettings(store.settings);
}

function onStockAdd(stock) {
    store.addInvestedStock(stock);
    data.value.total = store.investedStocks.length;
    let start = (data.value.page - 1) * data.value.pageSize;
    data.value.curStocks = store.investedStocks.slice(start, start + data.value.pageSize);
}
</script>

<style scoped>
.page-container {
    margin-top: 20px;
    text-align: center;
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
