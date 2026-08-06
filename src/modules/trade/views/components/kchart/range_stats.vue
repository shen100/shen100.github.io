<template>
    <div class="range-stats-popup">
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
</script>

<style scoped>
.range-stats-popup {
	position: absolute;
    right: 0px;
    top: 60px;
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