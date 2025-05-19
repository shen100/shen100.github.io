<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import Uploader from '../../components/Uploader.vue'
import Downloader from '../../components/Downloader.vue'
import HttpUtil from '../../utils/HttpUtil.js'
import DateUtil from '../../utils/DateUtil.js'

const route = useRoute()
const router = useRouter()

let columns = ref([
    {
        title: '序号',
        key: 'orderNO',
        width: 100
    },
    {
        title: '单词',
        key: 'word'
    },
    {
        title: '音标 (英)',
        key: 'phoneticUK'
    },
    {
        title: '音标 (美)',
        key: 'phoneticUS'
    },
    {
        title: '释义',
        key: 'meaning'
    },
    {
        title: '章节',
        key: 'chapter',
        width: 100
    },
    {
        title: '创建时间',
        slot: 'createdAt',
        width: 190
    },
    {
        title: '更新时间',
        slot: 'updatedAt',
        width: 190
    },
    {
        title: '操作',
        slot: 'action',
        width: 100
    },
])

let existsWordColumns = ref([
    {
        title: '序号',
        key: 'orderNO',
        width: 100
    },
    {
        title: '单词',
        key: 'word'
    },
    {
        title: '音标 (英)',
        key: 'phoneticUK'
    },
    {
        title: '音标 (美)',
        key: 'phoneticUS'
    },
    {
        title: '释义',
        key: 'meaning'
    },
    {
        title: '章节',
        key: 'chapter',
        width: 100
    }
])

let headers = ref({
    Authorization: ''
})
let bookId = ref('');
let bookTitle = ref('');
let list = ref([])
let page = ref(1)
let pageSize = ref(0)
let total = ref(0)
let existsWordList = ref([])
let isCreateWord = ref(false)
let continueCreateVisible = ref(false)
let updateData = ref({})
let editModalVisible = ref(false)

onMounted(async () => {
    headers.value.Authorization = localStorage.getItem('token') || ''
    bookId.value = route.params.bookId
    await requestBook(bookId.value)
    await requestList(bookId.value, page.value)
})

