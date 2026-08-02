<template>
	<div class="kchart-volume">
		<div ref="kChartVolumeListRef" @scroll="onScroll" class="kchart-volume-list">
			<div v-for="(item, i) in props.volumeList" :key="i" class="kchart-volume-item-box"
				:style="{'min-width': volumeItemBoxMinWidth}"
                @mouseenter="onMouseOver(i)"
                @mouseleave="onMouseOut(i)"
                @mousemove="onMouseMove">
				<div class="kchart-volume-item" :style="{width: volumeItemMinWidth, height: getVolumeItemHeight(item), 'background-color': getVolumeItemColor(item)}"></div>
				<div v-if="props.activeKItemData && props.activeKItemData.time === item.time"
					:style="{ left: volumeCurrentLineLeft }"
					class="kchart-volume-full-line"></div>
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
	'kLineType',
    'maxVolume',
    'minVolume',
    'volumeList',
    'activeKItemData'
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'mouse-move', 'scroll']);

let kChartVolumeListRef = ref(null);

let data = ref({
    isMouseOver: false,
    yAxisVolumeLineY: 0,
	yAxisVolumeValue: 0
});

const volumeItemBoxMinWidth = computed(() => {
    if (props.kLineType === 'minute') {
		return '4px';
	} else {
		return '9px';
	}
});

const volumeItemMinWidth = computed(() => {
    if (props.kLineType === 'minute') {
		return '3px';
	} else {
		return '7px';
	}
});

const volumeCurrentLineLeft = computed(() => {
    if (props.kLineType === 'minute') {
		return '1px';
	} else {
		return '3px';
	}
});

onMounted(async () => {
});

function getVolumeItemHeight(item) {
	let volume = item.volume;
	return (volume / props.maxVolume) * 100 + '%'
}

function getVolumeItemColor(item) {
	let openPrice = item.openPrice;
	let closePrice = item.closePrice;
	if (closePrice < openPrice) {
        return '#02b33d';
    } else {
        return '#ee2500';
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
		// event.offsetY 鼠标相对于【当前绑定事件元素左上角】的垂直坐标（Y 值）
        let y = Math.min(event.offsetY, kChartVolumeHeight);
		// 画成交量的图时，底部是从 0 开始的， minVolume 没用到 
        let yAxisVolumeValue = ((1 - y / kChartVolumeHeight) * props.maxVolume);
        data.value.yAxisVolumeValue =  getVolumeStr(yAxisVolumeValue);
        data.value.yAxisVolumeLineY = y;
    }   
}

function getVolumeStr(volumeValue) {
	// 小于 1 万股
	if (volumeValue < 10000) {
		return parseInt(volumeValue) + '股';
	}
	// 大于 1亿 股
	if (volumeValue > (10000 * 10000)) {
		return (volumeValue / 10000 / 10000).toFixed(2) + '亿股'
	}
	return (volumeValue / 10000).toFixed(2) + '万股';
}

function onScroll(event) {
	emit('scroll', event.target.scrollLeft);
}

function setScrollLeft(scrollLeft) {
	kChartVolumeListRef.value.scrollLeft = scrollLeft;
}

defineExpose({ setScrollLeft });
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
}

.kchart-volume-item-box {
	height: 100px;
	position: relative;
}

.kchart-volume-item {
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