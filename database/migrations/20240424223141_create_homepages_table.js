/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('homepages', function (t) {
        t.increments('id').unsigned().primary();
        t.string('iso').notNull();
        t.string('long_name_en').notNull();
        t.string('long_name_de').notNull();
        t.string('homepage_uri').notNull();

        t.boolean('deleted').notNull().defaultTo(false);

        t.timestamp('created_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('updated_at').notNull().defaultTo(knex.fn.now());
        t.timestamp('deleted_at').nullable().defaultTo(null);
    }).then(function () {
        // Nachdem die Tabelle erstellt wurde, füge Standarddatensätze ein
        return knex('homepages').insert([
            { iso: '',   long_name_en: 'Don\'t ask Questions', long_name_de: 'Keine Angabe', homepage_uri: 'https://wikipedia.org' },
            { iso: 'de', long_name_en: 'German',               long_name_de: 'Deutsch',      homepage_uri: 'https://de.wikipedia.org/wiki/Wikipedia:Hauptseite' },
            { iso: 'en', long_name_en: 'English',              long_name_de: 'Englisch',     homepage_uri: 'https://en.wikipedia.org/wiki/Main_Page' },
            { iso: 'es', long_name_en: 'Spanish',              long_name_de: 'Spanisch',     homepage_uri: 'https://es.wikipedia.org/wiki/Wikipedia:Portada' },
            { iso: 'it', long_name_en: 'Italian',              long_name_de: 'Italienisch',  homepage_uri: 'https://it.wikipedia.org/wiki/Pagina_principale' },
            { iso: 'fr', long_name_en: 'French',               long_name_de: 'Französisch',  homepage_uri: 'https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal' },
            { iso: 'ru', long_name_en: 'Russian',              long_name_de: 'Russisch',     homepage_uri: 'https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0' }
        ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('homepages');
};
