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
                    <Button @click="onTypeChange('day')" :type="data.type === 'day' ? 'primary' : 'default'">天</Button>
                    <Button @click="onTypeChange('week')" :type="data.type === 'week' ? 'primary' : 'default'">周</Button>
                    <Button @click="onTypeChange('month')" :type="data.type === 'month' ? 'primary' : 'default'">月</Button>
                    <Button @click="onTypeChange('year')" :type="data.type === 'year' ? 'primary' : 'default'">年</Button>
                </ButtonGroup>
                <div class="space-all"></div>
            </div>
        </Card>
        <div v-if="data.kCharts && data.kCharts.length">
            <KChart :key="i" :ref="el => { if (el) itemRefs[i] = el }" v-for="(kChartData, i) in data.kCharts" 
                :addToTrackingEnabled="props.addToTrackingEnabled"
                @add-to-tracking="onAddToTracking" />
        </div>
        <Modal
            v-model="data.addModalVisible"
            title="跟踪K线">
            <div>确定要加入到跟踪K线?</div>
            <template #footer>
                <Button type="text" @click="onAddCancel">取消</Button>
                <Button type="primary" @click="onAddOK">确定</Button>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import KChart from './kchart.vue';
import { formatLocalYMD, parseLocalYMDString } from '../../../util/date';
import { replaceAllSpace } from '../../../util/str';

const emit = defineEmits(['start-change', 'end-change', 'type-change', 'stock-add']);

const itemRefs = ref([]);

const props = defineProps([
    'stocks',
    'type',
    'start',
    'end',
    'addToTrackingEnabled'
]);

let data = ref({
    type: 'day',
    kCharts: [],
    start: formatLocalYMD(new Date(new Date().getTime() - 180 * 24 * 3600 * 1000)),
    end: formatLocalYMD(new Date()), // 2025-06-12
    addModalVisible: false,
    stockId: '',
    stockFullId: '',
    stockName: '',
})

onMounted(async () => {
    data.value.type = props.type || data.value.type;
    data.value.start = props.start || data.value.start;
    data.value.end = props.end || data.value.end;
    onRequest(props.type);
});

watch(
    () => props.stocks,
    (newValue, oldValue) => {
        onRequest(data.value.type);
    }
)

watch(
    () => props.type,
    (newValue, oldValue) => {
        data.value.type = newValue;
    }
)

watch(
    () => props.start,
    (newValue, oldValue) => {
        data.value.start = newValue;
    }
)

watch(
    () => props.end,
    (newValue, oldValue) => {
        data.value.end = newValue;
    }
)

function onStartDateChange(dateStr, dateType, type) {
    data.value.start = dateStr;
    onRequest(type);
    emit('start-change', dateStr);
}

function onEndDateChange(dateStr, dateType, type) {
    data.value.end = dateStr;
    onRequest(type);
    emit('end-change', dateStr);
}

function onTypeChange(type) {
    data.value.type = type;
    onRequest(type);
    emit('type-change', type);
}

async function onRequest(type) {
    if (!(props.stocks && props.stocks.length > 0)) {
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
    data.value.kCharts = [];
    props.stocks.forEach(stock => {
        data.value.kCharts.push({
            stockId: stock.stockId,
            stockFullId: stock.stockFullId,
            stockName: stock.stockName
        });
    });

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

function onAddToTracking(stock) {
    data.value.stockId = stock.stockId;
    data.value.stockFullId = stock.stockFullId;
    data.value.stockName = stock.stockName;
    data.value.addModalVisible = true;
}

function onAddOK() {
    data.value.stockId = replaceAllSpace(data.value.stockId);
    data.value.stockFullId = replaceAllSpace(data.value.stockFullId);
    data.value.stockName = replaceAllSpace(data.value.stockName);
    data.value.addModalVisible = false;
    emit('stock-add', {
        stockId: data.value.stockId,
        stockFullId: data.value.stockFullId,
        stockName: data.value.stockName
    });
    data.value.stockId = '';
    data.value.stockFullId = '';
    data.value.stockName = '';
}

function onAddCancel() {
    data.value.addModalVisible = false;
    data.value.stockId = '';
    data.value.stockFullId = '';
    data.value.stockName = '';
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

.space-all {
    flex: 1;
}
</style>
