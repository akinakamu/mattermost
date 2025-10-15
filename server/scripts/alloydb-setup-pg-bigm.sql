-- SQL script to create and verify pg_bigm extension on AlloyDB
-- This script should be run with appropriate PostgreSQL user privileges

-- Create pg_bigm extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_bigm;

-- Verify the extension was created
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'pg_bigm';

-- Test pg_bigm functionality
SELECT show_bigm('test') AS bigm_test;

-- List all installed extensions for verification
SELECT extname, extversion, extrelocatable, extschema
FROM pg_extension
ORDER BY extname;
