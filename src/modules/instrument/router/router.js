import Ocarina from '../views/ocarina/ocarina.vue';
import Ocarina_1_to_5 from '../views/ocarina/1_to_5.vue';

const routeList = [
    {
        path: '/instrument/ocarina',
        name: 'ocarina',
        component: Ocarina,
    },
    {
        path: '/instrument/ocarina/1_to_5',
        name: 'ocarina_1_to_5',
        component: Ocarina_1_to_5,
    },
];

export default routeList
