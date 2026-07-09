#!/usr/bin/env bash
# Public repo kopyası — asıl güncel script private secrets/deploy/ içindedir.
# Bu sarmalayıcı: secrets deploy scriptini çalıştırır veya public-only fallback yapar.
set -euo pipefail

SECRETS_SCRIPT="${HOME}/global-impact-work/kuresel-etki-secrets/deploy/deploy-from-github.sh"
WEB_SCRIPT="/var/www/html/oyungrok/deploy/deploy-from-github.sh"
ENV_FILE="${HOME}/.config/global-impact/env"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

if [[ -f "${SECRETS_SCRIPT}" ]]; then
  exec bash "${SECRETS_SCRIPT}" "$@"
fi
if [[ -f "${WEB_SCRIPT}" ]]; then
  exec bash "${WEB_SCRIPT}" "$@"
fi

echo "Private deploy script bulunamadı."
echo "Önce kuresel-etki-secrets/deploy/setup-git-auth.sh ve deploy-from-github.sh kurun."
echo "Repo: https://github.com/snipeTR/kuresel-etki-secrets"
exit 1
