<script setup>
import { onMounted, ref, watch, defineProps, nextTick, computed, onBeforeUnmount } from "vue";

const props = defineProps(['contentUpdatedAt'])

let headElems = ref([])
let scrollTop = ref(0) // 获取文档滚动实时高度
let isTocFixed = ref(false);
let tocFixedRight = ref(0);
let topOffset = ref(60); // 滚动到的标题离窗口顶部的距离

const tocRootStyle = computed(() => {
    let maxHeight = headElems.value.length * 33 + 48;
    maxHeight = Math.min(maxHeight, 648);
    let styleData = {
        position: isTocFixed.value ? 'fixed' : 'static', 
        right: isTocFixed.value ? tocFixedRight.value + 'px' : '0', 
        'max-height': maxHeight + 'px',
        display: headElems.value.length ? '' : 'none'
    }
    return styleData
})

onMounted(() => {
    if (props.contentUpdatedAt) {
        nextTick(() => {
            initHeadElems();
        });
    }
    window.addEventListener('scroll', onWindowScroll);
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onWindowScroll);
})

function onWindowScroll() {
    scrollTop.value = window.pageYOffset; // 新浏览器用 window.scrollY
}

function initHeadElems() {
    let arr = Array.from(
        document.querySelectorAll('.chapter-content h1,h2,h3')
    );
    headElems.value = arr.map((d, index) => {
        let hNum = d.tagName.charAt(1);
        return {
            tagName: d.tagName,
            innerText: d.innerText,
            isH1: hNum === '1',
            isH2: hNum === '2',
            isH3: hNum === '3',
            isH4: hNum === '4',
            isH5: hNum === '5',
            isH6: hNum === '6',
            selected: index === 0,
            node: d
        };
    });
}

function setTocSelectItem() {
    for (let i = 0; i < headElems.value.length; i++) {
        headElems.value[i].selected = false;
    }
    let found = false;
    for (let i = headElems.value.length - 1; i >= 0; i--) {
        headElems.value[i].selected = false;
        let element = headElems.value[i].node;
        const elementTop = element.getBoundingClientRect().top;
        let absValue = Math.abs(elementTop - topOffset.value);
        if (elementTop <= topOffset.value || absValue < 1) {
            headElems.value[i].selected = true;
            found = true;
            break;
        }
    }
    if (!found && headElems.value.length) {
        headElems.value[0].selected = true;
    }
}

watch(() => props.contentUpdatedAt, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        nextTick(() => {
            initHeadElems();
        });
    }
});

watch(scrollTop, (newVal) => {
    if (newVal >= 20) {
        isTocFixed.value = true;
        let windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
        tocFixedRight.value = (windowWidth - 320 - 1100) / 2;
    } else {
        isTocFixed.value = false;
    }
    setTocSelectItem()
});

function scrollIntoView(element) {
    element = element.node;
    const elementTop = element.getBoundingClientRect().top;
    const scrollPosition = window.pageYOffset + elementTop - topOffset.value;
    window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth' // 可选，为了平滑滚动
    });
}
</script>

<template>
    <div class="toc-root" :style="tocRootStyle">
        <div class="toc-title">目录</div>
        <div class="toc">
            <ul>
                <li v-for="(item, index) in headElems"
                    :id="`toc-${index}`"
                    :class="{'item-1': item.isH1, 'item-2': item.isH2, 'item-3': item.isH3, 'item-4': item.isH4, 'toc-selected': item.selected }"
                    @click="scrollIntoView(item)">
                    {{ item.innerText }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style>
.toc-root {
    box-sizing: content-box;
    margin-left: 20px;
    background-color: #fff;
    width: 240px;
    right: 0;
}

.toc-title {
    font-weight: 500;
    margin: 0 10px;
    font-size: 16px;
    line-height: 32px;
    color: rgb(37, 41, 51);
    border-bottom: 1px solid rgb(228, 230, 235);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
}

.toc {
    /* transition: all 0.3s ease; */
    top: 80px;
    right: 0;
    border-left: 3px solid #fff;
    cursor: pointer;
    color: rgb(81, 87, 103);
    max-height: 600px;
    overflow-y: auto;
    background-color: #fff;

    ul {
        li {
            font-size: 14px;
            box-sizing: border-box;
            list-style: none;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            background: transparent;
            /* transition: all 0.5s ease; */
            padding: 2px 0px;
            border-left: 3px solid transparent;
            border-color: #fff;
            transform: translateX(-3px);
            font-family: -apple-system, system-ui, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial;
        }

        li:hover {
            color: #1e80ff;
            border-left: 3px solid #1e80ff;
        }

        .toc-selected {
            border-left: 3px solid #1e80ff;
            color: rgb(30, 128, 255)!important;
            font-weight: 600;
        }

        .item-1 {
            padding-left: 13px;
            color: rgb(37, 41, 51);
            padding-top: 6px;
            padding-bottom: 6px;
        }

        .item-2 {
            padding-left: 23px;
            color: rgb(81, 87, 103);
            padding-top: 6px;
            padding-bottom: 6px;
        }
        .item-3 {
            padding-left: 33px;
            color: rgb(138, 145, 159);
            padding-top: 6px;
            padding-bottom: 6px;
        }
        .item-4 {
            padding-left: 43px;
            color: rgb(138, 145, 159);
            opacity: 0.95;
            padding-top: 6px;
            padding-bottom: 6px;
        }
    }
}
</style>