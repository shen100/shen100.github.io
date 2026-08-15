<template>
    <div>
        <Form :label-width="300">
            <FormItem label="最高参考价">
                <Checkbox v-model="data.refHighPriceVisible">显示</Checkbox>
			</FormItem>
            <FormItem label="相对强度线">
                <Checkbox v-model="data.relativeStrengthVisible">显示</Checkbox>
			</FormItem>
            <FormItem label="交易训练页面只显示有交易行为的K线">
                <Checkbox v-model="data.stockTrainingBuyFilter">过滤</Checkbox>
			</FormItem>
            <FormItem label=" ">
                <Button type="primary" @click="onSubmit">提交</Button>
			</FormItem>
        </Form>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Modal, Message } from 'view-ui-plus';

let data = ref({
    refHighPriceVisible: false,
    relativeStrengthVisible: false,
    stockTrainingBuyFilter: false
});

onMounted(async () => {
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);
    data.value.refHighPriceVisible = !!settings.refHighPriceVisible;
    data.value.relativeStrengthVisible = !!settings.relativeStrengthVisible;
    data.value.stockTrainingBuyFilter = !!settings.stockTrainingBuyFilter;
});

async function onSubmit() {
    const ok = await Modal.confirm({
        title: '确认提交',
        content: '确定要提交吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: function() {
            let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
            let settings = JSON.parse(settingsStr);
            settings.refHighPriceVisible = data.value.refHighPriceVisible;
            settings.relativeStrengthVisible = data.value.relativeStrengthVisible;
            settings.stockTrainingBuyFilter = data.value.stockTrainingBuyFilter;
            let jsonStr = JSON.stringify(settings);
            localStorage.setItem('tradeTrackedStockKChartSettings', jsonStr);
            Message.success({
                duration: 10,
                content: `提交成功`
            });
        }
    });
}
</script>