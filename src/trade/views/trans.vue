<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatMoney } from '../util/money';
import { formatLocalYMD } from '../util/date';
import trans from '../model/trans'

const route = useRoute()
const router = useRouter()

let data = ref({
    trans: [],
    filteredTrans: [],
    startDate: new Date(new Date().getTime() - 365 * 24 * 3600 * 1000),
    endDate: new Date(),
    stockInput: ''
})

onMounted(async () => {
    data.value.trans = trans;
})

function onSearch() {
    data.value.filteredTrans = [];
    for (let i = 0; i < data.value.trans.length; i++) {
        let tranData = data.value.trans[i];
        console.log(typeof tranData.createdAt, tranData.createdAt, typeof data.value.startDate, data.value.startDate);
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
        if (data.value.stockInput) {
            if (tranData.stockName.indexOf(data.value.stockInput) < 0 && tranData.stockCode.indexOf(data.value.stockInput) < 0) {
                continue;
            }
        }
        data.value.filteredTrans.push(tranData);
    }
}

function displayActionLabel(tranData) {
    let arr = [ "maiRu", "maiChu", "guXiRu", "hlcysKouShui", "hongGuRu" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return tranData.actionLabel + " (" + tranData.stockName + ")"
    } else {
        return tranData.actionLabel
    }
}

function ifShowJingE(tranData) {
    let arr = [ "zhuanRu", "zhuanChu", "maiRu", "maiChu", "guXiRu", "pllxgbRu", "hlcysKouShui" ];
    if (arr.indexOf(tranData.action) >= 0) {
        return true;
    } else {
        return false;
    }
}

function ifShowStock(tranData) {
    let arr = [ "maiRu", "maiChu", "guXiRu", "hlcysKouShui", "hongGuRu" ];
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

function displayPriceUp(tranData) {
    if (!tranData.firstPrice) {
        return '';
    }
	// if (tranData.price > tranData.firstPrice) {
	// 	priceUp.label_settings = PROFIT_ITEM_RED
    // } else {
	// 	priceUp.label_settings = PROFIT_ITEM_GREEN
    // }
	
	var p = (tranData.price - tranData.firstPrice) / tranData.firstPrice * 100;
	return formatMoney(p, 2) + "%";
}

function displayRate(value1, value2) {
	return formatMoney((value1 / value2 * 10000), 2) + "‱"
}
</script>

<template>
    <div>
        <Card>
            <div class="search-box">
                <DatePicker type="date" :model-value="data.startDate" placeholder="开始日期" style="width: 200px;" />
                <DatePicker type="date" :model-value="data.endDate" placeholder="结束日期" style="width: 200px; margin-left: 15px" />
                <Input v-model="data.stockInput" placeholder="股票" style="width: 200px; margin-left: 15px" />
                <Button type="primary" @click="onSearch" icon="ios-search" style="margin-left: 15px">查询</Button>
            </div>

        </Card>
        <Card v-for="(tranData, i) in data.filteredTrans" :key="i" class="tran-data">
            <div>
                <div class="tran-item-row">
                    <div v-if="ifShowStock(tranData)" class="tran-label">证券名称</div>
                    <div class="tran-label2"> {{ tranData.stockName }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">业务名称</div>
                    <div class="tran-label2">{{ displayActionLabel(tranData) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">成交时间</div>
                    <div class="tran-label2">{{ tranData.createdAt }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">成交价格</div>
                    <div class="tran-label2">{{ tranData.price }}</div>
                    <div class="tran-label">{{ displayPriceUp(tranData) }}</div>
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
                    <div class="tran-label">{{ displayRate(tranData.yinHuaShui, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">佣金</div>
                    <div class="tran-label2">{{ formatMoney(tranData.yongJin, 2) }}</div>
                    <div class="tran-label">{{ displayRate(tranData.yongJin, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">经手费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.jingShouFei, 2) }}</div>
                    <div class="tran-label">{{ displayRate(tranData.jingShouFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">证管费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.zhengGuanFei, 2) }}</div>
                    <div class="tran-label">{{ displayRate(tranData.zhengGuanFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">结算费</div>
                    <div></div>
                </div>
                <div class="tran-item-row" v-if="isMaiRuOrMaiChu(tranData)">
                    <div class="tran-label">过户费</div>
                    <div class="tran-label2">{{ formatMoney(tranData.guoHuFei, 2) }}</div>
                    <div class="tran-label">{{ displayRate(tranData.guoHuFei, tranData.price * tranData.count) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">其他费用</div>
                    <div></div>
                </div>
            </div>
        </Card>
    </div>
</template>

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
    visibility: top;
}

.tran-label2 {
    width: 200px;
    font-size: 14px;
    text-align: left;
    padding-right: 10px;
    display: inline-block;
    visibility: top;
}
</style>