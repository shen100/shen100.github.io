<template>
    <div>
        <div style="display: flex; gap: 20px;">
            <Card style="flex: 1; min-height: 600px;">
                <div>
                    <div class="todo-list-item" :key="i" v-for="(item, i) in data.todoList">
                        <Checkbox v-model="item.done">{{ item.label }}</Checkbox>
                    </div>
                    <div>
                        <Button type="primary" @click="onSubmit">确定</Button>
                    </div>
                </div>
            </Card>
            <Card style="flex: 2; min-height: 600px;">
                <div class="finished-todo-Count-title">打卡数</div>
                <ECharts v-if="chartOptions.series.length" :options="chartOptions" />
            </Card>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import config from '../config/config.js';
import ECharts from './components/common/echarts.vue'

let data = ref({
    todoList: [
    ],
    date: '',
});

const chartOptions = ref({
	title: {
		text: ' '
	},
	tooltip: {
		trigger: 'axis'
	},
    // legend: {
	// 	data: []
	// },
	xAxis: {
		type: 'category',
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
});

onMounted(async () => {
    requestTodoListData();
    requestChartData();
});

async function requestTodoListData() {
    const res = await axios({
		method: 'get',
		url: config.url + '/api/todo/today'
	});
	let resData = res.data.data;
    data.value.todoList = resData.list;
    data.value.date = resData.date;
    console.log('data.value.todoList', data.value.todoList);
}

async function requestChartData() {
    const res = await axios({
		method: 'get',
		url: config.url + '/api/todo/get_daily_todo_count'
	});
	let resData = res.data.data;
    console.log(resData);
    const list = resData.list;
    const dates = [];
    const finishedTodoCountList = [];
    list.forEach(item => {
		dates.push(item.date);
		finishedTodoCountList.push(item.finishedTodoCount);
	});
	const series = [
        {
            name: '打卡数',
            type: 'line',
            data: finishedTodoCountList
        }
    ];
    // chartOptions.value.legend.data = [ '打卡数' ];
	chartOptions.value.xAxis.data = dates;
	chartOptions.value.series = series;
}

async function onSubmit() {
    const res = await axios.post(config.url + '/api/todo/done', {
		list: data.value.todoList,
        date: data.value.date
	});
}
</script>


<style scoped>
.todo-list-item {
    margin-bottom: 6px;
}

.finished-todo-Count-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}
</style>