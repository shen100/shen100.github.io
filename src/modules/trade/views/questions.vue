<template>
    <Card>
        <div v-for="(q, i) in data.questions" :key="i">
            <div class="question-title-box">
                <span class="question-no">{{ i + 1 }}.</span>
                <span class="question-question">{{ q.question }} ?</span>
            </div>
            <div v-if="q.optionsVisible" class="options-box">
                <RadioGroup v-model="q.selectedAnswer" vertical>
                    <Radio class="option-item" :style="{'border-color': op.borderColor}" 
                        v-for="(op, j) in q.options" :key="j" :label="op.answer">{{ displayOption(op, j) }}</Radio>
                </RadioGroup>
            </div>
            <div class="option-switch-box">
                <span class="option-switch-label">选项: </span>
                <Switch v-model="q.optionsVisible" size="large">
                    <template #open>
                        <span>显示</span>
                    </template>
                    <template #close>
                        <span>隐藏</span>
                    </template>
                </Switch>
            </div>
        </div>
        <div class="submit-box">
            <Button type="primary" @click="onSubmit">提交</Button>
        </div>

    </Card>
</template>

<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from 'vue';
import { Modal } from 'view-ui-plus';

const questions = [
    {
        question: '上证指数日跌幅达到多少就意味着有极大可能即将到达底部',
        options: [
            { answer: '3%' },
            { answer: '3.5%' },
            { answer: '4%' },
            { answer: '4.5%' },
        ],
        answer: '3%',
        selectedAnswer: '',
        optionsVisible: false,
    },
    {
        question: '现在两融余额大概是多少',
        options: [
            { answer: '2.1万亿' },
            { answer: '2.2万亿' },
            { answer: '2.3万亿' },
            { answer: '2.4万亿' },
            { answer: '2.5万亿' },
            { answer: '2.6万亿' },
            { answer: '2.7万亿' },
            { answer: '2.8万亿' },
            { answer: '2.9万亿' },
            { answer: '3万亿' },
        ],
        answer: '2.6万亿',
        selectedAnswer: '',
        optionsVisible: false
    }
];

function shuffleArray(arr) {
    const copy = [ ...arr ];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const shuffledQuestions = questions.map(q => {
    return {
        ...q,
        options: shuffleArray(q.options)
    };
});

let data = ref({
    questions: shuffledQuestions
});

function displayOption(option, index) {
    const arr = [ 'A', 'B', 'C', 'D' ];
    return arr[index] + '. ' + option.answer;
}

async function onSubmit() {
    const ok = await Modal.confirm({
        title: '确认提交',
        content: '确定要提交吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: function() {
            for (let i = 0; i < data.value.questions.length; i++) {
                const question = data.value.questions[i];
                for (let j = 0; j < question.options.length; j++) {
                    const option = question.options[j];
                    if (question.answer !== option.answer) {
                        option.borderColor = '#eee';
                        continue;
                    }
                    if (question.answer === question.selectedAnswer) {
                        option.borderColor = '#eee';
                    } else {
                        option.borderColor = '#f55b5b';
                    }
                }
            } 
        }
    });
}

</script>

<style lang="css" scoped>
.question-title-box {
    margin-bottom: 10px;
}

.question-no {
    display: inline-block;
    vertical-align: top;
    width: 30px;
    padding-right: 5px;
    text-align: right;
    font-size: 16px;
}

.question-question {
    font-size: 16px;
}

.options-box {
    padding-left: 30px;
}

.option-item {
    border: 1px #eee solid;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 5px;
    width: 500px;
    height:  40px!important;
    line-height: 40px!important;
    margin-bottom: 10px;
}

.option-item:hover {
    background-color: #f0f7ff;
    cursor: pointer;
}

.option-switch-box {
    padding-left: 30px;
}

.option-switch-label {
    padding-right: 5px;
}

.submit-box {
    margin-top: 20px;
    padding-left: 30px;
}
</style>