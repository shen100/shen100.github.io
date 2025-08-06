
<template>
    <div class="book-section" :class="{'book-section-fold': !sidebarVisible}">
        <div class="book-summary">
            <div class="book-summary-inner">
                <div class="toggle-btn">
                    <ToggleBtn @click="onToggleBtnClick" style="cursor: pointer;"/>
                </div>
                <div class="book-summary__header">
                    <a href="/docs" class="logo">
                        <img class="logo-dark" src="../../../assets/img/logo-small.png">
                        <span>Docs</span>
                    </a>
                </div>
                <div class="book-directory-comp book-directory">
                    <div class="section-list">
                        <a @click="onCurChapterChange(c._id)" :key="i" v-for="(c, i) in treeData" class="section" :class="{'route-active': chapterId === c._id}">
                            {{ chapterId }} {{ c._id }}
                            <div class="center">
                                <div class="main-line">
                                    <div class="title">
                                        <span class="title-text">{{ c.title }}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="book-content">
            <div v-if="!accessNotAllowed" class="book-content-inner">
                <div class="book-content__header">
                    <div class="title">
                        <a href="">{{ bookTitle }}</a>
                    </div>
                </div>
                <div v-if="!isLoading && content" class="chapter-root">
                    <div style="margin: 0 auto; width: 1100px;display: flex;">
                        <div class="chapter-content">
                            <Viewer id="markdown-body" :value="content" :plugins="plugins" />
                        </div>
                        <Toc :contentUpdatedAt="contentUpdatedAt"/>
                    </div>

                </div>
                <div v-if="content && !isLoading" class="prev-next-box">
                    <div class="prev-next-box-innerbox">
                        <button @click="onPrevChapter" type="button" class="prev-btn byte-btn" :class="{'prev-next-disabled': !hasPrevChapter}">
                            <span>
                                <div class="content">
                                    <img src="../../../assets/img/docs/prev.svg">
                                    <span class="text">上一篇</span>
                                </div>
                            </span>
                        </button>
                        <button @click="onNextChapter" type="button" class="next-btn byte-btn" :class="{'prev-next-disabled': !hasNextChapter}">
                            <span>
                                <div class="content">
                                    <span class="text">下一篇</span> 
                                    <img src="../../../assets/img/docs/next.svg">
                                </div>
                            </span>
                        </button>
                    </div>
                </div>
                <div v-if="isLoading" class="loading-box">
                    <div class="circular">
                        <LoadingIcon />
                    </div>
                </div>
            </div>
            <div v-else class="access-not-allowed">
                没有权限访问此文档
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from 'view-ui-plus'
import Header from './components/Header.vue'
import Toc from './components/Toc.vue'
import ToggleBtn from './components/ToggleBtn.vue'
import LoadingIcon from './components/LoadingIcon.vue'
import { parseTree } from '../util/TreeUtil.js'
import { resolveComponent } from 'vue'
import zh from 'bytemd/locales/zh_Hans.json'
import { Editor, Viewer } from '@bytemd/vue-next'
import { encryptData, decryptData } from '../util/SecurityUtil'
import breaks from '@bytemd/plugin-breaks'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import frontmatter from '@bytemd/plugin-frontmatter'
import theme from '../bytemd/plugin-theme';
// import 'juejin-markdown-themes/dist/juejin.min.css';
import 'highlight.js/styles/default.css'
import 'katex/dist/katex.min.css'

const editorPlugins = [
    breaks(),
    frontmatter(),
    gemoji(),
    gfm(),
    highlight(),
    math(),
    mediumZoom(),
    mermaid(),
    theme({
        theme: 'github', // 默认掘金主题
        highlight: 'github' // 默认代码高亮样式
    })
]

const route = useRoute()
const router = useRouter()

let plugins = ref(editorPlugins)
let bookId = ref(0)
let bookTitle = ref('')
let treeData = ref([])
let chapterId = ref(0)
let content = ref('')
let sidebarVisible = ref(true)
let chapterTreeMap = {}
let contentUpdatedAt = ref(0)
let isLoading = ref(true)
let accessNotAllowed = ref(false)

const hasPrevChapter = computed(() => {
    let found = false
    for (let i = 0; i < treeData.value.length; i++) {
        if (treeData.value[i].id === chapterId.value) {
            if (treeData.value[i - 1]) {
                found = true
            }
            break;
        }
    }
    return found
})

const hasNextChapter = computed(() => {
    let found = false
    for (let i = 0; i < treeData.value.length; i++) {
        if (treeData.value[i].id === chapterId.value) {
            if (treeData.value[i + 1]) {
                found = true
            }
            break;
        }
    }
    return found
})

onMounted(async () => {
    bookId.value = route.params.id || 0
    if (route.query.chapterId) {
        chapterId.value = parseInt(route.query.chapterId) || 0
    }
    if (route.params.chapterId) {
        chapterId.value = parseInt(route.params.chapterId) || 0
    }
    requestBook()
})

