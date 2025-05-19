export default {
    isLocal: function() {
        return location.hostname === 'localhost'
    },

    isDev: function() {
        return location.hostname.indexOf('dev-') === 0
    },

    isTest: function() {
        return location.hostname.indexOf('test-') === 0
    },

    isProd: function() {
        return !this.isLocal() && !this.isDev() && !this.isTest()
    },
}