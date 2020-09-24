const config = require('./config/database.json');

module.exports = {
    development: {
        ...config
    },
    test: {
        ...config
    },
    production: {
        ...config
    }
}