function onToggleBtnClick() {
    sidebarVisible.value = !sidebarVisible.value
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

async function requestBook() {
    let url = `/data/docs/${bookId.value}/info.json`;
    try {
        let res = await axios.get(url);
        res = res.data;
        if (res.code !== 0) {
            Message.error({
                duration: 10,
                content: res.message
            });
            return
        }
        if (!res.data) {
            accessNotAllowed.value = true
            return
        }
        bookTitle.value = res.data.title
        if (chapterId.value) {
            requestChapter()
        }

        setChapters(res);
    } catch (err) {
        console.error(err);
        Message.error({
            duration: 10,
            content: err.message
        });
        return;
    }
}

async function setChapters(res) {
    chapterTreeMap = {}
    let children = [];
    res.data.list.reverse();
    res.data.list.forEach(item => {
        item.id = item._id
        item.expand = true
        if (item.id === chapterId.value) {
            item.isSelect = true
        } else {
            item.isSelect = false
        }
    });
    children = parseTree(res.data.list, {
        titleKey: 'title',
        dataKeys: [ 'expand', 'isSelect', 'content', '_id' ]
    })
    treeData.value = children || []
    castTreeToMap(treeData.value)

    // 地址栏没传 chapterId 就取第一篇文章
    if (!chapterId.value && treeData.value && treeData.value.length) {
        chapterId.value = treeData.value[0].id
        requestChapter()
    }
}

async function requestChapter() {
    isLoading.value = true
    let url = `/data/docs/${bookId.value}/chapter/${chapterId.value}.md`;
    try {
        let res = await axios.get(url);
        let mdContent = res.data || ' ';

        const lineCount = mdContent.split(/\n/).length;
        if (lineCount <= 2) {
            const webToolPassword = localStorage.getItem('webToolPassword');
            if (webToolPassword) {
                mdContent = await decryptData(mdContent, webToolPassword);
                mdContent = mdContent + '\n\n> 此文档已加密';
                console.log('decrypted content', mdContent);
            }
        }

        content.value = mdContent;
        isLoading.value = false
        contentUpdatedAt.value = new Date().getTime();
    } catch (err) {
        console.error(err);
    }
}

function onCurChapterChange(id) {
    chapterId.value = id
    requestChapter()
    router.push({ path: `/docs/${bookId.value}/chapter/${id}` })
}

function onPrevChapter() {
    for (let i = 0; i < treeData.value.length; i++) {
        if (treeData.value[i].id === chapterId.value) {
            if (treeData.value[i - 1]) {
                onCurChapterChange(treeData.value[i - 1].id)
            }
            break;
        }
    }
}

function onNextChapter() {
    for (let i = 0; i < treeData.value.length; i++) {
        if (treeData.value[i].id === chapterId.value) {
            if (treeData.value[i + 1]) {
                onCurChapterChange(treeData.value[i + 1].id)
            }
            break;
        }
    }
}

</script>

<style>
#app-root {
    height: auto!important;
}

.book-section {
    font-size: 0;
}

.book-summary {
    width: 320px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    cursor: default;
    flex-shrink: 0;
    z-index: 11;
    border-right: 1px solid rgb(228, 230, 235);
    transition: all .3s cubic-bezier(.4,0,.2,1);
    will-change: left;
}

.book-section-fold .book-summary {
    left: -306px;
    border-right: 14px solid rgb(255, 255, 255);
}

.book-summary .book-summary-inner {
    transition: all .3s cubic-bezier(.4,0,.2,1);
    background-color: rgb(255, 255, 255);
    position: relative;
    z-index: 1;
    height: 100%;
}

.book-summary .book-summary-inner .toggle-btn {
    width: 28px;
    height: 28px;
    transform: rotateY(180deg);
    position: absolute;
    right: -17px;
    top: 100px;
    transition: all .3s;
    z-index: 1000;
    color: rgb(51, 51, 51);
}

.book-section-fold .toggle-btn {
    right: -28px!important;
    transform: rotate(0)!important;
}

.book-summary .book-summary-inner .book-summary__header {
    height: 60px;
    display: flex;
    padding-left: 16px;
    align-items: center;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(228, 230, 235);
}

.book-summary .book-summary-inner .book-summary__header .logo {
    height: 36px;
    cursor: pointer;
    text-decoration: none;
}

.book-summary .book-summary-inner .book-summary__header .logo img {
    width: 36px;
    height: 36px;
}

.book-summary .book-summary-inner .book-summary__header .logo span {
    display: inline-block;
    vertical-align: top;
    line-height: 36px;
    color: #000;
    padding-left: 6px;
    font-weight: 700;
    font-size: 20px;
}

.book-content {
    width: 100%;
    padding-top: 80px;
    padding-left: 320px;
    transition: all .3s cubic-bezier(.4,0,.2,1);
}

.book-section-fold .book-content {
    padding-left: 0;
}

.book-content .book-content-inner {
    position: relative;
}

