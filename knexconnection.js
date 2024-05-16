const { app } = require('electron')
const path = require('path');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const env = 'dev';
let dbPath;

if (env === 'dev') {
    dbPath = path.join(__dirname, 'database', 'dev.sqlite3');
} else if (env === 'prod') {
    let databasePath = path.join(app.getPath('userData'), 'database');
    try {
        if (!fs.existsSync(databasePath)) {
            fs.mkdirSync(databasePath, { recursive: true });
        }
    } catch (err) {
        console.error('Error while creating database folder:', err);
    }
    dbPath = path.join(databasePath, 'prod.sqlite3');
} else {

}

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: dbPath
    },
    migrations: {
        tableName: 'migrations',
        directory: path.join(__dirname, 'database', 'migrations')
    },
    useNullAsDefault: true
});

ipc.on('get_data_structurized', async function (event, arg) {
    let columns = (typeof arg.columns === 'undefined') ? '*' : arg.columns;
    let filter = (typeof arg.filter === 'undefined') ? {} : arg.filter;
    let table = arg.table;
    event.returnValue = await knex.select(columns).from(table).where(filter);
});

// @params arg = {table: 'books', filter: {id: 12}, columns: {title: 'new book title'}}
ipc.on('update_data', async function (event, arg) {
    let columns = (typeof arg.columns === 'undefined') ? {} : arg.columns;
    let filter = (typeof arg.filter === 'undefined') ? {} : arg.filter;
    let table = arg.table;
    columns.updated_at = knex.fn.now();
    event.returnValue = await knex(table).where(filter).update(columns);
});

// @params arg = {table: 'books', columns: {title: 'book title'}}
ipc.on('insert_data', async function (event, arg) {
    let columns = arg.columns;
    let table = arg.table;
    columns.updated_at = knex.fn.now();
    event.returnValue = await knex(table).insert(columns, 'id');
})

async function asyncDbQuery(kenx) {
    let res = await kenx;
    return res
}

async function runMigrations() {
    console.log('Searching for migrations!');
    try {
        await knex.migrate.latest();
        console.log('Migrations done!');
    } catch (error) {
        console.error('Error while executing migrations: ', error);
    }
}

module.exports = {
    knex,
    asyncDbQuery,
    runMigrations
};