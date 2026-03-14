-- Run this in Neon SQL Editor to wipe the public schema, then run: npx prisma db push && npx prisma db seed
-- Neon: Dashboard → your DB → SQL Editor → paste and Run

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO neondb_owner;
GRANT ALL ON SCHEMA public TO public;
