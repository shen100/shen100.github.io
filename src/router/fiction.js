import FictionList from '../views/fictions/FictionList.vue'
import FictionEdit from '../views/fictions/FictionEdit.vue'
import ChapterEdit from '../views/fictions/ChapterEdit.vue'

export default [
    {
        path: '/fictions',
        name: 'fictionList',
        component: FictionList,
    },
    {
        path: '/fictions/edit',
        name: 'fictionEdit',
        component: FictionEdit,
    },
    {
        path: '/fictions/:fictionId/chapters',
        name: 'chapterEdit',
        component: ChapterEdit,
    }
]
