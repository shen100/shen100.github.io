<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import HttpUtil from '../../utils/HttpUtil.js'
import DateUtil from '../../utils/DateUtil.js'

const router = useRouter()

let columns = ref([
    {
        title: 'ID',
        key: '_id'
    },
    {
        title: '书名',
        key: 'title'
    },
    {
        title: '创建时间',
        slot: 'createdAt'
    },
    {
        title: '更新时间',
        slot: 'updatedAt'
    },
    {
        title: '操作',
        slot: 'action'
    },
])
let list = ref([])
let page = ref(1)
let pageSize = ref(0)
let total = ref(0)
let curModal = ref(false) // 是否显示删除图书的弹框
let curId = ref('') // 当前要删除的图书ID
let curTitle = ref('') // 当前要删除的图书书名

onMounted(() => {
    requestList()
})

function onPageChange(p) {
    page.value = p
    requestList()
}

async function requestList() {
    let url = `/api/books?page=${page.value}`;
    try {
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        page.value = res.data.page
        pageSize.value = res.data.pageSize
        total.value = res.data.total
        list.value = res.data.list
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function onCreate() {
    router.push({ path: '/books/edit' })
}

function onViewWord(id) {
    router.push({ path: `/books/${id}/words` })
}

function onEdit(id) {
    router.push({ path: '/books/edit', query: { id } })
}

function onDelete(row) {
    curId.value = row._id;
    curTitle.value = row.title;
    curModal.value = true;
}

async function deleteBook() {
    let url = `/api/books/${curId.value}`;
    try {
        let res = await HttpUtil.delete(url);
        curModal.value = false;
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        Message.success({
            duration: 10,
            content: '删除成功'
        });
        page.value = 1;
        await requestList();
    } catch (err) {
        curModal.value = false;
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function cancelDeleteBook() {
    curModal.value = false;
}

function formatLocalYMDHMS(date) {
    return DateUtil.formatLocalYMDHMS(date)
}
</script>

<template>
    <div>
        <Card>
            <div class="op-top-box">
                <Button @click="onCreate" type="primary">创建</Button>
                <div style="flex: 1"></div>
                <div>
                    <Page @on-change="onPageChange" :total="total" :model-value="page" :page-size="pageSize" show-total />
                </div>
            </div>
            <Table :columns="columns" :data="list" border>
                <template #createdAt="{ row }">
                    <div>{{ formatLocalYMDHMS(row.createdAt) }}</div>
                </template>
                <template #updatedAt="{ row }">
                    <div>{{ formatLocalYMDHMS(row.updatedAt) }}</div>
                </template>
                <template #action="{ row }">
                    <Button @click="onViewWord(row._id)" type="primary" size="small" style="margin-right: 10px;">查看单词</Button>
                    <Button @click="onEdit(row._id)" type="primary" size="small" style="margin-right: 10px;">编辑</Button>
                    <Button @click="onDelete(row)" type="error" size="small">删除</Button>
                </template>
            </Table>
            <div class="op-bottom-box">
                <div style="flex: 1"></div>
                <div>
                    <Page @on-change="onPageChange" :total="total" :model-value="page" :page-size="pageSize" show-total />
                </div>
            </div>
        </Card>
        <Modal
            v-model="curModal"
            @on-ok="deleteBook"
            @on-cancel="cancelDeleteBook">
            <template #header>
                <p style="color:#ed4014;">
                    <Icon type="ios-information-circle"></Icon>
                    <span>删除</span>
                </p>
            </template>
            <div>确定要删除 <em class="delete-book-title">{{curTitle}}</em>?</div>
        </Modal>
    </div>
</template>

<style scoped>
.delete-book-title {
    color: #000;
    font-weight: 700;
    font-style: normal;
}

.op-top-box {
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
}

.op-bottom-box {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
}
</style>