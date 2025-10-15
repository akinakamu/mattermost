-- Enable pg_trgm extension if not already enabled
-- This extension is commonly used for trigram-based text similarity search
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) THEN
    CREATE EXTENSION pg_trgm;
  END IF;
END;
$$
LANGUAGE plpgsql;

-- Enable pg_bigm extension if not already enabled
-- This extension provides bigram-based full-text search functionality
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_bigm'
  ) THEN
    CREATE EXTENSION pg_bigm;
  END IF;
END;
$$
LANGUAGE plpgsql;

-- Create a GIN index on posts.message using pg_bigm operator class
-- This index enables efficient full-text search using bigram matching
CREATE INDEX IF NOT EXISTS idx_posts_message_bigm ON posts USING gin (message gin_bigm_ops);
