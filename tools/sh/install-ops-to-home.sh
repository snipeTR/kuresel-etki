#!/usr/bin/env bash
# =============================================================================
# tools/sh/install-ops-to-home.sh
#
# Sunucuda $HOME/gi-ops/ altına ops sarmalayıcıları kurar:
#   deploy.sh       → GitHub → /var/www/html/oyungrok
#   release.sh      → oyungrok → /var/www/html/ (site kökü)
#   install-deps.sh → paket kurulum (install.sh)
#   harden-sshd.sh  → SSH dayanıklılık
#   status.sh       → durum
#
#   bash tools/sh/install-ops-to-home.sh --yes
# =============================================================================
set -euo pipefail

YES=0
for a in "$@"; do
  case "$a" in
    -y|--yes) YES=1 ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
  esac
done

HOME_DIR="${HOME:-/home/ubuntu}"
OPS_DIR="${GI_OPS_DIR:-$HOME_DIR/gi-ops}"
OYUNGROK="${OYUNGROK:-/var/www/html/oyungrok}"
SECRETS_DEPLOY="${SECRETS_DEPLOY:-$HOME_DIR/global-impact-work/kuresel-etki-secrets/deploy/deploy-from-github.sh}"
PUBLIC_WORK="${PUBLIC_WORK:-$HOME_DIR/global-impact-work/global-impact}"

echo "=== Global Impact — ~/gi-ops kurulumu ==="
echo "OPS_DIR:  $OPS_DIR"
echo "OYUNGROK: $OYUNGROK"
echo ""

if [[ "$YES" -ne 1 && -t 0 ]]; then
  read -r -p "Kurulsun mu? [y/N] " ans
  case "$ans" in y|Y|yes|YES|evet|Evet|EVET) ;; *) echo "İptal."; exit 0 ;; esac
fi

mkdir -p "$OPS_DIR"

# ---- deploy: GitHub → oyungrok ----
cat > "$OPS_DIR/deploy.sh" <<EOF
#!/usr/bin/env bash
# GitHub public+secrets → /var/www/html/oyungrok
set -euo pipefail
SECRETS_DEPLOY="\${SECRETS_DEPLOY:-$SECRETS_DEPLOY}"
FALLBACK="$OYUNGROK/tools/sh/deploy-from-github.sh"
if [[ -f "\$SECRETS_DEPLOY" ]]; then
  exec bash "\$SECRETS_DEPLOY" "\$@"
elif [[ -f "\$FALLBACK" ]]; then
  exec bash "\$FALLBACK" "\$@"
else
  echo "HATA: deploy script yok."
  echo "  \$SECRETS_DEPLOY"
  echo "  \$FALLBACK"
  exit 1
fi
EOF

# ---- release: oyungrok → web root ----
cat > "$OPS_DIR/release.sh" <<EOF
#!/usr/bin/env bash
# oyungrok → /var/www/html (bilinçli site kökü sürümü)
set -euo pipefail
OYUNGROK="\${OYUNGROK:-$OYUNGROK}"
DEST="\${DEST:-/var/www/html}"
PUBLIC_WORK="\${PUBLIC_WORK:-$PUBLIC_WORK}"
SCRIPT="\$OYUNGROK/tools/sh/release.sh"
if [[ ! -f "\$SCRIPT" ]]; then
  SCRIPT="\$PUBLIC_WORK/tools/sh/release.sh"
fi
if [[ ! -f "\$SCRIPT" ]]; then
  echo "HATA: release.sh yok. Önce: \$HOME/gi-ops/deploy.sh"
  exit 1
fi
export SOURCE="\${SOURCE:-\$OYUNGROK}"
export DEST
exec bash "\$SCRIPT" "\$@"
EOF

# ---- install packages ----
cat > "$OPS_DIR/install-deps.sh" <<EOF
#!/usr/bin/env bash
# git, rsync, curl, node, openssh, …
set -euo pipefail
OYUNGROK="\${OYUNGROK:-$OYUNGROK}"
PUBLIC_WORK="\${PUBLIC_WORK:-$PUBLIC_WORK}"
SCRIPT="\$OYUNGROK/tools/sh/install.sh"
if [[ ! -f "\$SCRIPT" ]]; then
  SCRIPT="\$PUBLIC_WORK/tools/sh/install.sh"
fi
if [[ ! -f "\$SCRIPT" ]]; then
  echo "HATA: install.sh yok. Önce deploy edin."
  exit 1
fi
exec bash "\$SCRIPT" "\$@"
EOF

# ---- ssh harden ----
cat > "$OPS_DIR/harden-sshd.sh" <<EOF
#!/usr/bin/env bash
set -euo pipefail
OYUNGROK="\${OYUNGROK:-$OYUNGROK}"
PUBLIC_WORK="\${PUBLIC_WORK:-$PUBLIC_WORK}"
SCRIPT="\$OYUNGROK/tools/sh/harden-sshd.sh"
if [[ ! -f "\$SCRIPT" ]]; then
  SCRIPT="\$PUBLIC_WORK/tools/sh/harden-sshd.sh"
