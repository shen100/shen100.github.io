<template>
    <div>
        <Card>
            <Form :label-width="80">
                <FormItem label="股票代码">
                    <Input v-if="data.isEdit" v-model="data.stockId" style="width: 300px;"></Input>
                    <div v-else>{{ data.stockId }}</div>
                </FormItem>
                <FormItem label="股票名称">
                    <Input v-if="data.isEdit" v-model="data.stockName" style="width: 300px;"></Input>
                    <div v-else>{{ data.stockName }}</div>
                </FormItem>
                <FormItem label="最新价格">
                    <div>{{ data.curStockPrice }}</div>
                </FormItem>
                <FormItem label="总花费">
                    <div>{{ formatMoney(data.totalExpense, 2) }}</div>
                </FormItem>
            </Form>
            <Table v-if="data.isEdit" border :columns="data.columns" :data="data.buyPoints">
                <template #price="{ row, index }">
					<InputNumber number v-model="row.price" @on-change="() => onPriceChange(index, row.price)"></InputNumber>
				</template>
                <template #count="{ row, index }">
					<InputNumber number v-model="row.count" @on-change="() => onCountChange(index, row.count)"></InputNumber>
				</template>
                <template #upDownRate1="{ row, index }">
					<div>{{ index === 0 ? '' : formatMoney(row.upDownRate1 * 100, 2) + '%'}}</div>
				</template>
                <template #upDownRate2="{ row }">
					<div>{{ formatMoney(row.upDownRate2 * 100, 2) + '%' }}</div>
				</template>
                <template #expense="{ row }">
					<div>{{ formatMoney(row.expense, 2) }}</div>
				</template>
                <template #avgCost="{ row, index }">
					<div>{{ index === 0 ? row.avgCost : formatMoney(row.avgCost, 4) }}</div>
				</template>
                <template #sumExpense="{ row }">
					<div>{{ formatMoney(row.sumExpense, 2) }}</div>
				</template>
                <template #profit="{ row }">
					<div>{{ formatMoney(row.profit, 2) }}</div>
				</template>
            </Table>
            <Table v-else border :columns="data.columns2" :data="data.buyPoints">
                <template #upDownRate1="{ row, index }">
					<div>{{ index === 0 ? '' : formatMoney(row.upDownRate1 * 100, 2) + '%'}}</div>
				</template>
                <template #upDownRate2="{ row }">
					<div>{{ formatMoney(row.upDownRate2 * 100, 2) + '%' }}</div>
				</template>
                <template #expense="{ row }">
					<div>{{ formatMoney(row.expense, 2) }}</div>
				</template>
                <template #avgCost="{ row, index }">
					<div>{{ index === 0 ? row.avgCost : formatMoney(row.avgCost, 4) }}</div>
				</template>
                <template #sumExpense="{ row }">
					<div>{{ formatMoney(row.sumExpense, 2) }}</div>
				</template>
                <template #profit="{ row }">
					<div>{{ formatMoney(row.profit, 2) }}</div>
				</template>
            </Table>
            <div v-if="data.isEdit" style="margin-top: 15px;">
                <Button size="small" @click="onAddBuyPoints">+添加</Button>
            </div>
            <div style="margin-top: 15px;">
                <template v-if="data.isEdit">
                    <Button type="primary" @click="onBuyPointsEditOk">确定</Button>
                    <Button style="margin-left: 10px;" @click="onBuyPointsEditCancel">取消</Button>
                </template>
                <template v-else>
                    <Button type="primary" @click="onBuyPointsEdit">编辑</Button>
                </template>
            </div>
        </Card>
    </div>
</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { InputNumber, Message } from 'view-ui-plus'
import { requestStockDetail } from '../util/stock';
import { addStockExchangePrefix } from '../util/big_a';
import { formatMoney } from '../util/money';
import { globalEventEmitter } from '../../../util/event';

const route = useRoute()
const router = useRouter()

