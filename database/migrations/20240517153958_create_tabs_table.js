/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('tabs', function (t) {
        t.increments('id').unsigned().primary();
        t.string('page_title').notNull();
        t.string('page_uri').notNull();
        t.integer('tab_group_id').nullable().defaultTo(null);

        t.boolean('deleted').notNull().defaultTo(false);

        t.timestamp('created_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('deleted_at').nullable().defaultTo(null);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('tabs');
};
