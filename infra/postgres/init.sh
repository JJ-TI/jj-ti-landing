#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<'SQL'
\getenv app_password DB_PASSWORD
\getenv reader_password GRAFANA_DB_PASSWORD
SELECT format('CREATE ROLE jjti_app LOGIN PASSWORD %L', :'app_password') \gexec
SELECT format('CREATE ROLE jjti_reader LOGIN PASSWORD %L', :'reader_password') \gexec
CREATE DATABASE jjti OWNER jjti_app;
\connect jjti
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO jjti_app;
GRANT USAGE ON SCHEMA public TO jjti_reader;
SQL
