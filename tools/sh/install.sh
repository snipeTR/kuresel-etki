#!/usr/bin/env bash
# =============================================================================
# Global Impact / Küresel Etki — INSTALL.sh
# Konum: tools/sh/install.sh
#
# Amaç: Oyunu yerelde çalıştırmak + GitHub'dan sunucuya yayımlamak için
# gereken sistem paketlerini (çok mimari / çok dağıtım) kontrol et ve kur.
#
# Destek: Linux (x86_64, i686, aarch64/arm64, armv7, riscv64, …)
#         paket yöneticileri: apt, dnf, yum, zypper, pacman, apk, emerge(bilgi)
# macOS: Homebrew ile kontrol + kurulum denemesi
#
# Kullanım:
#   bash tools/sh/install.sh
#   bash tools/sh/install.sh --yes          # onaysız kur (CI)
#   bash tools/sh/install.sh --check-only   # sadece rapor, kurma
#   bash tools/sh/install.sh --with-nginx   # nginx'i zorunlu say
# =============================================================================
set -uo pipefail

YES=0
CHECK_ONLY=0
WITH_NGINX=0
for arg in "$@"; do
  case "$arg" in
    -y|--yes) YES=1 ;;
    --check-only|-n|--dry-run) CHECK_ONLY=1 ;;
    --with-nginx) WITH_NGINX=1 ;;
    -h|--help)
      cat <<'EOF'
INSTALL.sh — Global Impact yayın / geliştirme bağımlılıkları

  bash tools/sh/install.sh              Kontroller + rapor + onayla kur
  bash tools/sh/install.sh --check-only Yalnız rapor
  bash tools/sh/install.sh --yes        Onay sormadan kur
  bash tools/sh/install.sh --with-nginx nginx zorunlu paket listesine ekle

Gerekli (yayın + test):
  git, rsync, curl, ca-certificates, openssh-client, nodejs (v18+)

Önerilen (canlı web sunucu rolü):
  nginx

Yardım: https://github.com/snipeTR/global-impact
EOF
      exit 0
      ;;
    *)
      echo "Bilinmeyen argüman: $arg ( --help )"
      exit 2
      ;;
  esac
done

# ---- renk (TTY ise) ----
if [[ -t 1 ]]; then
  C_OK=$'\033[32m'; C_BAD=$'\033[31m'; C_WARN=$'\033[33m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'; C_B=$'\033[1m'
else
  C_OK=; C_BAD=; C_WARN=; C_DIM=; C_RST=; C_B=
fi

die() {
  echo ""
  echo "${C_BAD}HATA:${C_RST} $*"
  echo ""
  cat <<'HELP'
── Kısa yardım ──────────────────────────────────────────
• Root/sudo gerekir (paket kurulumu).
• Desteklenen paket yöneticileri: apt, dnf, yum, zypper, pacman, apk
• Node.js 18+ önerilir: node --version
• Kurulumdan sonra:
    node serve.js                 → http://localhost:8123
    node test-consistency.js      → ALL_OK
    bash tools/sh/deploy-from-github.sh  (sunucuda / secrets kuruluysa)
• Repo: https://github.com/snipeTR/global-impact
• Detay: AGENTS.md, README.md, tools/sh/install.sh --help
─────────────────────────────────────────────────────────
HELP
  exit 1
}

have_cmd() { command -v "$1" >/dev/null 2>&1; }

# ---- sistem bilgisi ----
OS_NAME="$(uname -s 2>/dev/null || echo unknown)"
ARCH="$(uname -m 2>/dev/null || echo unknown)"
KERNEL="$(uname -r 2>/dev/null || echo unknown)"
PM=""           # paket yöneticisi kodu
PM_INSTALL=()   # kurulum komutu dizisi
SUDO=""

if have_cmd sudo && [[ "$(id -u)" -ne 0 ]]; then
  SUDO="sudo"
