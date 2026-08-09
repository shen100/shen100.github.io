<template>
    <div class="strength-lines-box">
        <div class="y-zero-axis" :style="{top: `${data.yZeroAxis}px`}"></div>
		<div class="y-zero-axis-txt" :style="{top: `${data.yZeroAxis - 8}px`}">{{ data.yZeroAxisText }}</div>
        <div v-if="currentItem" class="current-item-strength"
            :style="{'background-color': currentItem.strength >= 0 ? '#ee2500': '#02b33d'}">{{ (100 * currentItem.strength).toFixed(2) }}%</div>
        <div ref="refStrengthListRef" @scroll="onScroll" class="strength-lines-container">
            <div v-for="(item, i) in data.strengthList" :key="i" class="strength-line-container"
                @mouseenter="onMouseOver(item, i)"
                @mouseleave="onMouseOut(item, i)"
                @mousemove="(event) => onMouseMove(event, item)">
                <div class="strength-line" :style="{top: item.y + 'px'}">
                    <div class="strength-line-line" :style="{ transform: `rotate(${item.angle}deg)`, width: item.lineLength + 'px' }"></div>
                </div>
                <div v-if="props.activeKItemData && props.activeKItemData.time === item.date" class="strength-line-full-line"></div>
                <div v-if="props.activeKItemData && props.activeKItemData.time === item.date" :style="{top: (item.y - 2) + 'px'}" class="current-strength-point"></div>
            </div>
        </div>
        <div v-if="data.isMouseOver" class="y-axis-strength-line" :style="{top: `${data.yAxisStrengthLineY}px`}">
			<div class="y-axis-strength-line-strength">{{ data.yAxisStrengthValue }}</div>
		</div>
    </div>
    <div class="strength-lines-box-gap"></div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';

const props = defineProps([
    'list',
    'activeKItemData'
]);

const emit = defineEmits(['mouse-over', 'mouse-out', 'scroll']);

let refStrengthListRef = ref(null);

let data = ref({
    lineWidth: 9,
    strengthHeight: 100,
    highStrengthInAll: 0,
    lowStrengthInAll: 0,
    strengthList: [],
    yZeroAxis: 0,
    yZeroAxisText: '0.00',
    yAxisStrengthLineY: 0,
    yAxisStrengthValue: 0,
    isMouseOver: false
});

watch(
    () => props.list,
    (newValue, oldValue) => {
        // console.log('hi~~~~', newValue);
        const strengthList = [];
        data.value.highStrengthInAll = -1;
        data.value.lowStrengthInAll = 1000000000;
        for (let i = 0; i < newValue.length; i++) {
            if (newValue[i].strength > data.value.highStrengthInAll) {
                data.value.highStrengthInAll = newValue[i].strength;
            }
            if (newValue[i].strength < data.value.lowStrengthInAll) {
                data.value.lowStrengthInAll = newValue[i].strength;
            }
            newValue[i].isMouseOver = false;
            strengthList.push(newValue[i]);
        }

        for (let i = 0; i < strengthList.length; i++) {
            updateXY(i, strengthList[i]);
        }
        data.value.strengthList = strengthList;
    },
    { immediate: true }
);

const currentItem = computed(() => {
	for (let i = 0; i < data.value.strengthList.length; i++) {
        const item = data.value.strengthList[i];
        if (props.activeKItemData && props.activeKItemData.time === item.date) {
            return item;
        }
    }
    return null;
})

function updateXY(index, item) {
    let highStrengthInAll = data.value.highStrengthInAll;
    let lowStrengthInAll = data.value.lowStrengthInAll;
    let strengthDt = highStrengthInAll - lowStrengthInAll;

    let x1 = index * data.value.lineWidth;
    let y1 = (highStrengthInAll - item.strength) / strengthDt * data.value.strengthHeight;

    data.value.yZeroAxis = (highStrengthInAll - 0) / strengthDt * data.value.strengthHeight;

    let x2 = (index + 1) * data.value.lineWidth;
    let y2 = (highStrengthInAll - item.nextStrength) / strengthDt * data.value.strengthHeight;

    // 已经是最后一个了，没有 nextStrength， 这时让 y2 = y1
    if (typeof item.nextStrength === 'undefined') {
        y2 = y1;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const rad = Math.atan2(dy, dx); // 弧度
    const deg = rad * (180 / Math.PI); // 转换为度

    let lineLength = Math.round(Math.sqrt(dx * dx + dy * dy));

    item.x = x1;
    item.y = y1;
    item.angle = deg;
    item.lineLength = lineLength;
}

onMounted(async () => {
});

function onMouseOver(item, index) {
    item.isMouseOver = true;
    data.value.isMouseOver = true;
    emit('mouse-over', index);
}

function onMouseOut(item, index) {
    item.isMouseOver = false;
    data.value.isMouseOver = false;
    emit('mouse-out', index);
}

function onMouseMove(event) {
    if (event.target === event.currentTarget) {
        // event.offsetY 鼠标相对于【当前绑定事件元素左上角】的垂直坐标（Y 值）
        let y = Math.min(event.offsetY, data.value.strengthHeight);
        let dt = data.value.highStrengthInAll - data.value.lowStrengthInAll;
        let strength = data.value.highStrengthInAll - (y / data.value.strengthHeight * dt);
        // price = price.toFixed(2);

        data.value.yAxisStrengthValue = (100 * strength).toFixed(2) + '%';
        data.value.yAxisStrengthLineY = y;
    }
}
function onScroll() {
    emit('scroll', event.target.scrollLeft);
}

function setScrollLeft(scrollLeft) {
	refStrengthListRef.value.scrollLeft = scrollLeft;
}

defineExpose({ setScrollLeft });
</script>

<style scoped>
.strength-lines-box {
    border-top: 1px #eee dashed;
    position: relative;
    margin-top: 0px;
    padding: 0px 20px;
    background-color: #fff;
}

.strength-lines-container {
	display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: calc(100vw - 320px);
    height: 120px;
}

.strength-line-container {
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin-right: 0;
    min-width: 9px;
    height: 100px;
}

.strength-line {
    position: absolute;
    left: 3px;
}

.strength-line-line {
    height: 1px;
    background-color: #6ac6f8;
    transform-origin: left top; 
}

.strength-line-full-line {
    position: absolute;
    border-left: 1px dashed #cecece;
    height: 100%;
    pointer-events: none;
    left: 3px;
}

.current-strength-point {
    position: absolute;
    left: 0.5px;
    width: 6px;
    height: 6px;
    border: 1px #f35c5c solid;
    border-radius: 3px;
    background-color: #fff;
}

.y-zero-axis {
	height: 1px;
	background-color: #fda9a9;
	position: absolute;
	width: calc(100vw - 320px);
}

.y-zero-axis-txt {
	position: absolute;
    padding: 2px 5px;
    font-size: 12px;
    line-height: 12px;
}

.strength-lines-box-gap {
    height: 15px;
    background-color: #fff;
}


.y-axis-strength-line {
	position: absolute;
	z-index: 2;
	border-top: 1px dashed #cecece;
	left: 0;
	width: calc(100vw - 320px);
	pointer-events: none;
}

.y-axis-strength-line-strength {
	position: absolute;
	top: -11px;
	height: 22px;
	line-height: 22px;
	font-size: 12px;
	background-color: #e7e7e7;
    color: #222;
    padding: 0 6px;
    text-align: center;
}

.current-item-strength {
    position: absolute;
    left: 0;
    top: 0;
    color: #fff;
    padding: 0 6px;
    height: 22px;
	line-height: 22px;
    font-size: 12px;
}
</style>