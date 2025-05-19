import axios from 'axios';
import ErrorCode from '../config/ErrorCode';
import config from '../config/config'

function getUrlPrefix() {
    if (location.hostname === 'localhost') {
        return 'http://localhost:' + config.serverPort;
    }
    return '';
}

function getResponse(res) {
    if (res.data && res.data.code === ErrorCode.INVALID_TOKEN) {
        localStorage.removeItem('token');
        location.href = '/login?code=' + ErrorCode.INVALID_TOKEN;
        return null;
    } else if (res.data && res.data.code === ErrorCode.TOKEN_EXPIRE) {
        localStorage.removeItem('token');
        location.href = '/login?code=' + ErrorCode.TOKEN_EXPIRE;
        return null;
    } else {
        return res.data;
    }
}

export default {
    get: async function(url, config) {
        url = getUrlPrefix() + url;
        config = config || {};
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json; charset=UTF-8';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        let res = await axios.get(url, config);
        return getResponse(res)
    },

    post: async function(url, data, config) {
        url = getUrlPrefix() + url;
        config = config || {};
        data = data || {};
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json; charset=UTF-8';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        let res = await axios.post(url, data, config)
        return getResponse(res)
    },

    put: async function(url, data, config) {
        url = getUrlPrefix() + url;
        config = config || {};
        data = data || {};
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json; charset=UTF-8';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        let res = await axios.put(url, data, config)
        return getResponse(res)
    },

    patch: async function(url, data, config) {
        url = getUrlPrefix() + url;
        config = config || {};
        data = data || {};
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json; charset=UTF-8';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        let res = await axios.patch(url, data, config)
        return getResponse(res)
    },

    delete: async function(url, config) {
        url = getUrlPrefix() + url;
        config = config || {};
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'application/json; charset=UTF-8';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        let res = await axios.delete(url, config)
        return getResponse(res)
    },
}