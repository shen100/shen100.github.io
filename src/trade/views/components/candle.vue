<template>
    <div :id="'candle-container-' + date" class="candle-container" :style="{minWidth: `${data.boxWidth}px`}">
        <div class="candle-line" :style="candlelineStyle"></div>
        <div class="candle-box" :style="candleBoxStyle">
            <div :style="candleInnerBoxStyle"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';

const props = defineProps([
    'stockId',
    'candleType', // day, week, month, year
    'date',
    'lowPrice',
    'highPrice',
    'openPrice',
    'closePrice',
    'lowPriceInAll',
    'highPriceInAll',
    'candleMaxHeight',
])

let data = ref({
    boxWidth: 7,
    boxHeight: 0,
    boxBgColor: '#fff',
    boxX: 0,
    boxY: 0,
    lineColor: '#fff',
    lineX: 0,
    lineY: 0,
    lineWidth: 1,
    lineHeight: 0,
});

const candlelineStyle = computed(() => {
    let backgroundColor = '';
    if (props.closePrice > props.openPrice) {
        backgroundColor = '#ee2500';
    } else if (props.closePrice === props.openPrice) {
        backgroundColor = '#868686';
    } else {
        backgroundColor = '#02b33d';
    }
    return {
        width: `${data.value.lineWidth}px`,
        height: `${data.value.lineHeight}px`,
        backgroundColor,
        left: `${data.value.lineX}px`,
        top: `${data.value.lineY}px`
    }
});

const candleBoxStyle = computed(() => {
    return {
        width: `${data.value.boxWidth}px`,
        height: `${data.value.boxHeight}px`,
        backgroundColor: data.value.boxBgColor,
        top: `${data.value.boxY}px`
    }
});

const candleInnerBoxStyle = computed(() => {
    let border = '';
    let backgroundColor = '';
    if (props.closePrice > props.openPrice) {
        border = `1px solid #ee2500`;
        backgroundColor = '#fff';
    } else if (props.closePrice === props.openPrice) {
        border = `1px solid #868686`;
        backgroundColor = '#868686';
    } else {
        border = `1px solid #02b33d`;
        backgroundColor = '#02b33d';
    }
    return {
        width: `${data.value.boxWidth}px`,
        height: `${data.value.boxHeight}px`,
        backgroundColor,
        border,
    }
});

onMounted(async () => {
    let priceDt = props.highPriceInAll - props.lowPriceInAll;
    let lineRate = (props.highPrice - props.lowPrice) / priceDt;
    let boxRate = Math.abs((props.closePrice - props.openPrice) / priceDt);
    data.value.lineHeight = props.candleMaxHeight * lineRate; // 每根蜡烛的最高价和最低价连线的高度
    data.value.boxHeight = props.candleMaxHeight * boxRate; // 每根蜡烛的开盘价和收盘价的实体高度
	
    let lineY = (props.highPriceInAll - props.highPrice) / priceDt * props.candleMaxHeight;
    // 计算candle-box的Y坐标, 用 开盘价、收盘价的最大值同 highPriceInAll 比较
    let boxY = (props.highPriceInAll - Math.max(props.openPrice, props.closePrice)) / priceDt * props.candleMaxHeight;
    data.value.boxY = boxY;
    data.value.lineY = lineY;
    data.value.lineX = (data.value.boxWidth - data.value.lineWidth) / 2;
})
</script>

<style scoped>
.candle-container {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 2px;
}

.candle-box {
    position: absolute;
}

.candle-line {
    position: absolute;
}
</style>