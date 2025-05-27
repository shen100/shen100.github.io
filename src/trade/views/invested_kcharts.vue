<template>
    <div>
        <KChartList :stockMap="data.investedStockMap"></KChartList>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import KChartList from './components/kchart_list.vue';
import store from '../model/store';

let data = ref({
    investedStockMap: null,
})

onMounted(async () => {
    data.value.investedStockMap = store.investedStockMap;
});
</script>

<style scoped>
</style>
