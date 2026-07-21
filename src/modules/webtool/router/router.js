import Mergely from '../views/mergely.vue';
import Encryption from '../views/encryption.vue';
import CompIntCalc from '../views/compintcalc.vue';

const routeList = [
    {
        path: '/webtool/mergely',
        name: 'webToolMergely',
        component: Mergely,
    },
    {
        path: '/webtool/encryption',
        name: 'webToolEncryption',
        component: Encryption,
    },
    {
        path: '/webtool/compintcalc',
        name: 'webToolCompIntCalc',
        component: CompIntCalc,
    }
];

export default routeList
