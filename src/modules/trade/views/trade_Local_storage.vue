<template>
    <div>
        <Card>
            <Select v-model="data.localKey" @on-change="onChange" style="width: 300px">
                <Option v-for="item in data.localKeys" :value="item.value" :key="item.value">{{ item.value }}</Option>
            </Select>
            <div style="margin-top: 10px; color: rgb(246 108 108);">{{ tipText }}</div>
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
import { onMounted, ref, computed } from 'vue'
import { Message } from 'view-ui-plus'

let data = ref({
    localKey: '',
    localKeys: [
        {
            value: 'tradeTrackedStocks'
        },
        {
            value: 'tradeTrackedStocksByStrategy1',
            label: '到达最高价后回踩'
        },
        {
            value: 'tradeTrackedStocksByStrategy2',
            label: '最近 20 天， 80% 的时间处于上涨'
        }
    ],
    jsonStr: ''
})

onMounted(async () => {
    
})

const tipText = computed(() => {
    for (let i = 0; i < data.value.localKeys.length; i++) {
        if (data.value.localKeys[i].value === data.value.localKey) {
            return data.value.localKeys[i].label
        }
    }
    return '';
})

function onChange(key) {
    let value = localStorage.getItem(key);
    data.value.jsonStr = '';
    if (value) {
        data.value.jsonStr = value;
    }
}

function onSubmit() {
    if (!data.value.localKey) {
        Message.error({
            duration: 10,
            content: '请选择key'
        });
        return
    }
    localStorage.setItem(data.value.localKey, data.value.jsonStr);
    Message.success({
        duration: 10,
        content: ' 设置成功'
    });
}

</script>

<style scoped>
</style>