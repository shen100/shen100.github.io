<template>
    <div class="range-stats-popup" :style="{right: data.right + 'px', top: data.top + 'px'}" @mousedown="onMouseDown">
        <div class="range-stats-title">区间统计</div>
        <div>
            <span class="range-stats-label">开始日期</span>
            <span>{{ props.rangeStatsData?.startData.date }}</span>
        </div>
        <div>
            <span class="range-stats-label">结束日期</span>
            <span>{{ props.rangeStatsData?.endData.date }}</span>
        </div>
        <div>
            <span class="range-stats-label">起始价</span>
            <span>{{ props.rangeStatsData?.startData.closePrice }}</span>
        </div>
        <div>
            <span class="range-stats-label">最终价</span>
            <span>{{ props.rangeStatsData?.endData.closePrice }}</span>
        </div>
        <div>
            <span class="range-stats-label">涨跌幅1</span>
            <Tooltip content="涨跌幅1的最终价用的是结束日期那天的收盘价"
                :max-width="300" placement="top">
                <span>{{ rate }}</span>
                <Icon type="ios-alert" />
            </Tooltip>
        </div>
        <div>
            <span class="range-stats-label">涨跌幅2</span>
            <Tooltip content="涨跌幅2的最终价用的是结束日期那天的最低价"
                :max-width="300" placement="top">
                <span>{{ rate2 }}</span>
                <Icon type="ios-alert" />
            </Tooltip>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';

const props = defineProps([
    'rangeStatsData'
]);

let data = ref({
    dragging: false,
    clientX: 0,
    clientY: 0,
    oldRight: 0,
    oldTop: 55,
    right: 0,
    top: 55
});

const rate = computed(() => {
	let closePrice1 = props.rangeStatsData.startData.closePrice;
    let closePrice2 = props.rangeStatsData.endData.closePrice;
    let rate = (closePrice2 - closePrice1) / closePrice1;
	if (rate >= 0) {
        return '+' + (rate * 100).toFixed(2) + '%';
    }
    return (rate * 100).toFixed(2) + '%';
});

const rate2 = computed(() => {
	let closePrice1 = props.rangeStatsData.startData.closePrice;
    let lowPrice2 = props.rangeStatsData.endData.lowPrice;
    let rate = (lowPrice2 - closePrice1) / closePrice1;
	if (rate >= 0) {
        return '+' + (rate * 100).toFixed(2) + '%';
    }
    return (rate * 100).toFixed(2) + '%';
});

function onMouseDown(event) {
    data.value.dragging = true;
    data.value.clientX = event.clientX;
    data.value.clientY = event.clientY;
    data.value.oldRight = data.value.right;
    data.value.oldTop = data.value.top;
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event) => {
    if (!data.value.dragging) {
        return;
    }
    data.value.right = data.value.oldRight - (event.clientX - data.value.clientX);
    data.value.top = data.value.oldTop + (event.clientY - data.value.clientY);
    data.value.top = Math.max(data.value.top, 55);
}

const onMouseUp = () => {
    if (!data.value.dragging) {
        return;
    }
    data.value.dragging = false;
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.range-stats-popup {
	position: absolute;
    right: 0px;
    top: 55px;
    padding: 5px 10px 10px 10px;
    width: 200px;
    min-height: 20px;
    z-index: 3;
    background-color: #fff;
    border: 1px #e2e2e2 solid;
}

.range-stats-title {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 30px;
}

.range-stats-label {
    padding-right: 10px;
    display: inline-block;
    vertical-align: top;
    text-align: right;
    width: 80px;
}
</style>