async function requestBook(bookId) {
    let url = `/api/books/${bookId}`;
    try {
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        bookTitle.value = res.data.title
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

async function requestList(bookId, pageNO) {
    let url = `/api/words?bookId=${bookId}&page=${pageNO}`;
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

function onPageChange(page) {
    requestList(bookId.value, page)
}

function onUplaodSuccess(res) {
    if (res && res.code === 0) {
        Message.success({
            duration: 10,
            content: '上传成功'
        });
        requestList(bookId.value, 1)
    } else {
        Message.error({
            duration: 10,
            content: res.message
        });
    }
}

function onUplaodError() {
    Message.error({
        duration: 10,
        content: '网络异常，上传失败'
    });
}

function onEditClick(data) {
    existsWordList.value = []
    isCreateWord.value = false
    continueCreateVisible.value = false
    updateData.value = {
        _id: data._id,
        chapter: data.chapter,
        meaning: data.meaning,
        phoneticUK: data.phoneticUK,
        phoneticUS: data.phoneticUS,
        word: data.word,
        bookId: bookId.value
    }
    editModalVisible.value = true
}

function onCreateClick() {
    existsWordList.value = []
    isCreateWord.value = true
    continueCreateVisible.value = false
    updateData.value = {
        _id: '',
        chapter: 1,
        meaning: '',
        phoneticUK: '',
        phoneticUS: '',
        word: '',
        bookId: bookId.value
    }
    editModalVisible.value = true
}

async function createModalOK() {
    try {
        let url = '/api/words/byword?bookId=' + updateData.value.bookId + '&word=' + encodeURIComponent(updateData.value.word);
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        existsWordList.value = res.data.list || []
        if (res.data.list && res.data.list.length) {
            continueCreateVisible.value = true
            return
        }
        await editModalOK()
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

async function editModalOK() {
    try {
        let url = '/api/words';
        let res = await HttpUtil.put(url, {
            _id: updateData.value._id,
            chapter: updateData.value.chapter,
            meaning: updateData.value.meaning,
            phoneticUK: updateData.value.phoneticUK,
            phoneticUS: updateData.value.phoneticUS,
            word: updateData.value.word,
            bookId: parseInt(updateData.value.bookId),
        });
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        list.value.forEach(word => {
            if (word._id === res.data._id) {
                word.word = res.data.word
                word.meaning = res.data.meaning
                word.phoneticUK = res.data.phoneticUK
                word.phoneticUS = res.data.phoneticUS
                word.chapter = res.data.chapter
            }
        })
        Message.success({
            duration: 10,
            content: updateData.value._id ? '修改成功' : '创建成功'
        });
        editModalVisible.value = false
        // if (!updateData.value._id) {
        //     requestList(bookId.value, 1)
        // }
    } catch (err) {
        editModalVisible.value = false
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function editModalCancel() {
    editModalVisible.value = false
}

function formatLocalYMDHMS(date) {
    return DateUtil.formatLocalYMDHMS(date)
}
</script>

<template>
    <div>
        <Card class="book">
            <div>
                <span class="book-title">《{{ bookTitle }}》</span>
            </div>
        </Card>
        <Card>
            <div class="op-top-box">
                <Uploader :path="`/api/words/upload?bookId=${bookId}`"
                    :show-upload-list="false"
                    :headers="headers"
                    :on-success="onUplaodSuccess"
                    :on-error="onUplaodError">
                    <Button icon="md-cloud-upload" type="primary">上传单词</Button>
                </Uploader>
                <Downloader :path="`/api/words/download?bookId=${bookId}&authorization=${encodeURIComponent(headers.Authorization)}`"
                    style="margin-left: 15px;">
                    <Button icon="md-cloud-download" type="primary">下载单词</Button>
                </Downloader>
                <Button @click="onCreateClick" style="margin-left: 15px;" type="primary">创建单词</Button>
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
                    <Button @click="onEditClick(row)" type="primary" size="small">编辑</Button>
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
            :width="800"
            v-model="editModalVisible"
            @on-cancel="editModalCancel">
            <template #header>
                <p>
                    <span>修改单词</span>
                </p>
            </template>
            <Form :label-width="100">
                <FormItem label="单词">
                    <div v-if="isCreateWord && continueCreateVisible">{{ updateData.word }}</div>
                    <Input v-else type="text" v-model="updateData.word" placeholder=""></Input>
                </FormItem>
                <FormItem label="音标 (英)">
                    <Input type="text" v-model="updateData.phoneticUK" placeholder=""></Input>
                </FormItem>
                <FormItem label="音标 (美)">
                    <Input type="text" v-model="updateData.phoneticUS" placeholder=""></Input>
                </FormItem>
                <FormItem label="释义">
                    <Input type="text" v-model="updateData.meaning" placeholder=""></Input>
                </FormItem>
                <FormItem label="章节">
                    <InputNumber type="text" v-model="updateData.chapter" placeholder=""></InputNumber>
                </FormItem>
            </Form>
            <div v-if="existsWordList.length" class="word-exists-tip">单词 {{ updateData.word }} 已存在</div>
            <Table v-if="existsWordList.length" :columns="existsWordColumns" :data="existsWordList" border></Table>
            <template #footer>
                <div>
                    <Button @click="editModalCancel">取消</Button>
                    <Button v-if="isCreateWord && continueCreateVisible" @click="editModalOK" type="primary">仍然创建</Button>
                    <Button v-if="isCreateWord && !continueCreateVisible" @click="createModalOK" type="primary">创建</Button>
                    <Button v-if="!isCreateWord" @click="editModalOK" type="primary">确定</Button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<style scoped>
.book {
    margin-bottom: 20px;
}

.book-title {
    font-size: 24px;
    font-weight: 700;
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

.word-exists-tip {
    line-height: 32px;
    color: #ff4747;
    text-align: center;
}
</style>