let data = ref({
    isEdit: false,
    id: '',
    stockId: '',
    stockName: '',
    columns: [
		{
			title: '买入价格',
			slot: 'price',
		},
		{
			title: '买入数量',
			slot: 'count'
		},
        {
			title: '平均成本',
			slot: 'avgCost'
		},
        {
			title: '花费',
			slot: 'expense'
		},
        {
			title: '累计花费',
			slot: 'sumExpense'
		},
        {
			title: '(买入价格 - 首次买入价格) / 首次买入价格',
            width: 320,
			slot: 'upDownRate1'
		},
        {
			title: '(最新价格 - 平均成本) / 平均成本',
            width: 250,
			slot: 'upDownRate2'
		},
        {
			title: '利润',
			slot: 'profit'
		}
    ],
    columns2: [
		{
			title: '买入价格',
			key: 'price',
		},
		{
			title: '买入数量',
			key: 'count'
		},
        {
			title: '平均成本',
			slot: 'avgCost'
		},
        {
			title: '花费',
			slot: 'expense'
		},
        {
			title: '累计花费',
			slot: 'sumExpense'
		},
        {
			title: '(买入价格 - 首次买入价格) / 首次买入价格',
            width: 320,
			slot: 'upDownRate1'
		},
        {
			title: '(最新价格 - 平均成本) / 平均成本',
            width: 250,
			slot: 'upDownRate2'
		},
        {
			title: '利润',
			slot: 'profit'
		}
    ],
    list: [],
    buyPoints: ref([]),
    curStockPrice: 0, // 最新价格
    totalExpense: 0, // 总花费
    tempData: null,
})

onMounted(async () => {
    data.value.id = route.query.id;
    let listStr = localStorage.getItem('tradeBuyPointCalculator') || '{"list": []}';
    let jsonData = JSON.parse(listStr);
    let list = jsonData.list;
    data.value.list = list;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === data.value.id) {
            data.value.stockId = list[i].stockId;
            data.value.stockName = list[i].stockName;
            data.value.buyPoints = ref(list[i].buyPoints || []);
            data.value.totalExpense = list[i].totalExpense || 0;
        }
    }

    globalEventEmitter.emit('breadcrumb', {
        list: [
            {
                to: '/',
                label: '首页'
            },
            {
                to: '/trade/buy_point_calculator',
                label: '买点计算器'
            },
            {
                label: data.value.stockName
            }
        ]
    });

    if (data.value.stockId) {
        let stock = {
            stockId: data.value.stockId,
            stockFullId: addStockExchangePrefix(data.value.stockId),
        }
        let stockDetail = await requestStockDetail(stock);
        data.value.curStockPrice = stockDetail.price;
    }
});

function onBuyPointsEdit() {
    data.value.tempData = {
        stockId: data.value.stockId,
        stockName: data.value.stockName,
        buyPoints: JSON.parse(JSON.stringify(data.value.buyPoints))
    };
    data.value.isEdit = true;
}

function onAddBuyPoints() {
    data.value.buyPoints.push({
        price: 0, // 买入价格
        count: 0, // 买入数量
        avgCost: 0, // 平均成本
        expense: 0, // 花费
        sumExpense: 0, // 累计花费
        upDownRate1: 0,
        upDownRate2: 0,
        profit: 0 // 利润
    });
}

function onPriceChange(index, price) {
    data.value.buyPoints[index].price = price;
}

function onCountChange(index, count) {
    data.value.buyPoints[index].count = count;
}

function onBuyPointsEditOk() {
    data.value.isEdit = false;
    let list = data.value.list;
    calculateAverageCostChangeRate();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === data.value.id) {
            list[i].totalExpense = data.value.totalExpense; // 总花费
            break;
        }
    }
    localStorage.setItem('tradeBuyPointCalculator', JSON.stringify({
        list: data.value.list,
    }));
}

function onBuyPointsEditCancel() {
    data.value.stockId = data.value.tempData.stockId;
    data.value.stockName = data.value.tempData.stockName;
    data.value.buyPoints = data.value.tempData.buyPoints;
    data.value.isEdit = false;
}

function calculateAverageCostChangeRate() {
    let buyPoints = data.value.buyPoints;
    if (!buyPoints || !buyPoints.length) {
        return;
    }
    // 首次买入价格
    let firstBuyPrice = buyPoints[0].price;
    data.value.totalExpense = 0; // 总花费
    for (let i = 0; i < buyPoints.length; i++) {
        buyPoints[i].expense = buyPoints[i].price * buyPoints[i].count;
        data.value.totalExpense += buyPoints[i].expense;
        let sumExpense = 0; // 累计花费
        let sumCount = 0;
        let avgCost = 0; // 平均成本
        for (let j = 0; j <= i; j++) {
            sumExpense += buyPoints[j].price * buyPoints[j].count; 
            sumCount += buyPoints[j].count;
        }
        avgCost = sumExpense / sumCount;
        buyPoints[i].upDownRate1 = (buyPoints[i].price - firstBuyPrice) / firstBuyPrice;
        buyPoints[i].upDownRate2 = (data.value.curStockPrice - buyPoints[i].avgCost) / buyPoints[i].avgCost;
        buyPoints[i].profit = data.value.curStockPrice * sumCount - sumExpense;
    }
}
</script>