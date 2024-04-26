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
            filename: './database/pro.sqlite3'
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