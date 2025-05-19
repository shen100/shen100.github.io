import LoginView from '../views/LoginView.vue'
import dashboard from './dashboard.js'
import word from './word.js'
import fiction from './fiction.js'

const routeList = [
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    dashboard,
    word,
    fiction
];

export default routeList
