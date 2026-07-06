<template>
    <div class="kchart-volume">
		<div class="kchart-volume-list">
			<div v-for="(item, i) in props.myKList" :key="i" class="kchart-volume-item-box"
                @mouseenter="onMouseOver(i)"
                @mouseleave="onMouseOut(i)"
                @mousemove="onMouseMove">
				<div class="kchart-volume-item" :style="{height: getVolumeItemHeight(item), 'background-color': getVolumeItemColor(item)}"></div>
				<div v-if="props.activeCandleData && props.activeCandleData.date === item[0]" class="kchart-volume-full-line"></div>
			</div>
		</div>
        <div v-if="data.isMouseOver" class="y-axis-price-line" :style="{top: `${data.yAxisVolumeLineY}px`}">
			<div class="y-axis-price-line-price">{{ data.yAxisVolumeValue }}</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';

const props = defineProps([
    'maxVolume',
    'minVolume',
    'myKList',
    'activeCandleData'
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move']);

let data = ref({
    isMouseOver: false,
    yAxisVolumeLineY: 0,
	yAxisVolumeValue: 0
});


onMounted(async () => {
    
});

function getVolumeItemHeight(item) {
	let volume = item[5];
	return (volume / props.maxVolume) * 100 + '%'
}

function getVolumeItemColor(item) {
	let openPrice = item[1];
	let closePrice = item[2];
	if (closePrice > openPrice) {
        return '#ee2500';
    } else if (closePrice === openPrice) {
        return '#868686';
    } else {
        return '#02b33d';
    }
}

function onMouseOver(index) {
    data.value.isMouseOver = true;
    emit('mouse-over', index);
}

function onMouseOut(index) {
    data.value.isMouseOver = false;
    emit('mouse-out', index);
}

function onMouseMove(event) {
    if (event.target === event.currentTarget) {
        let kChartVolumeHeight = 100;
        let y = Math.min(event.offsetY, kChartVolumeHeight);
        let yAxisVolumeValue = ((1 - y / kChartVolumeHeight) * props.maxVolume);
        data.value.yAxisVolumeValue = (yAxisVolumeValue / 10000).toFixed(2) + '万手';
        data.value.yAxisVolumeLineY = y;
    }   
}
</script>

<style scoped>
.kchart-volume {
    position: relative;
	margin-top: 0px;
	margin-bottom: 20px;
	padding: 0px 20px 15px 20px;
	background-color: #fff;
}

.kchart-volume-list {
	border-top: 1px #eee dashed;
	display: flex;
	gap: 0px;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
	/* background-color: #eee; */
}

.kchart-volume-item-box {
	width: 9px;
	height: 100px;
	/* background-color: #eee; */
	position: relative;
}

.kchart-volume-item {
	width: 7px;
	background-color: #f00;
	position: absolute;
	left: 0;
	bottom: 0;
    pointer-events: none;
}

.kchart-volume-full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
	left: 3px;
}


.y-axis-price-line {
	position: absolute;
	z-index: 2;
	border-top: 1px dashed #cecece;
	left: 0;
	width: calc(100vw - 320px);
	pointer-events: none;
}

.y-axis-price-line-price {
	position: absolute;
	top: -10px;
	height: 20px;
	line-height: 20px;
	font-size: 12px;
	background-color: #e7e7e7;
    color: #222;
    width: 80px;
    text-align: center;
}
</style>