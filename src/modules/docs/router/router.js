import All from '../views/All.vue';
import Chapter from '../views/Chapter.vue';

const routeList = [
    {
        path: '/docs',
        name: 'docsAll',
        component: All,
    },
    {
        path: '/docs/:id/chapter/:chapterId',
        name: 'docsChapter',
        component: Chapter,
    },
];

export default routeList
