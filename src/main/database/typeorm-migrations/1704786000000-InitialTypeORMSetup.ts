import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial TypeORM migration - marks the starting point for TypeORM migrations
 * The existing schema is already in place, so this migration doesn't change anything
 */
export class InitialTypeORMSetup1704786000000 implements MigrationInterface {
    name = 'InitialTypeORMSetup1704786000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if we're starting fresh with TypeORM
        const typeormMigrationsTable = await queryRunner.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='typeorm_migrations'
        `);

        if (typeormMigrationsTable.length === 0) {
            console.log('TypeORM migrations table will be created automatically');
        }

        // Log current state
        console.log('TypeORM migration system initialized');
        console.log('Existing database schema preserved');
        
        // Future migrations will go here
        // Example:
        // await queryRunner.query(`ALTER TABLE supplier_returns ADD COLUMN new_field TEXT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Nothing to rollback for initial setup
        console.log('Rolling back to pre-TypeORM state (no changes needed)');
    }
}