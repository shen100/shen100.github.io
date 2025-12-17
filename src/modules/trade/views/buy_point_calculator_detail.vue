<template>
    <div>
        <Card>
            <Form :label-width="80">
                <FormItem label="股票代码">
                    <Input v-if="data.isEdit" v-model="data.stockFullId" style="width: 300px;"></Input>
                    <div v-else>{{ data.stockFullId }}</div>
                </FormItem>
                <FormItem label="股票名称">
                    <Input v-if="data.isEdit" v-model="data.stockName" style="width: 300px;"></Input>
                    <div v-else>{{ data.stockName }}</div>
                </FormItem>
                <FormItem label="最新价格">
                    <div>{{ data.curStockPrice }}</div>
                </FormItem>
                <FormItem label="最终价格">
                    <Input v-if="data.isEdit" v-model="data.finalPrice" style="width: 300px;"></Input>
                    <div v-else>{{ data.finalPrice }}</div>
                </FormItem>
                <FormItem label="总花费">
                    <div>{{ formatMoney(data.totalExpense, 2) }}</div>
                </FormItem>
            </Form>
            <Table v-if="data.isEdit" border :columns="data.columns1" :data="data.buyPoints">
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
                <template #avgCost="{ row }">
					<div>{{ formatMoney(row.avgCost, 4) }}</div>
				</template>
                <template #sumExpense="{ row }">
					<div>{{ formatMoney(row.sumExpense, 2) }}</div>
				</template>
                <template #profit2="{ row }">
					<div>{{ formatMoney(row.profit2, 2) }}</div>
				</template>
                <template #upDownRate3="{ row }">
					<div>{{ formatMoney(row.upDownRate3 * 100, 2) + '%' }}</div>
				</template>
                <template #profit3="{ row }">
					<div>{{ formatMoney(row.profit3, 2) }}</div>
				</template>
                <template #action="{ row, index }">
                    <Button size="small" type="error" @click="onDelBuyPoints(index)">删除</Button>
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
                <template #avgCost="{ row }">
					<div>{{ formatMoney(row.avgCost, 4) }}</div>
				</template>
                <template #sumExpense="{ row }">
					<div>{{ formatMoney(row.sumExpense, 2) }}</div>
				</template>
                <template #profit2="{ row }">
					<div>{{ formatMoney(row.profit2, 2) }}</div>
				</template>
                <template #upDownRate3="{ row }">
					<div>{{ formatMoney(row.upDownRate3 * 100, 2) + '%' }}</div>
				</template>
                <template #profit3="{ row }">
					<div>{{ formatMoney(row.profit3, 2) }}</div>
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
import { formatMoney } from '../util/money';
import { globalEventEmitter } from '../../../util/event';
import { trim } from '../util/str';

const route = useRoute()
const router = useRouter()

let columns = [
    {
        title: '花费',
        slot: 'expense'
    },
    {
        title: '累计花费',
        slot: 'sumExpense'
    },
    {
        title: '平均成本',
        slot: 'avgCost'
    },
    {
        title: 'ƒ(买入价格, 首次买入价格)',
        width: 220,
        slot: 'upDownRate1'
    },
    {
        title: 'ƒ(买入价格, 平均成本)',
        width: 200,
        slot: 'upDownRate2'
    },
    {
        title: '利润2',
        slot: 'profit2'
    },
    {
        title: 'ƒ(最终价格, 平均成本)',
        width: 200,
        slot: 'upDownRate3'
    },
    {
        title: '利润3',
        slot: 'profit3'
    }
];
let data = ref({
    isEdit: false,
    id: '',
    stockFullId: '',
    stockName: '',
    columns1: [
		{
			title: '买入价格',
			slot: 'price',
		},
		{
			title: '买入数量',
			slot: 'count'
		},
        ...columns,
        {
            title: '操作',
            slot: 'action'
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
        ...columns
    ],
    list: [],
    buyPoints: ref([]),
    curStockPrice: 0, // 最新价格
    finalPrice: 0,  // 最终价格 
    totalExpense: 0, // 总花费
    tempData: null
})

onMounted(async () => {
    data.value.id = route.query.id;
    let listStr = localStorage.getItem('tradeBuyPointCalculator') || '{"list": []}';
    let jsonData = JSON.parse(listStr);
    let list = jsonData.list;
    data.value.list = list;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === data.value.id) {
            data.value.stockFullId = list[i].stockFullId;
            data.value.stockName = list[i].stockName;
            data.value.buyPoints = ref(list[i].buyPoints || []);
            data.value.totalExpense = list[i].totalExpense || 0;
            data.value.finalPrice = list[i].finalPrice || 0;
            break;
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

    if (data.value.stockFullId) {
        let stock = {
            stockFullId: data.value.stockFullId
        }
        let stockDetail = await requestStockDetail(stock);
        data.value.curStockPrice = stockDetail.price;
    }

    calculateAverageCostChangeRate();
});

function onBuyPointsEdit() {
    data.value.tempData = {
        stockFullId: data.value.stockFullId,
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
        upDownRate3: 0,
        profit2: 0, // 利润
        profit3: 0 // 利润
    });
}

function onPriceChange(index, price) {
    data.value.buyPoints[index].price = price;
}

function onCountChange(index, count) {
    data.value.buyPoints[index].count = count;
}

function onBuyPointsEditOk() {
    let stockFullId = trim(data.value.stockFullId);
    let stockName = trim(data.value.stockName);
    if (!stockFullId) {
        Message.error({
            duration: 10,
            content: '请输入股票代码'
        });
        return
    }
    if (!stockName) {
        Message.error({
            duration: 10,
            content: '请输入股票名称'
        });
        return
    }

    data.value.isEdit = false;
    let list = data.value.list;
    calculateAverageCostChangeRate();
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === data.value.id) {
            list[i].stockFullId = stockFullId;
            list[i].stockName = stockName;
            list[i].totalExpense = data.value.totalExpense;
            list[i].finalPrice = data.value.finalPrice;
            break;
        }
    }
    localStorage.setItem('tradeBuyPointCalculator', JSON.stringify({
        list: data.value.list,
    }));
}

function onBuyPointsEditCancel() {
    data.value.stockFullId = data.value.tempData.stockFullId;
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
        buyPoints[i].upDownRate2 = (buyPoints[i].price - avgCost) / avgCost;
        buyPoints[i].profit2 = buyPoints[i].price * sumCount - sumExpense;
        buyPoints[i].upDownRate3 = (data.value.finalPrice - avgCost) / avgCost;
        buyPoints[i].profit3 = data.value.finalPrice * sumCount - sumExpense;
        buyPoints[i].sumExpense = sumExpense;
        buyPoints[i].avgCost = avgCost;
    }
}

function onDelBuyPoints(index) {
    data.value.buyPoints.splice(index, 1);
}
</script>