<template>
    <div>
        <Card>
            <div style="margin-bottom: 15px;">
                <Button type="primary" @click="onAddStock">添加股票</Button>
            </div>
            <Table border :columns="data.columns" :data="data.list">
				<template #action="{ row }">
					<Button size="small" type="primary" @click="onStockDetail(row)">查看</Button>
                    <Button size="small" type="error" @click="onDelStock(row)" style="margin-left: 10px;">删除</Button>
				</template>
            </Table>
        </Card>
        <Modal
            v-model="data.addStockVisible"
            title="添加股票">
            <Form :label-width="80">
                <FormItem label="股票代码">
                    <Input v-model="data.stockId" placeholder=""></Input>
                </FormItem>
                <FormItem label="股票名称">
                    <Input v-model="data.stockName" placeholder=""></Input>
                </FormItem>
            </Form>
            <template #footer>
                <Button type="primary" @click="addStockOk">确定</Button>
                <Button @click="addStockCancel">取消</Button>
            </template>
        </Modal>
        <Modal
            v-model="data.delStockVisible"
            @on-ok="delStockOk"
            @on-cancel="delStockCancel">
            <template #header>
                <p style="color:#ed4014;">
                    <Icon type="ios-information-circle"></Icon>
                    <span>删除</span>
                </p>
            </template>
            <div>确定要删除 <span class="del-stock-buy-point-calculator">{{data.stockNameToDelete}}</span>?</div>
        </Modal>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Message } from 'view-ui-plus';
import { useRouter } from 'vue-router'
import { trim } from '../util/str';

const router = useRouter()

let data = ref({
    columns: [
		{
			title: '股票代码',
			key: 'stockId',
		},
		{
			title: '股票名称',
			key: 'stockName'
		},
        {
			title: '花费',
			key: 'totalExpense'
		},
		{
			title: '操作',
			slot: 'action'
		}
    ],
    list: [],
    addStockVisible: false,
    stockId: '',
    stockName: '',
    clickedTime: 0,
    delStockVisible: false,
    idToDelete: '',
    stockNameToDelete: '',
})

onMounted(async () => {
    let listStr = localStorage.getItem('tradeBuyPointCalculator') || '{"list": []}';
    let jsonData = JSON.parse(listStr);
    data.value.list = jsonData.list;
});

function onAddStock() {
    data.value.addStockVisible = true;
}

function addStockOk() {
    let now = new Date().getTime();
    if (now - data.value.clickedTime < 1000) {
        return;
    }
    data.value.clickedTime = now;
    let stockId = trim(data.value.stockId);
    let stockName = trim(data.value.stockName);
    if (!stockId) {
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
    data.value.list.push({
        id:  '' + now,
        stockId,
        stockName,
        buyPoints: [],
        totalExpense: 0
    });
    localStorage.setItem('tradeBuyPointCalculator', JSON.stringify({
        list: data.value.list
    }));
    data.value.addStockVisible = false;
}

function addStockCancel() {
    data.value.addStockVisible = false;
}

function onStockDetail(row) {
    router.push({
        path: '/trade/buy_point_calculator_detail',
        query: { id: row.id }
    });
}

function onDelStock(row) {
    data.value.idToDelete = row.id;
    data.value.stockNameToDelete = row.stockName;
    data.value.delStockVisible = true;
}

function delStockOk() {
    let list = data.value.list;
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === data.value.idToDelete) {
            list.splice(i, 1);
            break;
        }
    }
    localStorage.setItem('tradeBuyPointCalculator', JSON.stringify({
        list: data.value.list
    }));
    data.value.delStockVisible = false;
}

function delStockCancel() {
    data.value.delStockVisible = false;
}
</script>

<style scoped>
.del-stock-buy-point-calculator {
    font-weight: 700;
}
</style>