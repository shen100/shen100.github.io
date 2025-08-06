import Mergely from '../views/mergely.vue';
import Encryption from '../views/encryption.vue';

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
    }
];

export default routeList
