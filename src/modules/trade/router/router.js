import Dashboard from '../views/dashboard.vue';
import Trans from '../views/trans.vue';
import Profit from '../views/profit.vue';
import My from '../views/my.vue';
import StockCharts from '../views/stock_kcharts.vue';
import BuyPointCalculator from '../views/buy_point_calculator.vue';
import BuyPointCalculatorDetail from '../views/buy_point_calculator_detail.vue';

const routeList = [
    {
        path: '/trade/dashboard',
        name: 'tradeDashboard',
        component: Dashboard,
    },
    {
        path: '/trade/all_kcharts',
        name: 'allKCharts',
        component: StockCharts,
    },
    {
        path: '/trade/etf_kcharts',
        name: 'etfKCharts',
        component: StockCharts,
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
        path: '/trade/selected_kcharts',
        name: 'selectedKCharts',
        component: StockCharts,
    },
    {
        path: '/trade/buy_point_calculator',
        name: 'buyPointCalculator',
        component: BuyPointCalculator,
    },
    {
        path: '/trade/buy_point_calculator_detail',
        name: 'buyPointCalculatorDetail',
        component: BuyPointCalculatorDetail,
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
