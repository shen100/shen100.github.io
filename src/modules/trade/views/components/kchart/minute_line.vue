<template>
    <div class="minute-line-container"
        @mouseenter="onMouseOver"
        @mouseleave="onMouseOut"
        @mousemove="onMouseMove">
        <div class="minute-line" :style="{top: data.lineY + 'px'}">
            <div class="minute-line-line" :style="{ transform: `rotate(${data.angle}deg)`, width: data.lineLength + 'px' }"></div>
            
        </div>
        <div v-if="data.isMouseOver"
					class="minute-line-full-line"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';

const props = defineProps([
    'stock',
    'activeKItemData',
    'kLineType', // minute, day, week, month, year
    'index',
    'prevDayClosePrice',
    'price',
    'highPriceInAll',
    'lowPriceInAll',
    'nextPrice',
    'minute',
    'volume',
    'maxHeight'
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move']);

let data = ref({
    angle: 0,
    lineLength: 0,
    lineY: 0
});

onMounted(async () => {
    let priceDt = props.highPriceInAll - props.lowPriceInAll;

    let lineWidth = 4;
    let x1 = props.index * lineWidth;
    let y1 = (props.highPriceInAll - props.price) / priceDt * props.maxHeight;

    let x2 = (props.index + 1) * lineWidth;;
    let y2 = (props.highPriceInAll - props.nextPrice) / priceDt * props.maxHeight;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const rad = Math.atan2(dy, dx); // 弧度
    const deg = 360 + rad * (180 / Math.PI); // 转换为度

    let lineLength = Math.round(Math.sqrt(dx * dx + dy * dy));

    data.value.x = x1;
    data.value.lineY = y1;
    if (props.index < 2) {
        if (props.stock && props.stock.stockName === '上证指数') {
            console.log('price, nextPrice, lowPriceInAll', props.price, props.nextPrice, props.lowPriceInAll);
            console.log('y1', y1);
        }
    }
    data.value.angle = deg;
    data.value.lineLength = lineLength;

    // lineY = Math.floor(lineY);
    // data.value.lineY = lineY;
    // data.value.lineX = (data.value.boxWidth - data.value.lineWidth) / 2;
});

function getMinuteData() {
    return {
        stockId: props.stock.stockId,
        kLineType: props.kLineType,
        time: props.minute,
        prevDayClosePrice: props.prevDayClosePrice,
        lowPrice: props.price,
        highPrice: props.price,
        openPrice: props.price,
        closePrice: props.price,
        volume: props.volume,
        tradeAction: [],
    }
}

function setMouseOver() {
    data.value.isMouseOver = true;
}

function onMouseOver() {
    data.value.isMouseOver = true;
    emit('mouse-over', getMinuteData());
}

function setMouseOut() {
    data.value.isMouseOver = false;
}

function onMouseOut() {
    data.value.isMouseOver = false;
    emit('mouse-out');
}

function onMouseMove(event) {
    if (event.target === event.currentTarget) {
        let y = Math.min(event.offsetY, props.maxHeight);
        let priceDt = props.highPriceInAll - props.lowPriceInAll;
        let price = props.highPriceInAll - (y / props.maxHeight * priceDt);
        price = price.toFixed(2);

        emit('mouse-move', { price, y });
    }
}

defineExpose({ getMinuteData, setMouseOver, setMouseOut });
</script>

<style scoped>
.minute-line-container {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 0;
    min-width: 4px;
}

.minute-line {
    position: absolute;
}

.minute-line-line {
    height: 1px;
    background-color: #6ac6f8;
    transform-origin: left top; 
}

.minute-line-full-line {
    position: absolute;
    border-left: 1px dashed #23848b;
    height: 100%;
    pointer-events: none;
    left: 0px;
}
</style>