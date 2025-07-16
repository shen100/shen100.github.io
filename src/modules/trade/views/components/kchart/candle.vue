<template>
    <div :id="'candle-container-' + date"
        @mouseenter="onMouseOver"
        @mouseleave="onMouseOut"
        @mousemove="onMouseMove" class="candle-container" :style="{minWidth: `${data.boxWidth + 2}px`}">
        <div class="candle-line" :style="candlelineStyle"></div>
        <div class="candle-box" :style="candleBoxStyle">
            <div :style="candleInnerBoxStyle"></div>
        </div>
        <div v-if="data.isMouseOver" class="full-line" :style="{left: `${data.lineX}px`}"></div>
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
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move']);

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
    isMouseOver: false,
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
    data.value.lineHeight = Math.floor(props.candleMaxHeight * lineRate); // 每根蜡烛的最高价和最低价连线的高度
    data.value.boxHeight = Math.floor(props.candleMaxHeight * boxRate); // 每根蜡烛的开盘价和收盘价的实体高度
	
    let lineY = (props.highPriceInAll - props.highPrice) / priceDt * props.candleMaxHeight;
    lineY = Math.floor(lineY);
    // 计算candle-box的Y坐标, 用 开盘价、收盘价的最大值同 highPriceInAll 比较
    let boxY = (props.highPriceInAll - Math.max(props.openPrice, props.closePrice)) / priceDt * props.candleMaxHeight;
    boxY = Math.floor(boxY);
    data.value.boxY = boxY;
    data.value.lineY = lineY;
    data.value.lineX = (data.value.boxWidth - data.value.lineWidth) / 2;
});

function onMouseOver() {
    data.value.isMouseOver = true;
    emit('mouse-over', {
        stockId: props.stockId,
        candleType: props.candleType,
        date: props.date,
        lowPrice: props.lowPrice,
        highPrice: props.highPrice,
        openPrice: props.openPrice,
        closePrice: props.closePrice
    });
}

function onMouseOut() {
    data.value.isMouseOver = false;
    emit('mouse-out');
}

function onMouseMove(event) {
    if (event.target === event.currentTarget) {
        let y = Math.min(event.offsetY, props.candleMaxHeight);
        let priceDt = props.highPriceInAll - props.lowPriceInAll;
        let price = props.highPriceInAll - (y / props.candleMaxHeight * priceDt);
        price = price.toFixed(2);

        emit('mouse-move', { price, y });
    }
}
</script>

<style scoped>
.candle-container {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 0;
}

.candle-box {
    position: absolute;
    pointer-events: none;
}

.candle-line {
    position: absolute;
    pointer-events: none;
}

.full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
}
</style>