-- Drop the pg_bigm index on posts.message
DROP INDEX IF EXISTS idx_posts_message_bigm;

-- Note: We intentionally do NOT drop the pg_bigm and pg_trgm extensions
-- because they might be used by other indexes or functionality.
-- PostgreSQL extensions can be shared across the database, and dropping them
-- could break other features. If the extensions need to be removed,
-- it should be done manually by a database administrator after ensuring
-- no other dependencies exist.
