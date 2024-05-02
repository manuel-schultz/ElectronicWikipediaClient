/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex('preferences').insert([
        { option_name: 'windowCoordinationX', option_value: '1' },
        { option_name: 'windowCoordinationY', option_value: '1' }
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex('preferences').whereIn('option_name', ['windowCoordinationX', 'windowCoordinationY']).del();
};
