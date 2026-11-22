#!/usr/bin/env bash
# Gitleaks oficial, versión y SHA256 fijados; salida redactada.
set -euo pipefail
cd "$(dirname "$0")/.."
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) archive=gitleaks_8.30.0_linux_x64.tar.gz; checksum=79a3ab579b53f71efd634f3aaf7e04a0fa0cf206b7ed434638d1547a2470a66e ;;
  Linux-aarch64|Linux-arm64) archive=gitleaks_8.30.0_linux_arm64.tar.gz; checksum=b4cbbb6ddf7d1b2a603088cd03a4e3f7ce48ee7fd449b51f7de6ee2906f5fa2f ;;
  *) echo 'Este script requiere Linux x64 o ARM64.' >&2; exit 1 ;;
esac
scan_tmp=$(mktemp -d)
trap 'rm -rf "$scan_tmp"' EXIT
curl --fail --silent --show-error --location "https://github.com/gitleaks/gitleaks/releases/download/v8.30.0/$archive" --output "$scan_tmp/$archive"
printf '%s  %s\n' "$checksum" "$scan_tmp/$archive" | sha256sum --check --status
tar -xzf "$scan_tmp/$archive" -C "$scan_tmp" gitleaks
"$scan_tmp/gitleaks" git --redact --no-banner --log-opts=--all .
"$scan_tmp/gitleaks" dir --redact --no-banner .
