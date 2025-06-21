import LoginView from '../views/LoginView.vue'
import dashboard from './dashboard.js'
import word from './word.js'
import fiction from './fiction.js'
import tradeRouter from '../trade/router/router'
import webToolRouter from '../webtool/router/router'
import docsRouter from '../modules/docs/router/router'

const routeList = [
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    dashboard,
    word,
    fiction,
    docsRouter,
    tradeRouter,
    webToolRouter
];

export default routeList
