<template>
	<Modal
		v-model="data.myModalVisible"
        :before-close="onBeforeClose"
		title="AI提问" :width="400">
		<div>
            <div class="ask-item">
                <span>介绍下</span>
                <span class="ask-stock-name" style="margin: 0 5px;">{{props.stock?.stockName}}</span>
                <span>这个公司</span>
                <div class="ask-item-space"></div>
                <Button type="primary" size="small" @click="onCopy(`介绍下 ${props.stock?.stockName} 这个公司`)">复制</Button>
            </div>
            <div class="ask-item">
                <span class="ask-stock-name">{{props.stock?.stockName}}</span>
                <span style="margin-left: 5px;">属于哪些板块与概念?</span>
                <div class="ask-item-space"></div>
                <Button type="primary" size="small" @click="onCopy(`${props.stock?.stockName} 属于哪些板块与概念?有具体的产品吗?还是纯炒作?`)">复制</Button>
            </div>
            <div class="ask-item">
                <span class="ask-stock-name">{{props.stock?.stockName}}</span>
                <span style="margin-left: 5px;">最近有什么利空吗?</span>
                <div class="ask-item-space"></div>
                <Button type="primary" size="small" @click="onCopy(`${props.stock?.stockName} 最近有什么利空吗?`)">复制</Button>
            </div>
        </div>
		<template #footer>
            <Button type="text" @click="onCancel">关闭</Button>
		</template>
	</Modal>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Message } from 'view-ui-plus';

const emit = defineEmits(['hide-modal']);

const props = defineProps([
    'stock',
    'modalVisible'
]);

let data = ref({
    myModalVisible: false,
})

onMounted(async () => {

});

watch(() => props.modalVisible, (newVal) => {
    data.value.myModalVisible = newVal;
})

async function onCopy(text) {
    try {
        await navigator.clipboard.writeText(text);
        Message.success({
            duration: 10,
            content: '复制成功'
        });
    } catch (err) {
        console.error('复制失败:', err);
        Message.error({
            duration: 10,
            content: '复制失败'
        });
    }
}

function onBeforeClose() {
    data.value.myModalVisible = false;
    emit('hide-modal');
}

function onCancel() {
    data.value.myModalVisible = false;
    emit('hide-modal');
}
</script>

<style scoped>
.ask-item {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.ask-stock-name {
    font-weight: 700;
}
.ask-item-space {
    flex: 1;
}
</style>