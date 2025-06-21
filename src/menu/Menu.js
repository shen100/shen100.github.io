import tradeMenu from '../trade/menu/menu.js'
import webToolMenu from '../webtool/menu/menu.js'
import docsMenu from '../modules/docs/menu/menu.js'

export default [
    {
        title: '游戏',
        icon: 'ios-game-controller-b',
        children: [
            { title: '文章管理' },
            { title: '评论管理' },
            { title: '举报管理' }
        ]
    },
    {
        title: '单词',
        icon: 'ios-cube',
        children: [
            {
                title: '单词书',
                path: '/books'
            },
        ]
    },
    {
        title: '阅读',
        icon: 'ios-book',
        children: [
            {
                title: '图书',
                path: '/fictions'
            },
        ]
    },
    {
        title: '用户',
        icon: 'ios-people',
        children: [
            { title: '新增用户' },
            { title: '活跃用户' }
        ]
    },
    docsMenu,
    tradeMenu,
    webToolMenu
]