elif [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
fi

detect_pm() {
  if have_cmd apt-get; then
    PM="apt"
    PM_INSTALL=($SUDO apt-get install -y)
  elif have_cmd dnf; then
    PM="dnf"
    PM_INSTALL=($SUDO dnf install -y)
  elif have_cmd yum; then
    PM="yum"
    PM_INSTALL=($SUDO yum install -y)
  elif have_cmd zypper; then
    PM="zypper"
    PM_INSTALL=($SUDO zypper --non-interactive install)
  elif have_cmd pacman; then
    PM="pacman"
    PM_INSTALL=($SUDO pacman -S --noconfirm --needed)
  elif have_cmd apk; then
    PM="apk"
    PM_INSTALL=($SUDO apk add --no-cache)
  elif have_cmd brew; then
    PM="brew"
    PM_INSTALL=(brew install)
  elif have_cmd emerge; then
    PM="emerge"
    PM_INSTALL=($SUDO emerge --ask=n)
  else
    PM=""
  fi
}

detect_pm

# Distro id (bilgi)
DISTRO_ID="unknown"
DISTRO_LIKE=""
if [[ -f /etc/os-release ]]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  DISTRO_ID="${ID:-unknown}"
  DISTRO_LIKE="${ID_LIKE:-}"
elif [[ "$OS_NAME" == "Darwin" ]]; then
  DISTRO_ID="macos"
fi

# ---- paket adları (PM'ye göre) ----
# logical name → package name
pkg_name() {
  local logical="$1"
  case "$PM" in
    apt)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;;
        ssh) echo openssh-client ;;
        node) echo nodejs ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    dnf|yum)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;;
        ssh) echo openssh-clients ;;
        node) echo nodejs ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    zypper)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;;
        ssh) echo openssh ;;
        node) echo nodejs ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    pacman)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;;
        ssh) echo openssh ;;
        node) echo nodejs ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    apk)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;;
        ssh) echo openssh-client ;;
        node) echo nodejs ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    brew)
      case "$logical" in
        git) echo git ;;
        rsync) echo rsync ;;
        curl) echo curl ;;
        ca) echo ca-certificates ;; # brew may no-op / use system
        ssh) echo openssh ;;
        node) echo node ;;
        nginx) echo nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    emerge)
      case "$logical" in
        git) echo dev-vcs/git ;;
        rsync) echo net-misc/rsync ;;
        curl) echo net-misc/curl ;;
        ca) echo app-misc/ca-certificates ;;
        ssh) echo net-misc/openssh ;;
        node) echo net-libs/nodejs ;;
        nginx) echo www-servers/nginx ;;
        *) echo "$logical" ;;
      esac
      ;;
    *)
      echo "$logical"
      ;;
  esac
}

# binary check for logical package
check_binary() {
  local logical="$1"
  case "$logical" in
    git) have_cmd git ;;
    rsync) have_cmd rsync ;;
    curl) have_cmd curl || have_cmd wget ;;
    ca)
      # sertifika deposu — dosya varlığı
      [[ -d /etc/ssl/certs ]] || [[ -f /etc/ssl/cert.pem ]] || [[ -f /etc/pki/tls/certs/ca-bundle.crt ]] || have_cmd update-ca-certificates
      ;;
    ssh) have_cmd ssh && have_cmd scp ;;
    node) have_cmd node || have_cmd nodejs ;;
    nginx) have_cmd nginx ;;
    *) return 1 ;;
  esac
}

bin_version() {
  local logical="$1"
  case "$logical" in
    git) git --version 2>/dev/null | head -1 ;;
    rsync) rsync --version 2>/dev/null | head -1 ;;
    curl)
      if have_cmd curl; then curl --version 2>/dev/null | head -1
      elif have_cmd wget; then wget --version 2>/dev/null | head -1
      else echo "-"
      fi
      ;;
    ca) echo "ssl certs present"
      ;;
    ssh) ssh -V 2>&1 | head -1 ;;
    node)
      if have_cmd node; then node --version 2>/dev/null
      elif have_cmd nodejs; then nodejs --version 2>/dev/null
      else echo "-"
      fi
      ;;
    nginx) nginx -v 2>&1 | head -1 ;;
    *) echo "-" ;;
  esac
}

# Node major >= 18?
node_ok_version() {
  local v=""
  if have_cmd node; then v="$(node --version 2>/dev/null || true)"
  elif have_cmd nodejs; then v="$(nodejs --version 2>/dev/null || true)"
  else return 1
  fi
  v="${v#v}"
  local major="${v%%.*}"
  [[ -n "$major" && "$major" -ge 18 ]] 2>/dev/null
}

# ---- paket listesi ----
REQUIRED_LOGICAL=(git rsync curl ca ssh node)
OPTIONAL_LOGICAL=()
if [[ "$WITH_NGINX" -eq 1 ]]; then
  REQUIRED_LOGICAL+=(nginx)
else
  OPTIONAL_LOGICAL+=(nginx)
fi

MISSING_PKGS=()       # PM paket adları
MISSING_LOGICAL=()    # mantıksal
PRESENT_LOGICAL=()
OPTIONAL_MISSING=()
OPTIONAL_PRESENT=()
NODE_VERSION_WARN=0

