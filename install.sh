#!/usr/bin/env bash
# =============================================================================
# Global Impact / Küresel Etki — install.sh (kök bootstrap)
#
# Tek komut (Linux sunucu / dev makine):
#
#   curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash
#
# veya:
#   curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash -s -- --yes --with-nginx
#
# Ne yapar:
#   1) git yoksa paket yöneticisi ile temel araçları dener
#   2) Repoyu klonlar/günceller ($GI_DIR, varsayılan: $HOME/global-impact)
#   3) tools/sh/INSTALL.sh ile git/rsync/curl/ssh/node (+nginx) kurar
#   4) Sunucu ise isteğe bağlı ~/gi-ops home ops kurar
#
# Ortam:
#   GI_DIR=/opt/global-impact
#   GI_SKIP_CLONE=1          # sadece paket kur (mevcut dizin)
#   GI_SKIP_OPS=1            # ~/gi-ops kurma
#   GI_REPO_URL=...
# =============================================================================
set -euo pipefail

YES=0
WITH_NGINX=0
CHECK_ONLY=0
SKIP_CLONE="${GI_SKIP_CLONE:-0}"
SKIP_OPS="${GI_SKIP_OPS:-0}"
REPO_URL="${GI_REPO_URL:-https://github.com/snipeTR/global-impact.git}"
GI_DIR="${GI_DIR:-${HOME:-/home/ubuntu}/global-impact}"
BRANCH="${GI_BRANCH:-main}"

for arg in "$@"; do
  case "$arg" in
    -y|--yes) YES=1 ;;
    --with-nginx) WITH_NGINX=1 ;;
    --check-only) CHECK_ONLY=1 ;;
    --skip-clone) SKIP_CLONE=1 ;;
    --skip-ops) SKIP_OPS=1 ;;
    -h|--help)
      cat <<'EOF'
install.sh — Global Impact bootstrap (tek komut kurulum)

  curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash
  curl -fsSL .../install.sh | bash -s -- --yes --with-nginx

  bash install.sh              # repo kökünden
  bash install.sh --yes
  bash install.sh --check-only

Ayrıntılı paket betiği: tools/sh/INSTALL.sh
Sunucu ops: tools/sh/install-ops-to-home.sh → ~/gi-ops
EOF
      exit 0
      ;;
  esac
done

# Pipe ile gelince stdin TTY değil → onay sorma
if [[ ! -t 0 ]]; then
  YES=1
fi

have() { command -v "$1" >/dev/null 2>&1; }

echo "=============================================="
echo " Global Impact / Küresel Etki — install.sh"
echo "=============================================="
echo "Repo:   $REPO_URL"
echo "Dir:    $GI_DIR"
echo "Branch: $BRANCH"
echo ""

# --- 0) Minimal bootstrap: curl/git yoksa ---
ensure_git_curl() {
  if have git && (have curl || have wget); then
    return 0
  fi
  echo ">>> Temel araçlar (git/curl) kuruluyor…"
  if have apt-get; then
    sudo apt-get update -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y git curl ca-certificates
  elif have dnf; then
    sudo dnf install -y git curl ca-certificates
  elif have yum; then
    sudo yum install -y git curl ca-certificates
  elif have apk; then
    sudo apk add --no-cache git curl ca-certificates
  elif have pacman; then
    sudo pacman -S --noconfirm --needed git curl ca-certificates
  elif have zypper; then
    sudo zypper --non-interactive install git curl ca-certificates
  elif have brew; then
    brew install git curl
  else
    echo "HATA: git/curl yok ve paket yöneticisi bulunamadı."
    echo "Elle kurun: git curl ca-certificates"
    exit 1
  fi
}

