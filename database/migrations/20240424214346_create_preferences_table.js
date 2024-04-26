/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('preferences', function (t) {
        t.increments('id').unsigned().primary();
        t.string('option_name').notNull();
        t.string('option_value').notNull();

        t.boolean('deleted').notNull().defaultTo(false);

        t.timestamp('created_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('deleted_at').nullable().defaultTo(null);
    }).then(function () {
        // Nachdem die Tabelle erstellt wurde, füge Standarddatensätze ein
        return knex('preferences').insert([
            { option_name: 'windowHeight', option_value: '600' },
            { option_name: 'windowWidth',  option_value: '800' },
            { option_name: 'latestURL',    option_value: '' },
            { option_name: 'firstRun',     option_value: 'false' },
            { option_name: 'language',     option_value: '' }
        ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('preferences');
};
