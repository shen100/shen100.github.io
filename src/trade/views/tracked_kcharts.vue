<template>
    <div>
        <KChartList type="day" :stocks="data.trackedStocks"></KChartList>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import KChartList from './components/kchart_list.vue';
import store from '../model/store';

let data = ref({
    trackedStocks: null,
})

onMounted(async () => {
    data.value.trackedStocks = store.trackedStocks;
});
</script>

<style scoped>
</style>
