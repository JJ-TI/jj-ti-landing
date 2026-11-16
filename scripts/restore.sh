#!/bin/sh
set -eu
: "${RESTORE_DATABASE_URL:?Debe apuntar a una base aislada vacía}"
: "${1:?Indica archivo de backup}"
# No se usa DATABASE_URL productiva de forma implícita.
pg_restore --dbname "$RESTORE_DATABASE_URL" --no-owner --no-acl --exit-on-error "$1"
printf 'Restauración completada en destino explícito; ejecutar verificaciones.\n'
