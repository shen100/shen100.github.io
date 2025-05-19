<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import config from '../../config/config'
import EnvUtil from '../../utils/EnvUtil'
import HttpUtil from '../../utils/HttpUtil.js'
import { parseTree } from '../../utils/TreeUtil.js'
import { resolveComponent } from 'vue'
import zh from 'bytemd/locales/zh_Hans.json'
import gfm from '@bytemd/plugin-gfm'
import { Editor, Viewer } from '@bytemd/vue-next'
import 'juejin-markdown-themes/dist/juejin.min.css'

const editorPlugins = [
    gfm(),
    // Add more plugins here
]

const route = useRoute()
const router = useRouter()

const buttonProps = {
    type: 'default',
    shape: 'circle',
    size: 'small',
}

let plugins = ref(editorPlugins)
let zhHans = ref(zh)
let chapterPageUrl = ref(EnvUtil.isLocal() ? 'http://localhost:5174/chapters/': '/pc_h5.html?id=')
let fictionId = ref(0)
let fictionTitle = ref('')

let treeData = ref([])
let chapterId = ref('') // 当前选中的章节ID
let chapterTitle = ref('') // 当前选中的章节标题
let text = ref('') // 编辑器里的内容
let addChapterModal = ref(false) // 是否显示添加章节的弹框
let delChapterModal = ref(false) // 是否显示删除章节的弹框
let editChapterTitleModalVisible = ref(false) // 是否显示编辑章节标题的弹框
let chapterTitleInModal = ref('') // 弹框里的章节标题
let chapterTreeMap = {};

onMounted(async () => {
    fictionId.value = parseInt(route.params.fictionId);
    let url = '/api/fictions/' + fictionId.value;
    try {
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        fictionTitle.value = res.data.title
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
        return;
    }
    requestChapters();
})

function renderContent(h, { root, node, data }) {
    return h('span', 
        {
            class: data.isSelect ? [ 'chapter-tree-title-selected' ] : [ ],
            style: { display: 'inline-block', width: '100%', cursor: 'pointer' },
            onClick: () => { onTreeSelectClick(root, node, data) }
        }, 
        [
            h('span', 
                [
                    h(resolveComponent('Icon'),
                        {
                            type: data.children && data.children.length ? 'ios-folder-open-outline' : 'ios-paper-outline',
                            style: { marginRight: '8px' }
                        }
                    ),
                    h('span', data.title)
                ]
            ),
            h('span', 
                {
                    style: { display: 'inline-block', float: 'right', marginRight: '32px' },
                }, 
                [
                    h(resolveComponent('Button'), 
                        {
                            ...buttonProps,
                            icon: 'md-create',
                            style: {
                                marginRight: '8px'
                            },
                            onClick: () => { onUpdateChapterTitleClick(data) }
                        }
                    ),
                    h(resolveComponent('Button'), 
                        {
                            ...buttonProps,
                            icon: 'ios-add',
                            style: {
                                marginRight: '8px'
                            },
                            onClick: () => { onAddChapterClick(data) }
                        }
                    ),
                    h(resolveComponent('Button'), 
                        {
                            ...buttonProps,
                            icon: 'ios-remove',
                            onClick: () => { onDelChapterClick(data) }
                        }
                    )
                ]
            )
        ]
    );
}

function onTreeSelectClick(root, node, data) {
    chapterId.value = data.id
    chapterTitle.value = data.title
    text.value = data.content || ''
    selectTree(treeData.value)
    treeData.value = treeData.value.slice(0)
}

function onUpdateChapterTitleClick(data) {
    chapterId.value = data.id
    chapterTitle.value = data.title
    text.value = data.content || ''
    selectTree(treeData.value)
    treeData.value = treeData.value.slice(0)
    chapterTitleInModal.value = chapterTitle.value
    editChapterTitleModalVisible.value = true
}

function onAddChapterClick(data) {
    chapterId.value = data.id
    chapterTitle.value = data.title
    text.value = data.content || ''
    chapterTitleInModal.value = ''
    addChapterModal.value = true
    selectTree(treeData.value)
    treeData.value = treeData.value.slice(0)
}

function selectTree(tree) {
    if (!tree || tree.length <= 0) {
        return
    }
    for (let i = 0; i < tree.length; i++) {
        if (tree[i].id === chapterId.value) {
            tree[i].isSelect = true
        } else {
            tree[i].isSelect = false
        }
        selectTree(tree[i].children)
    }
}

// 直接添加图书的章节，即没有父章节, 把当前选中的 chapterId 设置为空
function onAddChapter() {
    chapterId.value = ''
    chapterTitle.value = ''
    chapterTitleInModal.value = ''
    addChapterModal.value = true
    selectTree(treeData.value)
    treeData.value = treeData.value.slice(0)
}

function onDelChapterClick(data) {
    chapterId.value = data.id
    chapterTitle.value = data.title
    text.value = data.content || ''
    delChapterModal.value = true
    selectTree(treeData.value)
    treeData.value = treeData.value.slice(0)
}

function castTreeToMap(tree) {
    if (!tree || tree.length <= 0) {
        return
    }
    for (let i = 0; i < tree.length; i++) {
        chapterTreeMap[tree[i].id] = tree[i]
        castTreeToMap(tree[i].children)
    }
}

