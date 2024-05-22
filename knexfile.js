// This file is required for the knex migrations.
const path = require('path');

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './database/dev.sqlite3'
        },
        migrations: {
            tableName: 'migrations',
            directory: './database/migrations'
        },
        seeds: {
            directory: './database/seeds'
        },
        useNullAsDefault: true
    },

    production: {
        client: 'sqlite3',
        connection: {
            // `userDataPath` should be `app.getPath('userData')` but we can not use `app` here!
            filename: path.join('userDataPath', 'database', 'prod.sqlite3')
        },
        migrations: {
            tableName: 'migrations',
            directory: './database/migrations'
        },
        seeds: {
            directory: './database/seeds'
        },
        useNullAsDefault: true
    }
};
