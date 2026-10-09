-- PranaVeda baseline migration.
-- Establishes the Flyway chain and enables extensions required by upcoming
-- feature migrations (pg_trgm powers trigram fuzzy search for the public
-- yoga library: agents.md section 2.5). Safe to run repeatedly.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