echo "${C_B}=== Global Impact — INSTALL.sh ===${C_RST}"
echo "OS:        ${OS_NAME}"
echo "Arch:      ${ARCH}"
echo "Kernel:    ${KERNEL}"
echo "Distro:    ${DISTRO_ID}${DISTRO_LIKE:+ (like: $DISTRO_LIKE)}"
echo "Pkg mgr:   ${PM:-${C_BAD}BULUNAMADI${C_RST}}"
echo "User:      $(id -un 2>/dev/null || echo '?') (uid $(id -u))"
echo "Sudo:      ${SUDO:-root/yok}"
echo ""

echo "${C_B}── Zorunlu paketler ──${C_RST}"
printf "%-10s %-22s %-8s %s\n" "LOGICAL" "PACKAGE" "STATUS" "VERSION"
printf "%-10s %-22s %-8s %s\n" "--------" "----------------------" "------" "-------"

for logical in "${REQUIRED_LOGICAL[@]}"; do
  pkg="$(pkg_name "$logical")"
  if check_binary "$logical"; then
    PRESENT_LOGICAL+=("$logical")
    st="${C_OK}OK${C_RST}"
    ver="$(bin_version "$logical")"
    if [[ "$logical" == "node" ]] && ! node_ok_version; then
      NODE_VERSION_WARN=1
      st="${C_WARN}OLD${C_RST}"
    fi
  else
    MISSING_LOGICAL+=("$logical")
    MISSING_PKGS+=("$pkg")
    st="${C_BAD}MISSING${C_RST}"
    ver="-"
  fi
  # printf with color codes: pad carefully
  printf "%-10s %-22s %-16s %s\n" "$logical" "$pkg" "$st" "$ver"
done

