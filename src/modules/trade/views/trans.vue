<template>
    <div>
        <Card style="margin-bottom: 20px;">
            <div class="search-box">
                <DatePicker type="date" v-model="data.startDate" placeholder="开始日期" style="width: 200px;" />
                <DatePicker type="date" v-model="data.endDate" placeholder="结束日期" style="width: 200px; margin-left: 15px" />
                <Select v-model="data.actionType" style="width:200px; margin-left: 15px">
                    <Option v-for="item in data.actions" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
                <Input v-model="data.stockInput" placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">查询</Button>
            </div>
        </Card>
        <Card v-for="(tranData, i) in data.filteredTrans" :key="i" class="tran-data">
            <div>
                <div class="tran-item-row">
                    <div class="tran-label">成交时间</div>
                    <div class="tran-label2">{{ tranData.createdAt }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">业务名称</div>
                    <div class="tran-label2">{{ displayActionLabel(tranData) }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowStock(tranData)">
                    <div class="tran-label">证券名称</div>
                    <div class="tran-label2"> {{ tranData.stockName }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowStock(tranData)">
                    <div class="tran-label">证券代码</div>
                    <div class="tran-label2"> {{ tranData.stockId }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">成交价格</div>
                    <div class="tran-label2">{{ tranData.price }}</div>
                    <div class="tran-label" :style="{color: getPriceUpColor(tranData)}">{{ displayPriceUp(tranData) }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowCount(tranData)">
                    <div class="tran-label">成交数量</div>
                    <div class="tran-label2">{{ tranData.count }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowJingE(tranData)">
                    <div class="tran-label">金额</div>
                    <div class="tran-label2">{{ formatMoney(tranData.amount, 2) }}</div>
                </div>
            </div>
            <div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">印花税</div>
                    <div class="tran-label2">{{ formatMoney(tranData.yinHuaShui, 2) }}</div>
                    <div class="tran-label-rate">{{ displayRate(tranData.yinHuaShui, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">佣金</div>
                    <div class="tran-label2">{{ formatMoney(tranData.yongJin, 2) }}</div>
                    <div class="tran-label-rate">{{ displayRate(tranData.yongJin, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">经手费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.jingShouFei, 2) }}</div>
                    <div class="tran-label-rate">{{ displayRate(tranData.jingShouFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">证管费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.zhengGuanFei, 2) }}</div>
                    <div class="tran-label-rate">{{ displayRate(tranData.zhengGuanFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowJieSuanFei(tranData)">
                    <div class="tran-label">结算费</div>
                    <div class="tran-label2"></div>
                    <div class="tran-label-rate"></div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">过户费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.guoHuFei, 2) }}</div>
                    <div class="tran-label-rate">{{ displayRate(tranData.guoHuFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="ifShowOtherFeiYong(tranData)">
                    <div class="tran-label">其他费用</div>
                    <div class="tran-label2"></div>
                    <div class="tran-label-rate"></div>
                </div>
            </div>
        </Card>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatMoney } from '../util/money';
import { formatLocalYMD } from '../util/date';
import trans from '../model/trans'

const route = useRoute()
const router = useRouter()

let data = ref({
    trans: [],
    filteredTrans: [],
    startDate: new Date(new Date().getTime() - 5 * 365 * 24 * 3600 * 1000),
    endDate: new Date(),
    stockInput: '',
    actionType: '',
    actions: [
        { label: '全部', value: '' },
        { label: '银行转存', value: 'zhuanRu' },
        { label: '银行转取', value: 'zhuanChu' },
        { label: '证券买入', value: 'maiRu' },
        { label: '证券卖出', value: 'maiChu' },
        { label: '股息入账', value: 'guXiRu' },
        { label: '红股入账', value: 'hongGuRu' },
        { label: '利息归本', value: 'pllxgbRu' },
        { label: '股息红利税补缴', value: 'gxhlsBuJiao' }
    ]
})

onMounted(async () => {
    data.value.trans = trans;
})

function onSearch() {
    data.value.filteredTrans = [];

    for (let i = 0; i < data.value.trans.length; i++) {
        let tranData = data.value.trans[i];
        if (data.value.startDate) {
            if (tranData.createdAt < formatLocalYMD(data.value.startDate)) {
                continue;
            }
        }
        if (data.value.endDate) {
            if (tranData.createdAt > formatLocalYMD(data.value.endDate)) {
                continue;
            }
        }
        // if (!tranData.stockName || !tranData.stockId) {
        //     continue;
        // }

        if (data.value.stockInput) {
            if (tranData.stockName.indexOf(data.value.stockInput) < 0 && tranData.stockId.indexOf(data.value.stockInput) < 0) {
                continue;
            }
        }
        if (data.value.actionType) {
            if (tranData.action !== data.value.actionType) {
                continue;
            }
        }
        data.value.filteredTrans.push(tranData);
    }
}

function displayActionLabel(tranData) {
    let arr = [ "maiRu", "maiChu", "guXiRu", "hongGuRu", "gxhlsBuJiao" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return tranData.actionLabel + " (" + tranData.stockName + ")"
    } else {
        return tranData.actionLabel
    }
}

function ifShowJingE(tranData) {
    let arr = [ "zhuanRu", "zhuanChu", "maiRu", "maiChu", "guXiRu", "pllxgbRu", "gxhlsBuJiao" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return true;
    } else {
        return false;
    }
}

function ifShowStock(tranData) {
    let arr = [ "maiRu", "maiChu", "guXiRu", "hongGuRu", "gxhlsBuJiao" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return true;
    } else {
        return false;
    }
}

function isMaiRuOrMaiChu(tranData) {
    let arr = [ "maiRu", "maiChu" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return true;
    } else {
        return false;
    }
}

function ifShowCount(tranData) {
    let arr = [ "maiRu", "maiChu", "hongGuRu" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return true;
    } else {
        return false;
    }
}

function ifShowOtherFeiYong(tranData) {
    let arr = [ "zhuanRu", "gxhlsBuJiao" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return false;
    } else {
        return true;
    }
}

function ifShowJieSuanFei(tranData) {
    let arr = [ "zhuanRu", "gxhlsBuJiao" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return false;
    } else {
        return true;
    }
}

function displayPriceUp(tranData) {
    if (!tranData.referencePrice) {
        return '';
    }
	
	var p = (tranData.price - tranData.referencePrice) / tranData.referencePrice * 100;
	return formatMoney(p, 2) + "%";
}

function getPriceUpColor(tranData) {
    if (tranData.price > tranData.referencePrice) {
        return '#cc2d2d';
    } else if (tranData.price < tranData.referencePrice) {
        return '#39bb29';
    } else {
        return 'rgb(81, 90, 110)';
    }
}

function displayRate(value1, value2) {
	return formatMoney((value1 / value2 * 10000), 2) + "‱"
}
</script>

<style scoped>
.search-box {
    display: flex;
    flex-direction: row;
    padding: 20px 0;
}
.tran-data {
    padding: 15px 20px;
    background-color: #fff;
    margin-bottom: 20px;
}

.tran-item-row {
    padding: 2px 0;
}

.tran-label {
    width: 100px;
    font-size: 14px;
    text-align: right;
    padding-right: 10px;
    display: inline-block;
}

.tran-label2 {
    width: 200px;
    font-size: 14px;
    text-align: left;
    padding-right: 10px;
    display: inline-block;
}

.tran-label-rate {
    width: 100px;
    font-size: 14px;
    text-align: right;
    padding-right: 10px;
    display: inline-block;
    color: #a37f15;
}
</style>