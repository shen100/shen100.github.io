import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes.js'

let routeList = [];
for (let i = 0; i < routes.length; i++) {
    if (routes[i].length) {
        routeList = routeList.concat(routes[i])
    } else {
        routeList.push(routes[i]);
    }
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routeList
})

export default router
