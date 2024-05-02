const path = require('path');
const ipc = require('electron').ipcMain;

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, 'database', 'dev.sqlite3')
    },
    migrations: {
        tableName: 'migrations',
        directory: './database/migrations'
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