# --- 1) Repo ---
clone_or_update() {
  if [[ "$SKIP_CLONE" == "1" ]]; then
    if [[ -f "./tools/sh/INSTALL.sh" ]]; then
      GI_DIR="$(pwd)"
      echo ">>> Mevcut dizin kullanılıyor: $GI_DIR"
      return 0
    fi
    echo "HATA: --skip-clone ama tools/sh/INSTALL.sh yok."
    exit 1
  fi

  ensure_git_curl

  if [[ -d "$GI_DIR/.git" ]]; then
    echo ">>> Repo güncelleniyor: $GI_DIR"
    git -C "$GI_DIR" fetch --depth 1 origin "$BRANCH" || git -C "$GI_DIR" fetch origin
    git -C "$GI_DIR" checkout "$BRANCH" 2>/dev/null || true
    git -C "$GI_DIR" pull --ff-only origin "$BRANCH" || git -C "$GI_DIR" reset --hard "origin/$BRANCH"
  elif [[ -f "$GI_DIR/tools/sh/INSTALL.sh" ]]; then
    echo ">>> Mevcut kaynak ağacı: $GI_DIR"
  else
    echo ">>> Klonlanıyor → $GI_DIR"
    mkdir -p "$(dirname "$GI_DIR")"
    git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$GI_DIR" \
      || git clone --depth 1 "$REPO_URL" "$GI_DIR"
  fi

  if [[ ! -f "$GI_DIR/tools/sh/INSTALL.sh" ]]; then
    echo "HATA: $GI_DIR/tools/sh/INSTALL.sh bulunamadı."
    exit 1
  fi
}

# Script repo içinden çalışıyorsa
if [[ -f "$(dirname "$0")/tools/sh/INSTALL.sh" ]] 2>/dev/null; then
  HERE="$(cd "$(dirname "$0")" && pwd)"
  if [[ -f "$HERE/index.html" && -f "$HERE/tools/sh/INSTALL.sh" ]]; then
    GI_DIR="$HERE"
    SKIP_CLONE=1
  fi
fi
# Pipe: $0 often bash
if [[ "${0##*/}" == "bash" || "${0}" == "-bash" || "$0" == "bash" ]]; then
  :
fi

clone_or_update

cd "$GI_DIR"
echo ">>> Çalışma dizini: $(pwd)"
echo ""

# --- 2) Paket kurulumu ---
INSTALL_ARGS=()
[[ "$YES" -eq 1 ]] && INSTALL_ARGS+=(--yes)
[[ "$CHECK_ONLY" -eq 1 ]] && INSTALL_ARGS+=(--check-only)
[[ "$WITH_NGINX" -eq 1 ]] && INSTALL_ARGS+=(--with-nginx)

echo ">>> tools/sh/INSTALL.sh ${INSTALL_ARGS[*]:-}"
bash tools/sh/INSTALL.sh "${INSTALL_ARGS[@]+"${INSTALL_ARGS[@]}"}"
PKG_RC=$?
if [[ $PKG_RC -ne 0 && "$CHECK_ONLY" -eq 1 ]]; then
  echo "Paket kontrolü eksik buldu (check-only)."
  exit $PKG_RC
fi
if [[ $PKG_RC -ne 0 ]]; then
  echo "HATA: paket kurulumu başarısız (kod $PKG_RC)."
  exit $PKG_RC
fi

# --- 3) Sunucu home ops ---
if [[ "$SKIP_OPS" != "1" && "$CHECK_ONLY" != "1" ]]; then
  if [[ -d /var/www/html ]] || [[ "$(id -un)" == "ubuntu" ]] || [[ -d "$HOME/global-impact-work" ]]; then
    if [[ -f tools/sh/install-ops-to-home.sh ]]; then
      echo ""
      echo ">>> ~/gi-ops sunucu kısayolları"
      bash tools/sh/install-ops-to-home.sh --yes || true
    fi
  fi
fi

echo ""
echo "=============================================="
echo " Kurulum tamam."
echo "=============================================="
echo "Kaynak: $GI_DIR"
echo ""
echo "Yerel oyna:"
echo "  cd $GI_DIR"
echo "  node serve.js"
echo "  # → http://localhost:8123"
echo ""
echo "Test:"
echo "  node test-consistency.js"
echo ""
echo "Sunucu (zaten ubuntu + web):"
echo "  cd ~/gi-ops && ./status.sh"
echo "  ./update-dev.sh          # → /var/www/html/oyungrok"
echo "  ./update-release.sh      # oyungrok + site kökü /"
echo ""
echo "Dokümantasyon: README.md · AGENTS.md · tools/sh/README.md"
echo "Repo: https://github.com/snipeTR/global-impact"
exit 0
