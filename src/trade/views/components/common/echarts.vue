<template>
    <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
    options: {
        type: Object,
        required: true
    },
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '400px'
    }
})

const chartRef = ref(null)
let chartInstance = null

// 初始化图表
const initChart = () => {
    if (chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
        chartInstance.setOption(props.options)
    }
}

const updateChart = () => {
    if (chartInstance) {
        chartInstance.setOption(props.options)
    }
}

const resizeChart = () => {
    if (chartInstance) {
        chartInstance.resize()
    }
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
    window.removeEventListener('resize', resizeChart)
})

// 监听options变化
watch(() => props.options, () => {
    updateChart()
}, { deep: true })
</script>