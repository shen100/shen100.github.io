import EnvUtil from '../utils/EnvUtil'

const config = {
    appName: '词汇记忆',
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