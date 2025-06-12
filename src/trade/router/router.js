import Trans from '../views/trans.vue';
import InvestedKCharts from '../views/invested_kcharts.vue';
import AllStocKCharts from '../views/all_stock_kcharts.vue'

const routeList = [
    {
        path: '/trade/trans',
        name: 'tradeTrans',
        component: Trans,
    },
    {
        path: '/trade/invested_kcharts',
        name: 'investedKcharts',
        component: InvestedKCharts,
    },
    {
        path: '/trade/all_kcharts',
        name: 'allKcharts',
        component: AllStocKCharts,
    },
];

export default routeList
