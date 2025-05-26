<template>
    <div>
        <div>
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }"
                v-for="(kChartData, i) in data.kCharts"
                :stockId="kChartData.stockId"
                :stock="kChartData.stock"
                :stockName="kChartData.stockName" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findFromRight } from '../util/str';
import KChart from './components/kchart.vue'

const route = useRoute()
const router = useRouter()

const props = defineProps([
    'stockId',
    'stock',
    'stockName'
]);

const stockIdMap = {};
const itemRefs = ref([])

let data = ref({
    type: 'day',
    kCharts: [],
})

onMounted(async () => {

});

function requestKData(type) {
    let timestamp = new Date().getTime() + 8 * 3600 * 1000;
    let startTimestamp = timestamp - 200 * 24 * 3600 * 1000;
	let start = new Date(startTimestamp).toISOString().slice(0, 10);
    let end = new Date(timestamp).toISOString().slice(0, 10);
	let count = 200;
	
    data.value.type = type;
	if (type === "week") {
		startTimestamp = timestamp - 40 * 7 * 24 * 3600 * 1000;
		start = new Date(startTimestamp).toISOString().slice(0, 10);
		count = 40
    } else if (type === "month") {
		startTimestamp = timestamp - 10 * 365 * 24 * 3600 * 1000;
		start = new Date(startTimestamp).toISOString().slice(0, 10);
		count = 10 * 12
    } else if (type === "year") {
		startTimestamp = timestamp - 28 * 365 * 24 * 3600 * 1000;
		start = new Date(startTimestamp).toISOString().slice(0, 10);
		count = 28 * 12
    }

	if (data.value.kCharts.length <= 0) {
		for (stockId in stockIdMap) {
            data.value.kCharts.push({
                stockId,
                stock: stockIdMap[stockId],
                stockName: stockNameMap[stockId],
            });
        }
    }

	itemRefs.value.forEach((el, index) => {
        if (el) {
            console.log(`Element ${index}:`, el.textContent);
            if (data.value.type == "day") {
                el.requestDayK(start, end, count)
            } else if (data.value.type == "week") {
                el.requestWeekK(start, end, count)
            } else if (data.value.type == "month") {
                el.requestMonthK(start, end, count)
            } else if (data.value.type == "year") {
                el.requestYearK(start, end, count);
            }
        }
    });
}
</script>