fi
if [[ ! -f "\$SCRIPT" ]]; then
  echo "HATA: harden-sshd.sh yok."
  exit 1
fi
exec bash "\$SCRIPT" "\$@"
EOF

# ---- status ----
cat > "$OPS_DIR/status.sh" <<EOF
#!/usr/bin/env bash
set -euo pipefail
OYUNGROK="\${OYUNGROK:-$OYUNGROK}"
PUBLIC_WORK="\${PUBLIC_WORK:-$PUBLIC_WORK}"
echo "=== gi-ops status ==="
echo "Host: \$(hostname)  \$(date -u +%Y-%m-%dT%H:%MZ)"
echo "SSH:  \$(systemctl is-active ssh 2>/dev/null || systemctl is-active sshd 2>/dev/null || echo '?')"
DISK_LINE=\$(df -h / | awk 'NR==2 {print \$3 " used " \$5 " of " \$2}')
echo "Disk: \$DISK_LINE"
if [[ -f "\$OYUNGROK/index.html" ]]; then echo "oyungrok: OK  \$OYUNGROK"; else echo "oyungrok: MISSING  \$OYUNGROK"; fi
if [[ -f /var/www/html/index.html ]]; then echo "root /:   OK"; else echo "root /:   MISSING"; fi
if [[ -d /var/www/html/oyun ]]; then echo "oyun/:    OK (dokunma)"; else echo "oyun/:    MISSING"; fi
if [[ -d "\$PUBLIC_WORK/.git" ]]; then
  echo "git HEAD: \$(git -C "\$PUBLIC_WORK" rev-parse --short HEAD 2>/dev/null || echo n/a)"
fi
if [[ -f /etc/ssh/sshd_config.d/99-gi-keepalive.conf ]]; then echo "sshd drop-in: OK"; else echo "sshd drop-in: yok"; fi
echo "ops: $OPS_DIR"
ls -la "$OPS_DIR"
EOF

# ---- all-in-one update: deploy then optional release ----
cat > "$OPS_DIR/update-dev.sh" <<EOF
#!/usr/bin/env bash
# Sadece geliştirme yolu (oyungrok) güncelle — root'a dokunma
set -euo pipefail
DIR="\$(cd "\$(dirname "\$0")" && pwd)"
bash "\$DIR/deploy.sh" "\$@"
bash "\$DIR/status.sh"
EOF

cat > "$OPS_DIR/update-release.sh" <<EOF
#!/usr/bin/env bash
# deploy (oyungrok) + release (site kökü)
set -euo pipefail
DIR="\$(cd "\$(dirname "\$0")" && pwd)"
bash "\$DIR/deploy.sh"
echo ""
echo ">>> Site köküne release..."
bash "\$DIR/release.sh" --yes
bash "\$DIR/status.sh"
EOF

cat > "$OPS_DIR/README.md" <<EOF
# ~/gi-ops — Global Impact sunucu operasyonları

Ubuntu home kısayolları. Kaynak betikler: \`/var/www/html/oyungrok/tools/sh/\`

| Script | Ne |
|--------|-----|
| \`./deploy.sh\` / \`./update-dev.sh\` | GitHub → **oyungrok** (günlük) |
| \`./release.sh\` | **oyungrok → /** site kökü |
| \`./update-release.sh\` | deploy + release bir arada |
| \`./install-deps.sh\` | paket kontrol/kur (\`install.sh\`) |
| \`./harden-sshd.sh\` | SSH dayanıklılık |
| \`./status.sh\` | durum |

\`\`\`bash
cd ~/gi-ops
./status.sh
./update-dev.sh              # sadece /oyungrok
./update-release.sh          # oyungrok + site kökü
./install-deps.sh --check-only
./release.sh --yes           # yalnız kök kopya
\`\`\`

**ASLA** \`/var/www/html/oyun\` silme/yazma.

Tekrar kur:  
\`bash /var/www/html/oyungrok/tools/sh/install-ops-to-home.sh --yes\`
EOF

chmod +x "$OPS_DIR"/*.sh

# PATH helper (opsiyonel)
cat > "$HOME_DIR/.gi-ops-path.sh" <<EOF
# shellcheck shell=bash
export PATH="\$HOME/gi-ops:\$PATH"
EOF

echo ""
echo "OK — $OPS_DIR"
ls -la "$OPS_DIR"
echo ""
echo "Kullanım:  cd ~/gi-ops && ./status.sh"
echo "PATH:      echo 'source ~/.gi-ops-path.sh' >> ~/.bashrc"
exit 0
