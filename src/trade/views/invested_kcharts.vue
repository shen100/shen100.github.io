<template>
    <div>
        <KChartList type="day" :stocks="data.investedStocks"></KChartList>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import KChartList from './components/kchart_list.vue';
import store from '../model/store';

let data = ref({
    investedStocks: null,
})

onMounted(async () => {
    data.value.investedStocks = store.investedStocks;
});
</script>

<style scoped>
</style>
