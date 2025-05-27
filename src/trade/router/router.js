import Trans from '../views/trans.vue';
import InvestedKcharts from '../views/invested_kcharts.vue'

const routeList = [
    {
        path: '/trade/trans',
        name: 'tradeTrans',
        component: Trans,
    },
    {
        path: '/trade/invested_kcharts',
        name: 'investedKcharts',
        component: InvestedKcharts,
    },
];

export default routeList
