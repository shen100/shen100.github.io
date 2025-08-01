<template>
    <div>
        <Card class="tran-data">
            <div>
                <div class="tran-item-row">
                    <div class="tran-label">总盈亏</div>
                    <div class="tran-label2">{{ formatMoney(data.shouYi, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">银行转存</div>
                    <div class="tran-label2">{{ formatMoney(data.zhuanRu, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">银行转取</div>
                    <div class="tran-label2">{{ formatMoney(data.zhuanChu, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">资金余额</div>
                    <div class="tran-label2">{{ formatMoney(data.shengYu, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">持仓市值</div>
                    <div class="tran-label2">{{ formatMoney(data.shiZhi, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">历史持股(支)</div>
                    <div class="tran-label2">{{ data.chiGu }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">股息红利税补缴</div>
                    <div class="tran-label2">{{ formatMoney(data.gxhlsBuJiao, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">印花税</div>
                    <div class="tran-label2">{{ formatMoney(data.yinHuaShui, 2) }}</div>
                    <div class="tran-label-rate">{{ formatMoney(data.yinHuaShuiRate * 10000, 2) }}‱</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">佣金</div>
                    <div class="tran-label2">{{ formatMoney(data.yongJin, 2) }}</div>
                    <div class="tran-label-rate">{{ formatMoney(data.yongJinRate * 10000, 2) }}‱</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">经手费</div>
                    <div class="tran-label2">{{ formatMoney(data.jingShouFei, 2) }}</div>
                    <div class="tran-label-rate">{{ formatMoney(data.jingShouFeiRate * 10000, 2) }}‱</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">证管费</div>
                    <div class="tran-label2">{{ formatMoney(data.zhengGuanFei, 2) }}</div>
                    <div class="tran-label-rate">{{ formatMoney(data.zhengGuanFeiRate * 10000, 2) }}‱</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">结算费</div>
                    <div class="tran-label2"></div>
                    <div class="tran-label-rate"></div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">过户费</div>
                    <div class="tran-label2">{{ formatMoney(data.guoHuFei, 2) }}</div>
                    <div class="tran-label-rate">{{ formatMoney(data.yinHuaShuiRate * 10000, 2) }}‱</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">其他费用</div>
                    <div class="tran-label2"></div>
                    <div class="tran-label-rate"></div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">利息归本</div>
                    <div class="tran-label2">{{ formatMoney(data.pllxgbRu, 2) }}</div>
                </div>
                <div class="tran-item-row">
                    <div class="tran-label">股息入账</div>
                    <div class="tran-label2">{{ formatMoney(data.guXi, 2) }}</div>
                </div>
            </div>
        </Card>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatMoney } from '../util/money';
import statistics from '../model/statistics'

const route = useRoute()
const router = useRouter()

let data = ref({
    shouYi: 0.0,
    zhuanRu: 0.0,
    zhuanChu: 0.0,
    shengYu: 0.0,
    shiZhi: 0.0,
    yongJin: 0.0,
    yongJinRate: 0.0,
    yinHuaShui: 0.0,
    yinHuaShuiRate: 0.0,
    guoHuFei:0.0,
    guoHuFeiRate: 0.0,
    jingShouFei: 0.0,
    jingShouFeiRate: 0.0,
    zhengGuanFei: 0.0,
    zhengGuanFeiRate: 0.0,
    gxhlsBuJiao: 0.0,
    guXi: 0.0,
    pllxgbRu: 0.0,
})

onMounted(async () => {
    statistics.init(() => {
        let statisticsData = statistics.getStatisticsData();
        data.value.shouYi = statisticsData.shouYi;
        data.value.zhuanRu = statisticsData.zhuanRu;
        data.value.zhuanChu = statisticsData.zhuanChu;
        data.value.shengYu = statisticsData.shengYu;
        data.value.shiZhi = statisticsData.shiZhi;
        data.value.chiGu = statisticsData.chiGu;
        data.value.yongJin = statisticsData.yongJin;
        data.value.yongJinRate = statisticsData.yongJinRate;
        data.value.yinHuaShui = statisticsData.yinHuaShui;
        data.value.yinHuaShuiRate = statisticsData.yinHuaShuiRate;
        data.value.guoHuFei = statisticsData.guoHuFei;
        data.value.guoHuFeiRate = statisticsData.guoHuFeiRate;
        data.value.jingShouFei = statisticsData.jingShouFei;
        data.value.jingShouFeiRate = statisticsData.jingShouFeiRate;
        data.value.zhengGuanFei = statisticsData.zhengGuanFei;
        data.value.zhengGuanFeiRate = statisticsData.zhengGuanFeiRate;
        data.value.gxhlsBuJiao = statisticsData.gxhlsBuJiao;
        data.value.guXi = statisticsData.guXi;
        data.value.pllxgbRu = statisticsData.pllxgbRu;
    });
})

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
    width: 150px;
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