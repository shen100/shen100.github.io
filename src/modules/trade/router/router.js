import Dashboard from '../views/dashboard.vue';
import Trans from '../views/trans.vue';
import Profit from '../views/profit.vue';
import My from '../views/my.vue';
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
    {
        path: '/trade/trans',
        name: 'tradeTrans',
        component: Trans,
    },
    {
        path: '/trade/profit',
        name: 'tradeProfit',
        component: Profit,
    },
    {
        path: '/trade/my',
        name: 'tradeMy',
        component: My,
    },
];

export default routeList
