<template>
    <div>
        <Form :label-width="100">
            <FormItem label="最高参考价">
                <Checkbox v-model="data.refHighPriceVisible">显示</Checkbox>
			</FormItem>
            <FormItem label="相对强度线">
                <Checkbox v-model="data.relativeStrengthVisible">显示</Checkbox>
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
    relativeStrengthVisible: false
});

onMounted(async () => {
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);
    data.value.refHighPriceVisible = !!settings.refHighPriceVisible;
    data.value.relativeStrengthVisible = !!settings.relativeStrengthVisible;
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