import Dashboard from '../views/dashboard.vue';
import Trans from '../views/trans.vue';
import InvestedKCharts from '../views/invested_kcharts.vue';
import TrackedKCharts from '../views/tracked_kcharts.vue'
import StockCharts from '../views/stock_kcharts.vue'

const routeList = [
    {
        path: '/trade/dashboard',
        name: 'tradeDashboard',
        component: Dashboard,
    },
    {
        path: '/trade/trans',
        name: 'tradeTrans',
        component: Trans,
    },
    {
        path: '/trade/invested_kcharts',
        name: 'investedKCharts',
        component: StockCharts,
    },
    {
        path: '/trade/tracked_kcharts',
        name: 'trackedKCharts',
        component: StockCharts,
    },
    {
        path: '/trade/all_kcharts',
        name: 'allKCharts',
        component: StockCharts,
    },
    {
        path: '/trade/selected_kcharts',
        name: 'selectedKCharts',
        component: StockCharts,
    },
];

export default routeList
