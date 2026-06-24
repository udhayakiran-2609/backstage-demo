import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('banners', table => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.string('message').notNullable();
    table.string('variant').notNullable().defaultTo('info');
    table.string('badge').nullable();
    table.string('cta_label').nullable();
    table.string('cta_href').nullable();
    table.string('active_from').notNullable();
    table.string('active_to').notNullable();
    table.boolean('enabled').notNullable().defaultTo(true);
    table.timestamps(true, true); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('banners');
}