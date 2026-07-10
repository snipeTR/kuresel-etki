#!/usr/bin/env bash
# =============================================================================
# Global Impact — tools/release.sh
#
# Amaç: Onaylı / açık “sürüm” yayınında oyunu web sunucusunun HTML köküne
#       (site ilk açılış: /) kopyalamak.
#
# GELİŞTİRME (varsayılan, her gün):
#   /var/www/html/oyungrok  ← deploy-from-github.sh
#   Bu klasöre dokunmaya DEVAM edilir. release.sh oyungrok’u silmez.
#
# RELEASE (isteğe bağlı, bu script):
#   /var/www/html/  ← index.html + css/js/lang/assets/music
#   Eski stabil /oyun/ ASLA silinmez / üzerine yazılmaz.
#
# Kullanım (sunucuda):
#   bash /var/www/html/oyungrok/tools/release.sh
#   bash tools/release.sh --yes
#   SOURCE=/path/to/build DEST=/var/www/html bash tools/release.sh --yes
#
# Ortam:
#   SOURCE  varsayılan: /var/www/html/oyungrok
#   DEST    varsayılan: /var/www/html
# =============================================================================
set -euo pipefail

YES=0
for arg in "$@"; do
  case "$arg" in
    -y|--yes) YES=1 ;;
    -h|--help)
      sed -n '2,30p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      echo "Bilinmeyen argüman: $arg  (--help)"
      exit 2
      ;;
  esac
done

SOURCE="${SOURCE:-/var/www/html/oyungrok}"
DEST="${DEST:-/var/www/html}"

# Güvenlik: yanlışlıkla /oyun içine yazma
case "$DEST" in
  */oyun|*/oyun/)
    echo "HATA: DEST eski stabil /oyun olamaz. (ASLA dokunma)"
    exit 1
    ;;
esac

if [[ ! -d "$SOURCE" ]]; then
  echo "HATA: SOURCE yok: $SOURCE"
  echo "Önce oyungrok deploy edin: deploy-from-github.sh"
  exit 1
fi
if [[ ! -f "$SOURCE/index.html" ]]; then
  echo "HATA: SOURCE içinde index.html yok: $SOURCE"
  exit 1
fi
if [[ ! -d "$DEST" ]]; then
  echo "HATA: DEST yok: $DEST"
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "HATA: rsync gerekli. bash tools/INSTALL.sh"
  exit 1
fi

echo "=== Global Impact — RELEASE (site kökü) ==="
echo "SOURCE (geliştirme kopyası): $SOURCE"
echo "DEST   (web root / ):        $DEST"
echo ""
echo "Kopyalanacak:"
echo "  index.html, css/, js/, lang/, assets/, music/"
echo "DokunulMAYACAK:"
echo "  $DEST/oyun/   (eski stabil)"
echo "  $DEST/oyungrok/ (geliştirme — aynen kalır)"
echo "KopyalanMAYACAK (gizli/araç):"
echo "  ssh/, secrets/, deploy/, .git/, YAPILACAKLAR.md, tools/, *.md, serve.js, …"
echo ""

if [[ "$YES" -ne 1 ]]; then
  if [[ ! -t 0 ]]; then
    echo "Etkileşim yok. Onaysız: bash tools/release.sh --yes"
    exit 1
  fi
  read -r -p "Site köküne RELEASE kopyası yapılsın mı? [y/N] " ans
  case "$ans" in
    y|Y|yes|YES|evet|Evet|EVET) ;;
    *) echo "İptal."; exit 0 ;;
  esac
fi

# Sudo gerekebilir
RSYNC=(rsync)
if [[ ! -w "$DEST" ]]; then
  if command -v sudo >/dev/null 2>&1; then
    RSYNC=(sudo rsync)
  else
    echo "HATA: $DEST yazılamıyor ve sudo yok."
    exit 1
  fi
fi

# Yalnız oyun statik dosyaları — DEST kökündeki oyun/ ve oyungrok/ dizinlerine girilmez
"${RSYNC[@]}" -a \
  --exclude 'oyun/' \
  --exclude 'oyungrok/' \
  "$SOURCE/index.html" "$DEST/index.html"

for dir in css js lang assets music; do
  if [[ -d "$SOURCE/$dir" ]]; then
    mkdir -p "$DEST/$dir" 2>/dev/null || sudo mkdir -p "$DEST/$dir"
    "${RSYNC[@]}" -a --delete "$SOURCE/$dir/" "$DEST/$dir/"
  fi
done

# Eski nginx default sayfasını bırakma (karışıklık olmasın)
if [[ -f "$DEST/index.nginx-debian.html" ]]; then
  "${RSYNC[@]}" -a --remove-source-files /dev/null "$DEST/index.nginx-debian.html" 2>/dev/null || true
  if command -v sudo >/dev/null 2>&1; then
    sudo rm -f "$DEST/index.nginx-debian.html" || true
  else
    rm -f "$DEST/index.nginx-debian.html" || true
  fi
fi

# İzinler (www-data okuyabilsin)
if command -v sudo >/dev/null 2>&1; then
  sudo chmod -R a+rX "$DEST/index.html" "$DEST/css" "$DEST/js" "$DEST/lang" "$DEST/assets" "$DEST/music" 2>/dev/null || true
fi

echo ""
echo "OK — RELEASE tamam."
echo "  Site kökü:  http://<sunucu>/"
echo "  Geliştirme: http://<sunucu>/oyungrok/  (değişmedi)"
echo "  Eski stabil: http://<sunucu>/oyun/     (dokunulmadı)"
echo ""
echo "Not: Günlük iş için yine /oyungrok/ + deploy-from-github.sh kullanın."
echo "     Bu script yalnızca bilinçli release içindir."
exit 0
