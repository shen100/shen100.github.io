<template>
    <div>
        <Card class="kcharts-type-card">
            <ButtonGroup>
                <Button @click="onRequest('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                <Button @click="onRequest('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                <Button @click="onRequest('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                <Button @click="onRequest('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
            </ButtonGroup>
        </Card>
        <div>
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }"
                v-for="(kChartData, i) in data.kCharts">
            </KChart>
        </div>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import KChart from './kchart.vue';

const itemRefs = ref([]);

const props = defineProps([
    'stockMap',
]);

let data = ref({
    type: 'day',
    kCharts: [],
})

onMounted(async () => {
    requestKData('day');
});

watch(
    () => props.stockMap,
    (newValue, oldValue) => {
        requestKData(data.value.type);
    }
)

function onRequest(type) {
    requestKData(type);
}

async function requestKData(type) {
    if (!props.stockMap) {
        return;
    }
    data.value.type = type;
    let timestamp = new Date().getTime() + 8 * 3600 * 1000;
    let startTimestamp;
	let start;
	let count;
	
    if (type === "day") {
		count = 365;
		startTimestamp = timestamp - count * 24 * 3600 * 1000;
    } else if (type === "week") {
		count = 300
		startTimestamp = timestamp - count * 7 * 24 * 3600 * 1000;
    } else if (type === "month") {
        count = 120;
		startTimestamp = timestamp - count / 12 * 365 * 24 * 3600 * 1000;
    } else if (type === "year") {
		count = 28 * 12;
		startTimestamp = timestamp - count / 12 * 365 * 24 * 3600 * 1000;
    }
    start = new Date(startTimestamp).toISOString().slice(0, 10);
    let end = new Date(timestamp).toISOString().slice(0, 10);

	if (data.value.kCharts.length <= 0) {
		for (let stockId in props.stockMap) {
            data.value.kCharts.push({
                stockId,
                stockFullId: props.stockMap[stockId].stockFullId,
                stockName: props.stockMap[stockId].stockName
            });
        }
    }

    await nextTick();

	itemRefs.value.forEach((el, index) => {
        if (el) {
            let stock = data.value.kCharts[index];
            if (data.value.type == "day") {
                el.requestDayK(stock, start, end, count);
            } else if (data.value.type == "week") {
                el.requestWeekK(stock, start, end, count);
            } else if (data.value.type == "month") {
                el.requestMonthK(stock, start, end, count);
            } else if (data.value.type == "year") {
                el.requestYearK(stock, start, end, count);
            }
        }
    });
}
</script>

<style scoped>
.kcharts-type-card {
    text-align: center;
    margin-bottom: 20px;
}
</style>
