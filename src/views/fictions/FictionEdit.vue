<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import HttpUtil from '../../utils/HttpUtil.js'

const route = useRoute()
const router = useRouter()

let isEdit = ref(false)
let id = ref('')
let title = ref('')

onMounted(async () => {
    if (!route.query.id) {
        return
    }
    isEdit.value = true;
    id.value = route.query.id;
    let url = '/api/fictions/' + id.value;
    try {
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        title.value = res.data.title
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
})

async function onSave() {
    let url = '/api/fictions';
    try {
        let res = await HttpUtil.post(url, {
            title: title.value,
            id: id.value
        });
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        router.push({ path: '/fictions' })
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function onCancel() {
    router.push({ path: '/fictions' })
}
</script>

<template>
    <div>
        <Card>
            <Form :label-width="100" style="width: 600px;">
                <FormItem label="书名">
                    <Input type="text" v-model="title" placeholder="请输入书名"></Input>
                </FormItem>
                <FormItem label=" ">
                    <Button @click="onSave" style="margin-right: 20px;" type="primary">保存</Button>
                    <Button @click="onCancel">取消</Button>
                </FormItem>
            </Form>
        </Card>
    </div>
</template>

<style scoped>
</style>