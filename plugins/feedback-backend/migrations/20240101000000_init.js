// @ts-check

/**
 * Creates the `feedback` table. Works for both SQLite (dev, in-memory or
 * file-backed) and Postgres (prod) because we only use knex's portable
 * schema builder API below — no raw SQL.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('feedback', table => {
    table.uuid('id').primary().notNullable();

    // Type of feedback: 'general' (app-wide) or 'entity' (tied to a catalog entity)
    table.string('type').notNullable();

    // Populated only when type === 'entity'. Stored as the compound
    // entity ref, e.g. "component:default/my-service"
    table.string('entity_ref').nullable();

    // 1-5 star rating, optional (general feedback may be free text only)
    table.integer('rating').nullable();

    // Category, e.g. 'bug', 'suggestion', 'praise', 'docs', etc.
    table.string('category').notNullable().defaultTo('general');

    table.text('comment').nullable();

    // Identity of the submitter (Backstage user entity ref), nullable to
    // support anonymous feedback if the deployment allows it.
    table.string('created_by').nullable();

    table.string('status').notNullable().defaultTo('open'); // open | acknowledged | resolved | wontfix

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index(['type'], 'feedback_type_idx');
    table.index(['entity_ref'], 'feedback_entity_ref_idx');
    table.index(['status'], 'feedback_status_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('feedback');
};