if [[ ${#OPTIONAL_LOGICAL[@]} -gt 0 ]]; then
  echo ""
  echo "${C_B}── Önerilen (opsiyonel) ──${C_RST}"
  printf "%-10s %-22s %-8s %s\n" "LOGICAL" "PACKAGE" "STATUS" "VERSION"
  for logical in "${OPTIONAL_LOGICAL[@]}"; do
    pkg="$(pkg_name "$logical")"
    if check_binary "$logical"; then
      OPTIONAL_PRESENT+=("$logical")
      st="${C_OK}OK${C_RST}"
      ver="$(bin_version "$logical")"
    else
      OPTIONAL_MISSING+=("$logical")
      st="${C_WARN}yok${C_RST}"
      ver="-"
    fi
    printf "%-10s %-22s %-16s %s\n" "$logical" "$pkg" "$st" "$ver"
  done
fi

echo ""
echo "${C_B}── Özet rapor ──${C_RST}"
echo " Kurulu (zorunlu):  ${#PRESENT_LOGICAL[@]}/${#REQUIRED_LOGICAL[@]}"
echo " Eksik (zorunlu):   ${#MISSING_LOGICAL[@]} — ${MISSING_LOGICAL[*]:-yok}"
if [[ ${#OPTIONAL_MISSING[@]} -gt 0 ]]; then
  echo " Eksik (önerilen):  ${OPTIONAL_MISSING[*]}  (canlı nginx sunucu için: --with-nginx)"
fi
if [[ "$NODE_VERSION_WARN" -eq 1 ]]; then
  echo "${C_WARN} Uyarı: Node.js < 18. 18+ önerilir (serve.js / testler).${C_RST}"
fi

# Hepsi tamam
if [[ ${#MISSING_LOGICAL[@]} -eq 0 ]]; then
  echo ""
  echo "${C_OK}Tüm zorunlu paketler kurulu.${C_RST}"
  if [[ "$CHECK_ONLY" -eq 1 ]]; then
    exit 0
  fi
  if [[ ${#OPTIONAL_MISSING[@]} -gt 0 && "$WITH_NGINX" -eq 0 ]]; then
    echo "${C_DIM}İsteğe bağlı nginx yok — yalnızca web sunucu rolünde gerekir.${C_RST}"
  fi
  echo ""
  echo "Sonraki adımlar:"
  echo "  node serve.js"
  echo "  node test-consistency.js"
  echo "  # sunucu: bash tools/sh/deploy-from-github.sh  (secrets kuruluysa)"
  exit 0
fi

# Eksik var
if [[ "$CHECK_ONLY" -eq 1 ]]; then
  echo ""
  echo "${C_WARN}--check-only: kurulum yapılmadı. Eksikler: ${MISSING_PKGS[*]}${C_RST}"
  exit 1
fi

if [[ -z "$PM" ]]; then
  die "Desteklenen paket yöneticisi bulunamadı (apt/dnf/yum/zypper/pacman/apk/brew).
Eksik paketleri elle kurun: ${MISSING_PKGS[*]}
Arch: ${ARCH}  OS: ${OS_NAME}"
fi

if [[ "$PM" != "brew" ]] && [[ "$(id -u)" -ne 0 ]] && ! have_cmd sudo; then
  die "Kurulum için root veya sudo gerekli.
Eksik: ${MISSING_PKGS[*]}
Örnek (Debian/Ubuntu): sudo apt-get install -y ${MISSING_PKGS[*]}"
fi

# emerge için bilgilendir (noninteractive zor)
if [[ "$PM" == "emerge" ]]; then
  die "Gentoo/emerge otomatik kurulumu desteklenmiyor (güvenlik).
Elle: emerge --ask ${MISSING_PKGS[*]}"
fi

echo ""
echo "Kurulacak paketler (${PM}):"
for i in "${!MISSING_LOGICAL[@]}"; do
  echo "  - ${MISSING_LOGICAL[$i]}  →  ${MISSING_PKGS[$i]}"
done
echo ""

if [[ "$YES" -ne 1 ]]; then
  if [[ ! -t 0 ]]; then
    die "Etkileşimli terminal yok. Onaysız kurulum için: bash tools/sh/install.sh --yes"
  fi
  read -r -p "Kuruluma devam edilsin mi? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES|evet|Evet|EVET) ;;
    *)
      echo "İptal edildi."
      exit 0
      ;;
  esac
fi

echo ""
echo "${C_B}Kurulum başlıyor…${C_RST}"

# apt update
if [[ "$PM" == "apt" ]]; then
  $SUDO apt-get update -y || die "apt-get update başarısız."
fi
if [[ "$PM" == "apk" ]]; then
  $SUDO apk update || die "apk update başarısız."
fi

# Deduplicate package list (bash 3.2+ / macOS uyumlu — assoc array yok)
INSTALL_LIST=()
for p in "${MISSING_PKGS[@]}"; do
  dup=0
  for q in "${INSTALL_LIST[@]+"${INSTALL_LIST[@]}"}"; do
    [[ "$q" == "$p" ]] && { dup=1; break; }
  done
  [[ $dup -eq 0 ]] && INSTALL_LIST+=("$p")
done

set +e
"${PM_INSTALL[@]}" "${INSTALL_LIST[@]}"
rc=$?
set -e

if [[ $rc -ne 0 ]]; then
  die "Paket kurulumu başarısız (çıkış $rc).
Denenen: ${PM_INSTALL[*]} ${INSTALL_LIST[*]}
Paket yöneticisi: $PM | Arch: $ARCH | Distro: $DISTRO_ID

Elle kurulum örnekleri:
  Debian/Ubuntu:  sudo apt-get install -y git rsync curl ca-certificates openssh-client nodejs
  Fedora:         sudo dnf install -y git rsync curl ca-certificates openssh-clients nodejs
  Arch:           sudo pacman -S git rsync curl ca-certificates openssh nodejs
  Alpine:         sudo apk add git rsync curl ca-certificates openssh-client nodejs
  openSUSE:       sudo zypper install git rsync curl ca-certificates openssh nodejs
  macOS (brew):   brew install git rsync curl node openssh"
fi

echo ""
echo "${C_B}── Kurulum sonrası doğrulama ──${C_RST}"
STILL_MISSING=()
for logical in "${REQUIRED_LOGICAL[@]}"; do
  if check_binary "$logical"; then
    echo "  ${C_OK}OK${C_RST}  $logical  ($(bin_version "$logical"))"
  else
    echo "  ${C_BAD}FAIL${C_RST} $logical"
    STILL_MISSING+=("$logical")
  fi
done

if [[ ${#STILL_MISSING[@]} -gt 0 ]]; then
  die "Kurulum bitti ama hâlâ eksik: ${STILL_MISSING[*]}
Bazı distrolarda paket adı farklı olabilir veya PATH güncellenmeli (yeni shell açın)."
fi

if ! node_ok_version; then
  echo "${C_WARN}Uyarı: Node kurulu ama sürüm < 18 olabilir. Mümkünse Node 18+ yükleyin.${C_RST}"
fi

echo ""
echo "${C_OK}${C_B}Kurulum tamam.${C_RST}"
echo ""
echo "Sonraki adımlar:"
echo "  cd $(cd "$(dirname "$0")/.." && pwd)"
echo "  node serve.js                 # http://localhost:8123"
echo "  node test-consistency.js"
echo "  # Canlı yayın (sunucu + secrets):"
echo "  #   bash tools/sh/deploy-from-github.sh"
echo ""
exit 0
