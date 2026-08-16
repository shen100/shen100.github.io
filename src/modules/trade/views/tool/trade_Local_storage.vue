<template>
    <div>
        <Card>
            <Select v-model="data.myLocalKey" @on-change="onChange" style="width: 300px">
                <Option v-for="item in data.localKeys" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <div>
                <Input v-model="data.jsonStr" type="textarea" :rows="20" placeholder="" style="width: 600px; margin: 20px 0" />    
            </div>
            <div>
                <Button type="primary" @click="onSubmit">确定</Button>
            </div>
        </Card>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Message } from 'view-ui-plus';

let data = ref({
    myLocalKey: '',
    localKeys: [
        {
            value: 'tradeAllFullIdStocks',
            label: '全部股票'
        },
        {
            value: 'tradeCustomStocks',
            label: '地址栏传UUID'
        },
        {
            value: 'tradeIndexStocks',
            label: '全球指数'
        },
        {
            value: 'tradeIndexStocks',
            label: '板块指数'
        },
        {
            value: 'tradeInvestedStocks',
            label: '当前持仓'
        },
        {
            value: 'tradeTrail',
            label: '交易复盘'
        },
        {
            value: 'tradePotentialStocks',
            label: '候选股'
        },
        {
            value: 'tradeHighConvictionStocks',
            label: '最强逻辑'
        },
        {
            value: 'tradePaperStocks',
            label: '模拟交易'
        },
        {
            value: 'tradeMemoryStocks',
            label: '存储芯片'
        },
        {
            value: 'tradePhysicalAIStocks',
            label: '物理AI'
        },
        {
            value: 'tradeStocksByStrategy1',
            label: '到达最高价后回踩'
        },
        {
            value: 'tradeStocksByStrategy2',
            label: '最后一个交易日达到最高价'
        },
        {
            value: 'tradeStocksByStrategy3',
            label: '最近10天涨幅超过50%'
        },
        {
            value: 'tradeStocksByStrategy4',
            label: '最近10天最高涨幅超过30%, 回调超过12%'
        }
    ],
    jsonStr: ''
})

onMounted(async () => {
})

function onChange(key) {
    let str = localStorage.getItem(key);
    data.value.jsonStr = '';
    if (str) {
        data.value.jsonStr = str;
    }
}

function onSubmit() {
    if (!data.value.myLocalKey) {
        Message.error({
            duration: 10,
            content: '请选择key'
        });
        return
    }
    localStorage.setItem(data.value.myLocalKey, data.value.jsonStr);
    Message.success({
        duration: 10,
        content: ' 设置成功'
    });
}

</script>

<style scoped>
</style>