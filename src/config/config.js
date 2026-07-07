import EnvUtil from '../utils/EnvUtil'

const config = {
    appName: 'shen100',
    serverPort: 9999,
}

const testConfig = {
}

if (EnvUtil.isTest()) {
    for (let key in testConfig) {
        config[key] = testConfig[key]
    }
}

export default config