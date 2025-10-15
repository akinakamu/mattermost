### Background

This document aims to explain the bunch of server and webapp yaml files and their functionality.

The context behind this complexity is that we want new pushes to PR branches to cancel older in-progress and pending CI runs, _but_ we don't want that to happen in master branch. Unfortunately, there is no config knob to control pending workflows and if you set a concurrency group, then pending workflows will _always_ be canceled. Refer to https://github.com/orgs/community/discussions/5435 for discussion.

Therefore, we have a template yaml file which is actually the main CI code. That is then imported by `{server|webapp}-ci-master.yml` and `{server|webapp}-ci-pr.yml`. The `-master.yml` files don't have any concurrency limits, but `-pr.yml` files do.

### Folder structure

server-ci-pr
|
---server-ci-template
	|
	---server-test-template

server-ci-master
|
---server-ci-template
	|
	---server-test-template

webapp-ci-pr
|
---webapp-ci-template

webapp-ci-master
|
---webapp-ci-template

### AlloyDB pg_bigm Extension Setup

The `alloydb-pg-bigm-setup.yml` workflow is used to connect to Google Cloud AlloyDB and install the pg_bigm extension for PostgreSQL. This extension provides full-text search capabilities with bigram indexing.

#### Prerequisites

The following secrets must be configured in the repository:
- `GCP_CREDENTIALS`: JSON key for Google Cloud service account with AlloyDB access
- `ALLOYDB_INSTANCE`: AlloyDB instance connection name (format: `project:region:cluster:instance`)
- `ALLOYDB_USER`: Database user with permissions to create extensions
- `ALLOYDB_PASSWORD`: Password for the database user

#### Usage

The workflow can be triggered manually via workflow_dispatch or automatically on changes to the workflow file itself. When triggered manually, you can specify:
- `alloydb_instance`: The AlloyDB instance connection name
- `database_name`: The target database name (defaults to 'mattermost')

#### What it does

1. Authenticates to Google Cloud using service account credentials
2. Sets up Cloud SQL Proxy to connect to AlloyDB
3. Installs PostgreSQL client tools
4. Creates the pg_bigm extension in the specified database
5. Verifies the extension was created successfully
6. Tests basic pg_bigm functionality
