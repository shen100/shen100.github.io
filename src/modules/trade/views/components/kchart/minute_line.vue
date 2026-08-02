<template>
    <div class="minute-line-container"
        @mouseenter="onMouseOver"
        @mouseleave="onMouseOut"
        @mousemove="onMouseMove">
        <div class="minute-line" :style="{top: data.lineY + 'px'}">
            <div class="minute-line-line" :style="{ transform: `rotate(${data.angle}deg)`, width: data.lineLength + 'px' }"></div>
        </div>
        <div v-if="data.isMouseOver" class="minute-line-full-line"></div>
        <div v-if="data.isMouseOver" :style="{top: (data.lineY - 2) + 'px'}" class="current-minute-point"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';

const props = defineProps([
    'stock',
    'kLineType', // minute, day, week, month, year
    'index',
    'prevDayClosePrice', // 上一个交易日的收盘价
    'price',
    'highPriceInAll',
    'lowPriceInAll',
    'nextPrice', // 下一个分时点的价格(下一分钟的价格)
    'time',
    'minute',
    'volume',
    'maxHeight'
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move']);

let data = ref({
    angle: 0,
    lineLength: 0,
    lineY: 0,
    lineWidth: 4
});

onMounted(async () => {
    let priceDt = props.highPriceInAll - props.lowPriceInAll;

    let x1 = props.index * data.value.lineWidth;
    let y1 = (props.highPriceInAll - props.price) / priceDt * props.maxHeight;

    let x2 = (props.index + 1) * data.value.lineWidth;
    let y2 = (props.highPriceInAll - props.nextPrice) / priceDt * props.maxHeight;

    // 已经是最后一个分时点了，没有nextPrice， 即没有下一个分时点，这时让 y2 = y1
    if (typeof props.nextPrice === 'undefined') {
        y2 = y1;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const rad = Math.atan2(dy, dx); // 弧度
    const deg = rad * (180 / Math.PI); // 转换为度

    let lineLength = Math.round(Math.sqrt(dx * dx + dy * dy));

    data.value.x = x1;
    data.value.lineY = y1;
    data.value.angle = deg;
    data.value.lineLength = lineLength;
});

function getMinuteData() {
    return {
        stockId: props.stock.stockId,
        kLineType: props.kLineType,
        time: props.time,
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
        // event.offsetY 鼠标相对于【当前绑定事件元素左上角】的垂直坐标（Y 值）
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
    left: 1px;
}

.minute-line-line {
    height: 1px;
    background-color: #6ac6f8;
    transform-origin: left top; 
}

.minute-line-full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
    left: 1px;
}

.current-minute-point {
    position: absolute;
    left: -1.5px;
    width: 6px;
    height: 6px;
    border: 1px #f35c5c solid;
    border-radius: 3px;
    background-color: #fff;
}
</style>