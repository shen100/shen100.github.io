<template>
    <div>
        <Card class="kcharts-type-card">
            <div style="display: flex;">
                <div class="date-label">开始日期</div>
                <DatePicker :model-value="data.start"
                    type="date" placeholder="Select date" style="width: 200px"
                    @on-change="(dateStr, dateType) => onStartDateChange(dateStr, dateType, data.type)"/>
                <div class="date-label date-label-end">结束日期</div>
                <DatePicker :model-value="data.end" 
                    type="date" placeholder="Select date" style="width: 200px" 
                    @on-change="(dateStr, dateType) => onEndDateChange(dateStr, dateType, data.type)" />
                <ButtonGroup class="button-group">
                    <Button @click="onRequest('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                    <Button @click="onRequest('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                    <Button @click="onRequest('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                    <Button @click="onRequest('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
                </ButtonGroup>
            </div>
        </Card>
        <div>
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }" v-for="(kChartData, i) in data.kCharts" />
        </div>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import KChart from './kchart.vue';
import { formatLocalYMD, parseLocalYMDString } from '../../util/date';

const itemRefs = ref([]);

const props = defineProps([
    'stocks',
]);

let data = ref({
    type: 'day',
    kCharts: [],
    start: formatLocalYMD(new Date(new Date().getTime() - 105 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()) // 2025-06-12
})

onMounted(async () => {
    onRequest('day');
});

watch(
    () => props.stocks,
    (newValue, oldValue) => {
        onRequest(data.value.type);
    }
)

function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type);
}

function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type);
}

async function onRequest(type) {
    if (!props.stocks) {
        return;
    }
    console.log("onRequest", type, data.value.start, data.value.end);
    console.log("onRequest", typeof type, typeof data.value.start, typeof data.value.end);

    data.value.type = type;
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

	if (data.value.kCharts.length <= 0) {
        props.stocks.forEach(stock => {
            data.value.kCharts.push({
                stockId: stock.stockId,
                stockFullId: stock.stockFullId,
                stockName: stock.stockName
            });
        });
    }

    await nextTick();

	itemRefs.value.forEach((el, index) => {
        if (el) {
            let stock = data.value.kCharts[index];
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
</style>
