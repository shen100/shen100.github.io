<template>
    <div class="audit-trail-popup" :style="{border: data.popupVisible ? '1px solid #eee' : 'none', width: data.popupVisible ? '400px' : '75px'}">
        <div v-if="!data.popupVisible" @click="onSwitchVisible" class="audit-trail-popup-close">检查与回溯</div>
        <template v-else>
            <div @click="onSwitchVisible" class="audit-trail-popup-close">关闭</div>
            <div class="audit-trail-popup-title">检查与回溯</div>
            <!-- 是否主线: 是、否 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">是否主线</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.zhuXian }}</span>
            </div>
            <!-- 板块: 光模块、PCB、物理AI -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">板块</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.banKuai }}</span>
            </div>
            <!-- 买入逻辑: 高成长、困境反转、瞎买 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">买入逻辑</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.luoJi }}</span>
            </div>
            <!-- 催化剂: 未来有、未来没有、不清楚 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">催化剂</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.cuiHuaJi }}</span>
            </div>
            <!-- 走势: 上升、下降、区间震荡 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">走势</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.zouShi }}</span>
            </div>
            <!-- 买点: 突破买点、中继买点、反转买点、恐慌买点 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">买点</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.maiDian }}</span>
            </div>
            <!-- 买入仓位: 1%、10%、50% -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">仓位</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.cangWei }}</span>
            </div>
            <!-- 卖点: 自动止损、手动止损、加速 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">卖点</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.maiDian2 }}</span>
            </div>
            <!-- 总结 -->
            <div class="audit-trail-popup-item">
                <span class="audit-trail-popup-item-label">总结</span>
                <span class="audit-trail-popup-item-text">{{ props.trailData?.zongJie }}</span>
            </div>
        </template>
    </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';

const props = defineProps(['trailData']);

let data = ref({
    popupVisible: false
});

onMounted(async () => {

});

function onSwitchVisible() {
    data.value.popupVisible = !data.value.popupVisible;
}

</script>

<style scoped>
.audit-trail-popup {
	position: absolute;
    right: 0px;
    top: 55px;
    padding: 8px 10px;
    width: 400px;
    min-height: 20px;
    z-index: 2;
    background-color: #fff;
}

.audit-trail-popup-close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1px 5px;
    font-size: 12px;
    background-color: #272727a8;
    color: #fff;
    cursor: pointer;
    transition: all .3s cubic-bezier(.4,0,.2,1);
}

.audit-trail-popup-close:hover {
    background-color: #505050a3;
}

.audit-trail-popup-title {
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    color: rgb(81, 90, 110);
}

.audit-trail-popup-item {
    display: flex;
}

.audit-trail-popup-item-label {
    font-weight: 700;
    display: inline-block;
    vertical-align: top;
    margin-right: 5px;
    width: 60px;
    text-align: right;
    color: rgb(81, 90, 110);
}

.audit-trail-popup-item-text {
    display: inline-block;
    vertical-align: top;
    flex: 1;
}
</style>