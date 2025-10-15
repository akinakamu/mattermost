# AlloyDB pg_bigm Extension Setup

This document explains how to use the AlloyDB pg_bigm extension setup workflow.

## Overview

The `alloydb-pg-bigm-setup.yml` workflow automates the process of connecting to Google Cloud AlloyDB and installing the pg_bigm extension for PostgreSQL. The pg_bigm extension provides full-text search capabilities using bigram (2-gram) indexes, which is particularly useful for searching text in languages like Japanese, Chinese, and Korean.

## Prerequisites

### 1. Google Cloud Setup

You need to have:
- A Google Cloud Project with AlloyDB enabled
- An AlloyDB cluster and instance running
- A service account with the following permissions:
  - `cloudsql.instances.connect`
  - `cloudsql.instances.get`
  - Or the role: `Cloud SQL Client`

### 2. AlloyDB Configuration

The pg_bigm extension must be available in your AlloyDB instance. AlloyDB supports various PostgreSQL extensions. Check with your AlloyDB administrator if pg_bigm is available.

### 3. GitHub Secrets

Configure the following secrets in your GitHub repository (Settings > Secrets and variables > Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_CREDENTIALS` | Service account JSON key | `{"type": "service_account", ...}` |
| `ALLOYDB_INSTANCE` | AlloyDB connection name | `project-id:region:cluster-id:instance-id` |
| `ALLOYDB_USER` | Database user with CREATE EXTENSION privileges | `postgres` or `your-db-user` |
| `ALLOYDB_PASSWORD` | Password for the database user | `your-secure-password` |

#### Getting the Service Account JSON Key

```bash
# Create a service account
gcloud iam service-accounts create alloydb-github-actions \
  --display-name="AlloyDB GitHub Actions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:alloydb-github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=alloydb-github-actions@PROJECT_ID.iam.gserviceaccount.com
```

#### Getting AlloyDB Connection Name

```bash
# List your AlloyDB instances
gcloud alloydb instances list --cluster=CLUSTER_NAME --region=REGION

# The connection name format is:
# PROJECT_ID:REGION:CLUSTER_ID:INSTANCE_ID
```

## Usage

### Manual Trigger (Recommended)

1. Go to the Actions tab in your GitHub repository
2. Select "AlloyDB pg_bigm Extension Setup" workflow
3. Click "Run workflow"
4. Fill in the parameters:
   - **alloydb_instance**: Your AlloyDB instance connection name
   - **database_name**: Target database (defaults to 'mattermost')
5. Click "Run workflow"

### Automatic Trigger

The workflow automatically runs when changes are pushed to the workflow file itself on the master branch.

## What the Workflow Does

1. **Checkout**: Clones the repository
2. **Authenticate**: Logs into Google Cloud using service account credentials
3. **Setup Cloud SDK**: Configures gcloud CLI tools
4. **Install Cloud SQL Proxy**: Downloads and installs the Cloud SQL Proxy for secure database connections
5. **Install PostgreSQL Client**: Installs `psql` for database operations
6. **Start Proxy**: Launches Cloud SQL Proxy to create a secure tunnel to AlloyDB
7. **Create Extension**: Executes `CREATE EXTENSION IF NOT EXISTS pg_bigm;`
8. **Verify**: Checks that the extension was created successfully
9. **Test**: Runs a basic test of pg_bigm functionality
10. **Cleanup**: Stops the Cloud SQL Proxy

## Troubleshooting

### Extension Creation Fails

If you see an error like:
```
ERROR: permission denied to create extension "pg_bigm"
```

Solutions:
- Ensure the database user has SUPERUSER privileges or CREATE permission
- Connect as the `postgres` superuser
- Ask your AlloyDB administrator to enable the extension

### Connection Timeout

If the workflow fails to connect to AlloyDB:
- Verify the AlloyDB instance connection name is correct
- Check that the service account has the necessary permissions
- Ensure the AlloyDB instance is running and accessible
- Verify network connectivity from GitHub Actions runners

### Extension Not Available

If pg_bigm is not available in your AlloyDB instance:
- Check with Google Cloud support about pg_bigm availability
- Consider using alternative full-text search extensions like `pg_trgm`

## Example Output

Successful workflow run output:
```
Connecting to AlloyDB and creating pg_bigm extension...
CREATE EXTENSION

Verifying pg_bigm extension...
 oid  | extname | extowner | extnamespace | ...
------+---------+----------+--------------+-----
 12345| pg_bigm |       10 |         2200 | ...

Listing all installed extensions...
      Name      | Version |   Schema   |         Description
----------------+---------+------------+------------------------------
 pg_bigm        | 1.2     | public     | text index searching...
 plpgsql        | 1.0     | pg_catalog | PL/pgSQL procedural language
```

## Security Considerations

- Store all credentials as GitHub Secrets, never in code
- Use least-privilege service accounts
- Regularly rotate service account keys
- Consider using Workload Identity Federation instead of service account keys
- Audit access to AlloyDB regularly

## References

- [AlloyDB Documentation](https://cloud.google.com/alloydb/docs)
- [pg_bigm Extension](https://pgbigm.osdn.jp/)
- [Cloud SQL Proxy Documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
