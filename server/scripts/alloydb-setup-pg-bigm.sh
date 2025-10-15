#!/bin/bash
# Script to connect to AlloyDB and setup pg_bigm extension
# This script is meant to be run from GitHub Actions

set -e

# Check required environment variables
if [ -z "$ALLOYDB_INSTANCE" ]; then
    echo "Error: ALLOYDB_INSTANCE environment variable is not set"
    exit 1
fi

if [ -z "$PGUSER" ]; then
    echo "Error: PGUSER environment variable is not set"
    exit 1
fi

if [ -z "$PGPASSWORD" ]; then
    echo "Error: PGPASSWORD environment variable is not set"
    exit 1
fi

if [ -z "$PGDATABASE" ]; then
    echo "Warning: PGDATABASE not set, using default 'mattermost'"
    export PGDATABASE="mattermost"
fi

# Set PostgreSQL connection parameters
export PGHOST="localhost"
export PGPORT="5432"

echo "=========================================="
echo "AlloyDB pg_bigm Extension Setup"
echo "=========================================="
echo "Instance: ${ALLOYDB_INSTANCE}"
echo "Database: ${PGDATABASE}"
echo "User: ${PGUSER}"
echo "=========================================="

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SQL_FILE="${SCRIPT_DIR}/alloydb-setup-pg-bigm.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file not found at ${SQL_FILE}"
    exit 1
fi

echo "Starting Cloud SQL Proxy..."
cloud-sql-proxy "${ALLOYDB_INSTANCE}" --port ${PGPORT} &
PROXY_PID=$!

# Wait for proxy to be ready
echo "Waiting for Cloud SQL Proxy to initialize..."
sleep 10

# Check if proxy is still running
if ! ps -p $PROXY_PID > /dev/null; then
    echo "Error: Cloud SQL Proxy failed to start"
    exit 1
fi

echo "Cloud SQL Proxy is running (PID: ${PROXY_PID})"

# Execute the SQL script
echo ""
echo "Executing SQL script: ${SQL_FILE}"
echo "=========================================="

if psql -f "$SQL_FILE"; then
    echo "=========================================="
    echo "✓ pg_bigm extension setup completed successfully"
    EXIT_CODE=0
else
    echo "=========================================="
    echo "✗ Failed to setup pg_bigm extension"
    EXIT_CODE=1
fi

# Cleanup: Stop Cloud SQL Proxy
echo ""
echo "Stopping Cloud SQL Proxy..."
kill $PROXY_PID 2>/dev/null || true
wait $PROXY_PID 2>/dev/null || true

echo "Cleanup completed"
exit $EXIT_CODE
