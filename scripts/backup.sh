#!/bin/sh
set -eu
umask 077
mkdir -p backups
file="backups/jjti-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose exec -T db pg_dump -U postgres -d jjti -Fc > "$file"
printf 'Backup creado; cifrar y verificar fuera del repositorio.\n'