async function requestChapters() {
    let url = `/api/fictions/${fictionId.value}/chapters`;
    try {
        let res = await HttpUtil.get(url);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        chapterTreeMap = {}
        let children = []
        res.data.list.forEach(item => {
            item.id = item._id
            item.expand = true
            if (item.id === chapterId.value) {
                item.isSelect = true
                chapterTitle.value = item.title
            } else {
                item.isSelect = false
            }
        });
        children = parseTree(res.data.list, {
            titleKey: 'title',
            dataKeys: [ 'expand', 'isSelect', 'content' ]
        })
        treeData.value = children || []
        castTreeToMap(treeData.value)
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function onTextChange(v) {
    text.value = v
}

async function addChapterModalOK() {
    let url = `/api/fictions/${fictionId.value}/chapters`;
    try {
        let res = await HttpUtil.post(url, {
            title: chapterTitleInModal.value,
            parentId: chapterId.value
        });
        addChapterModal.value = false
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        chapterId.value = res.data._id
        await requestChapters();
        chapterTitle.value = chapterTreeMap[chapterId.value].title
    } catch (err) {
        addChapterModal.value = false
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function addChapterModalCancel() {
    addChapterModal.value = false
}

async function deleteChapterOK() {
    let url = `/api/chapters/${chapterId.value}`;
    try {
        let res = await HttpUtil.delete(url);
        delChapterModal.value = false
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
        await requestChapters();
    } catch (err) {
        delChapterModal.value = false
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function deleteChapterCancel() {
    delChapterModal.value = false
}

async function editChapterTitleModalOK() {
    let url = `/api/chapters/${chapterId.value}`;
    try {
        let reqData = {
            title: chapterTitleInModal.value,
            content: text.value,
        }
        
        let res = await HttpUtil.patch(url, reqData);
        editChapterTitleModalVisible.value = false
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        chapterTreeMap[chapterId.value].title = chapterTitleInModal.value
        Message.success({
            duration: 10,
            content: '修改成功'
        });
    } catch (err) {
        editChapterTitleModalVisible.value = false
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}

function editChapterTitleModalCancel() {
    editChapterTitleModalVisible.value = false
}

async function onSaveChapter() {
    let url = `/api/chapters/${chapterId.value}`;
    try {
        let reqData = {
            title: chapterTreeMap[chapterId.value].title,
            content: text.value,
        }
        
        let res = await HttpUtil.patch(url, reqData);
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        chapterTreeMap[chapterId.value].content = text.value
        Message.success({
            duration: 10,
            content: '保存成功'
        });
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
    }
}
</script>

<template>
    <Card>
        <div class="book-title-box">
            <div class="book-title">{{ fictionTitle }}</div>
            <div>
                <Button type="primary" @click="onAddChapter">添加章节</Button>
            </div>
            <div class="book-title-box-spacer"></div>
            <div>
                <a :href="`${chapterPageUrl}${chapterId}`" target="_blank" class="chapter-title">{{ chapterTitle }}</a>
                <Button type="primary" @click="onSaveChapter">保存章节内容</Button>
            </div>
        </div>
        <div class="chapter-editor-root">
            <div class="chapter-editor-side-tree">
                <Tree :data="treeData" :render="renderContent" class="chapter-side-tree-render"></Tree>
            </div>
            <div class="chapter-editor-main-box">
                <Editor :locale="zhHans" :value="text" :plugins="plugins" @change="onTextChange" />
            </div>
        </div>
        <Modal
            v-model="addChapterModal"
            @on-ok="addChapterModalOK"
            @on-cancel="addChapterModalCancel">
            <template #header>
                <p>
                    <span v-if="chapterId">添加 {{chapterTitle}} 的子章节</span>
                    <span v-else>添加章节</span>
                </p>
            </template>
            <Form :label-width="100">
                <FormItem label="标题">
                    <Input type="text" v-model="chapterTitleInModal" placeholder="请输入标题"></Input>
                </FormItem>
            </Form>
        </Modal>
        <Modal
            v-model="editChapterTitleModalVisible"
            @on-ok="editChapterTitleModalOK"
            @on-cancel="editChapterTitleModalCancel">
            <template #header>
                <p>
                    <span>修改章节标题</span>
                </p>
            </template>
            <Form :label-width="100">
                <FormItem label="标题">
                    <Input type="text" v-model="chapterTitleInModal" placeholder="请输入标题"></Input>
                </FormItem>
            </Form>
        </Modal>
        <Modal
            v-model="delChapterModal"
            @on-ok="deleteChapterOK"
            @on-cancel="deleteChapterCancel">
            <template #header>
                <p style="color:#ed4014;">
                    <Icon type="ios-information-circle"></Icon>
                    <span>删除</span>
                </p>
            </template>
            <div>确定要删除 <em class="delete-book-title">{{chapterTitle}}</em>?</div>
        </Modal>
    </Card>
</template>

<style>
.bytemd {
    height: calc(100vh - 200px);
}

.chapter-editor-root {
    display: flex;
}

.chapter-editor-side-tree {
    width: 300px;
    padding: 10px;
    padding-top: 0;
    margin-right: 10px;
}

.chapter-editor-main-box {
    flex: 1;
}

.chapter-side-tree-render .ivu-tree-title {
    width: 100%;
}

.book-title-box {
    border-bottom: 1px #d9d9d9 solid;
    display: flex;
    margin-bottom: 15px;
    padding-bottom: 10px;
}

.book-title {
    font-size: 20px;
    font-weight: 700;
    margin-right: 10px;
}

.book-title-box-spacer {
    flex: 1;
}

.chapter-title {
    display: inline-block;
    vertical-align: top;
    line-height: 32px;
    margin-right: 20px;
    font-size: 18px;
}

.ivu-tree-title-selected, .ivu-tree-title:hover {
    background-color: #fff!important;
}

.ivu-tree-title {
    cursor: default!important;
}

.chapter-tree-title-selected {
    background-color: #d5e8fc;
}

.bytemd-fullscreen.bytemd {
    z-index: 1001;
}
</style>