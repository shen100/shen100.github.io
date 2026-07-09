<template>
    <div class="audit-trail-popup" :style="{width: data.popupVisible ? '400px' : '92px', 'z-index': data.popupVisible ? 4 : 3}">
        <div :style="{border: data.popupVisible ? '1px solid #eee' : 'none', padding: data.popupVisible ? '10px' : '0'}">
            <div v-if="!data.popupVisible" @click="onSwitchVisibleTrue" class="audit-trail-popup-close-btn">检查与回溯</div>
            <template v-if="data.popupVisible && !data.isEdit">
                <div class="audit-trail-popup-close">
                    <div class="audit-trail-popup-close-inner">
                        <div @click="onEdit" class="audit-trail-popup-close-btn" style="padding-right: 3px;">编辑</div>
                        <div @click="onSwitchVisibleFalse" class="audit-trail-popup-close-btn" style="padding-left: 3px;">关闭</div>
                    </div>
                </div>
            </template>
            <template v-if="data.popupVisible && !data.isEdit">
                <div class="audit-trail-popup-title">检查与回溯</div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">是否主线</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.zhuXian }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">板块概念</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.banKuai }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">买入逻辑</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.luoJi }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">催化剂</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.cuiHuaJi }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">走势</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.zouShi }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">买点</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.maiDian }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">仓位</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.cangWei }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">止损</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.zhiSun }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">卖点</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.maiDian2 }}</span>
                </div>
                <div class="audit-trail-popup-item">
                    <span class="audit-trail-popup-item-label">总结</span>
                    <span class="audit-trail-popup-item-text">{{ props.trailData?.zongJie }}</span>
                </div>
            </template>
            <div v-if="data.popupVisible && data.isEdit">
                <Form :label-width="80">
                    <FormItem label="是否主线">
                        <Select v-model="data.formItem.zhuXian">
                            <Option v-for="item in data.zhuXianList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="板块">
                        <Input v-model="data.formItem.banKuai" placeholder=""></Input>
                    </FormItem>
                    <FormItem label="买入逻辑">
                        <Select v-model="data.formItem.luoJi">
                            <Option v-for="item in data.luoJiList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="催化剂">
                        <Select v-model="data.formItem.cuiHuaJi">
                            <Option v-for="item in data.cuiHuaJiList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="走势">
                        <Select v-model="data.formItem.zouShi">
                            <Option v-for="item in data.zouShiList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="买点">
                        <Select v-model="data.formItem.maiDian">
                            <Option v-for="item in data.maiDianList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="仓位">
                        <Input v-model="data.formItem.cangWei" placeholder=""></Input>
                    </FormItem>
                    <FormItem label="止损">
                        <Input v-model="data.formItem.zhiSun" placeholder=""></Input>
                    </FormItem>
                    <FormItem label="卖点">
                        <Select v-model="data.formItem.maiDian2">
                            <Option v-for="item in data.maiDian2List" :value="item.value" :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="总结">
                        <Input v-model="data.formItem.zongJie" type="textarea" :rows="4" placeholder=""></Input>
                    </FormItem>
                    <FormItem>
                        <Button @click="onEditOK" type="primary">确定</Button>
                        <Button @click="onSwitchVisibleFalse" style="margin-left: 8px">取消</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { trim } from '../../../util/str';

const emit = defineEmits(['audit-trail-change']);

const props = defineProps(['trailData']);

let data = ref({
    popupVisible: false,
    isEdit: false,
    formItem: {
        zhuXian: '', // 是否主线: 是、否
        banKuai: '', // 板块: 光模块、PCB、物理AI
        luoJi: '', // 买入逻辑: 高成长、困境反转、瞎买
        cuiHuaJi: '', // 催化剂: 现在有、未来有、不清楚
        zouShi: '', // 走势: 上升、下降、区间震荡
        maiDian: '', // 买点: 突破、中继、反转、恐慌
        cangWei: '', // 买入仓位: 1%、10%、50%
        zhiSun: '', // 止损: 1%、5%、10%
        maiDian2: '', // 卖点: 自动止损、手动止损、加速
        zongJie: '' // 总结
    },
    zhuXianList: [
        { label: '是', value: '是' },
        { label: '否', value: '否' }
    ],
    luoJiList: [
        { label: '高成长', value: '高成长' },
        { label: '困境反转', value: '困境反转' },
        { label: '瞎买', value: '瞎买' }
    ],
    cuiHuaJiList: [
        { label: '现在有', value: '现在有' },
        { label: '未来有', value: '未来有' },
        { label: '不清楚', value: '不清楚' }
    ],
    zouShiList: [
        { label: '上升', value: '上升' },
        { label: '下降', value: '下降' },
        { label: '区间震荡', value: '区间震荡' }
    ],
    maiDianList: [
        { label: '突破', value: '突破' },
        { label: '中继', value: '中继' },
        { label: '反转', value: '反转' },
        { label: '恐慌', value: '恐慌' }
    ],
    maiDian2List: [
        { label: '自动止损', value: '自动止损' },
        { label: '手动止损', value: '手动止损' },
        { label: '加速', value: '加速' }
    ],
});

onMounted(async () => {

});

function onSwitchVisibleTrue() {
    data.value.popupVisible = true;
    data.value.isEdit = false;
}

function onSwitchVisibleFalse() {
    data.value.popupVisible = false;
    data.value.isEdit = false;
}

function onEdit() {
    data.value.isEdit = true;
    data.value.formItem.zhuXian = props.trailData.zhuXian || '';
    data.value.formItem.banKuai = trim(props.trailData.banKuai || '');
    data.value.formItem.luoJi = props.trailData.luoJi || '';
    data.value.formItem.cuiHuaJi = props.trailData.cuiHuaJi || '';
    data.value.formItem.zouShi = props.trailData.zouShi || '';
    data.value.formItem.maiDian = props.trailData.maiDian || '';
    data.value.formItem.cangWei = trim(props.trailData.cangWei || '');
    data.value.formItem.zhiSun = trim(props.trailData.zhiSun || '');
    data.value.formItem.maiDian2 = props.trailData.maiDian2 || '';
    data.value.formItem.zongJie = trim(props.trailData.zongJie || '');
}

function onEditOK() {
    console.log('~~~~');
    emit('audit-trail-change', data.value.formItem);
}
</script>

<style scoped>
.audit-trail-popup {
	position: absolute;
    right: 0px;
    top: 60px;
    padding: 0;
    padding-right: 20px;
    width: 400px;
    min-height: 20px;
    z-index: 3;
    background-color: #fff;
}

.audit-trail-popup-inner {
    padding: 10px 15px;
}

.audit-trail-popup-close {
    position: absolute;
    top: 0;
    right: 20px;
}

.audit-trail-popup-close-inner {
    display: flex;
}

.audit-trail-popup-close-btn {
    padding: 1px 6px;
    font-size: 12px;
    background-color: #272727a8;
    color: #fff;
    cursor: pointer;
    transition: all .3s cubic-bezier(.4,0,.2,1);
}

.audit-trail-popup-close-btn:hover {
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

.ivu-form-item {
    margin-bottom: 10px;
}
</style>