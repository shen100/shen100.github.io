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
            <FormItem label="期权行权价平值">
                <InputNumber :max="100000000" :min="1" v-model="data.atmStrikePrice"/>
			</FormItem>
            <FormItem label="K线图初始选中2个蜡烛">
                <span style="margin: 0 10px 0 0;">开始日期</span>
                <DatePicker :model-value="data.candleSelectedDateStart" type="date" placeholder="Select date" style="width: 200px"
                    @on-change="onCandleSelectedDateStartChange"/>
                <span style="margin: 0 10px;">结束日期</span>
                <DatePicker :model-value="data.candleSelectedDateEnd" type="date" placeholder="Select date" style="width: 200px"
                    @on-change="onCandleSelectedDateEndChange"/>
			</FormItem>
            <FormItem label="固定K线行情详情弹窗的right">
                <InputNumber :max="100000000" :min="0" v-model="data.klineTooltipFixedRight"/>
			</FormItem>
            <FormItem label="固定K线行情区间统计弹窗的right">
                <InputNumber :max="100000000" :min="0" v-model="data.klineRangeStatsFixedRight"/>
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
    stockTrainingBuyFilter: false,
    atmStrikePrice: 0, // 期权行权价平值
    candleSelectedDates: [],
    candleSelectedDateStart: '',
    candleSelectedDateEnd: '',
    klineTooltipFixedRight: 0,
    klineRangeStatsFixedRight: 0
});

onMounted(async () => {
    let settingsStr = localStorage.getItem('tradeTrackedStockKChartSettings') || '{}';
    let settings = JSON.parse(settingsStr);
    data.value.refHighPriceVisible = !!settings.refHighPriceVisible;
    data.value.relativeStrengthVisible = !!settings.relativeStrengthVisible;
    data.value.stockTrainingBuyFilter = !!settings.stockTrainingBuyFilter;
    data.value.atmStrikePrice = settings.atmStrikePrice || 0;
    data.value.klineTooltipFixedRight = settings.klineTooltipFixedRight || 0;
    data.value.klineRangeStatsFixedRight = settings.klineRangeStatsFixedRight || 0;
    data.value.candleSelectedDates = settings.candleSelectedDates || [];
    if (data.value.candleSelectedDates.length) {
        data.value.candleSelectedDateStart = data.value.candleSelectedDates[0];
        data.value.candleSelectedDateEnd = data.value.candleSelectedDates[1];
    }
});

function onCandleSelectedDateStartChange(dateStr) {
    data.value.candleSelectedDateStart = dateStr;
}

function onCandleSelectedDateEndChange(dateStr) {
    data.value.candleSelectedDateEnd = dateStr;
}

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
            settings.atmStrikePrice = data.value.atmStrikePrice;
            settings.klineTooltipFixedRight = data.value.klineTooltipFixedRight;
            settings.klineRangeStatsFixedRight = data.value.klineRangeStatsFixedRight;
            if (data.value.candleSelectedDateStart && data.value.candleSelectedDateEnd) {
                settings.candleSelectedDates = [ data.value.candleSelectedDateStart, data.value.candleSelectedDateEnd ];
            } else {
                settings.candleSelectedDates = null;
            }
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