.book-content .book-content-inner .book-content__header {
    position: fixed;
    top: 0;
    right: 0;
    left: 319px;
    min-width: 320px;
    background-color: rgb(255, 255, 255);
    z-index: 200;
    border-bottom: 1px solid rgb(228, 230, 235);
    height: 60px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
    transition: all .3s cubic-bezier(.4,0,.2,1);
    font-size: 18px;
}

.book-section-fold .book-content .book-content-inner .book-content__header {
    left: 0;
}

.book-content .book-content-inner .book-content__header .title {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 700;
}

.book-content .book-content-inner .book-content__header .title a {
    cursor: pointer;
    text-decoration: none;
    color: rgb(37, 41, 51);
}

.book-summary .book-summary-inner .book-directory {
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
    height: calc(100% - 180px);
    color: #fff;
    padding: 18px 0;
}

.book-directory-comp .section-list {
    width: 320px;
}

.book-directory-comp .section-list .section {
    position: relative;
    display: flex;
    justify-content: flex-start;
    transition: all .2s;
    padding: 9px 16px;
    cursor: pointer;
}

.book-directory-comp .section-list .section.route-active:after {
    content: "";
    position: absolute;
    width: 4px;
    height: 24px;
    left: 0;
    top: 9px;
    background: rgb(30, 128, 255);
    border-radius: 0 8px 8px 0;
}

.book-directory-comp .section-list .section .center {
    flex-grow: 1;
    margin-left: auto;
    margin-right: auto;
}

.book-directory-comp .section-list .section .center .main-line {
    font-size: 15px;
    line-height: 24px;
    display: flex;
}

.book-directory-comp .section-list .section.route-active .center .main-line .title, .book-directory-comp .section-list .section.route-active .left .index {
    color: rgb(30, 128, 255);
    font-size: 0;
    flex: 1;
}

.book-directory-comp .section-list .section .center .main-line .title .title-text {
    color: rgb(37, 41, 51);
    cursor: pointer;
    display: inline;
    font-family: -apple-system, system-ui, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial;
    font-size: 16px;
    height: auto;
    line-height: 24px;
    text-rendering: optimizelegibility;
    text-size-adjust: 100%;
    vertical-align: bottom;
    width: auto;
    word-break: break-word;
    -webkit-font-smoothing: auto;
}

.section.route-active .title-text {
    color: rgb(30, 128, 255)!important;
}

.book-directory-comp .section-list .section .center .sub-line {
    display: flex;
    align-items: center;
    margin-top: 6px;
    font-size: 13px;
    color: rgb(138, 145, 159);
    line-height: 24px;
    -webkit-font-smoothing: auto;
}

.chapter-root {
    position: relative;
}

.chapter-content {
    max-width: 840px;
    width: 100%;
    background: #fff;
    padding: 32px;
    font-family: -apple-system, system-ui, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial !important;
}

.prev-next-box {
    margin: 0 auto;
    width: 100%;
    max-width: 1100px;
}

.prev-next-box-innerbox {
    width: 840px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-top: 50px;
    padding-bottom: 50px;
    background-color: #fff;
}

.prev-next-box .byte-btn {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    border: 1px solid #e6e8eb;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    line-height: 1.5;
    padding: 0 14px;
    color: #282f38;
    font-size: 14px;
    -webkit-transition: all .3s linear;
    transition: all .3s linear;
    width: 120px;
    height: 40px;
    border-radius: 4px;
    border-color: rgba(30, 128, 255, 0.3);
    background-color: rgba(30, 128, 255, 0.05);
    margin-right: 40px;
}

.byte-btn>span {
    vertical-align: middle;
    line-height: 1;
}

.prev-next-box .content {
    justify-content: flex-start;
    display: flex;
    height: 100%;
    align-items: center;
}

.prev-next-box img {
    width: 12px;
    height: 12px;
    margin-right: 16px;
}

.prev-next-box .next-btn img {
    margin-left: 16px;
    margin-right: 0;
}

.prev-next-box .text {
    color: rgb(30, 128, 255);
}

.prev-next-box .next-btn {
    margin-right: 0;
}

.prev-next-box .next-btn .content {
    justify-content: flex-end;
}

.prev-next-disabled {
    opacity: 0.5;
    cursor: not-allowed!important;
}

.loading-box {
    max-width: 840px;
    width: 100%;
    margin: 0 auto;
    padding-top: 300px;
    display: flex;
    justify-content: center;
    -webkit-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
}

.loading-box .circular {
    width: 30px;
    height: 30px;
    vertical-align: top;
    -webkit-animation: loading-rotate 1s linear infinite;
    animation: loading-rotate 1s linear infinite;
}

.loading-box .circular svg {
    width: 100%;
    height: 100%;
    fill: #3370ff;
    pointer-events: none;
    line-height: 1;
    font-size: 12px;
    font-style: italic;
}

@keyframes loading-rotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.medium-zoom-overlay {
    background: rgb(0 0 0)!important;
    z-index: 2000!important;
}

.medium-zoom-image--opened {
    z-index: 2000;
}

.access-not-allowed {
    font-size: 30px;
    text-align: center;
    padding-top: 200px;
}
</style>