# tools/sh — Shell / sunucu betikleri

Linux/macOS (veya sunucu) için bash betikleri.  
**Oyunun tarayıcı runtime’ı değildir.** Windows’ta WSL/Git Bash veya sunucu SSH ile çalıştırın.

```text
bash tools/sh/<script>.sh [args]
```

---

## Scriptler

| Dosya | Ne işe yarar |
|--------|----------------|
| `INSTALL.sh` | Çoklu distro/mimari: git, rsync, curl, ca-certificates, openssh, nodejs (+ opsiyonel nginx) kontrol + onaylı kurulum |
| `release.sh` | **Bilinçli release:** `/var/www/html/oyungrok` → site kökü `/var/www/html/` (index + css/js/lang/assets/music). `/oyun/` ve `/oyungrok/` silinmez |
| `deploy-from-github.sh` | Public sarmalayıcı: private secrets deploy scriptine yönlendirir (yoksa yardım mesajı) |

### Sık kullanım

```bash
# Paket kontrol / kur
bash tools/sh/INSTALL.sh
bash tools/sh/INSTALL.sh --check-only
bash tools/sh/INSTALL.sh --yes
bash tools/sh/INSTALL.sh --with-nginx

# Günlük geliştirme deploy (sunucuda, asıl script secrets’te)
bash tools/sh/deploy-from-github.sh
# veya:
bash ~/global-impact-work/kuresel-etki-secrets/deploy/deploy-from-github.sh
# → yalnız /var/www/html/oyungrok

# Site kökü sürüm (bilinçli; her işte değil)
bash /var/www/html/oyungrok/tools/sh/release.sh --yes
```

---

## Kurallar (ajanlar)

1. **Geliştirme yolu:** her anlamlı iş → `deploy-from-github` → **`/oyungrok/`**.  
2. **Site kökü (`/`):** yalnızca kullanıcı isterse veya bilerek `release.sh`. Otomatik her commit’te çalıştırma.  
3. **`/oyun/` asla** yazma/silme (eski stabil).  
4. Yeni shell betikleri buraya (`tools/sh/`); Node araçları `tools/js/`.  
5. Yeni `.sh` dosyalarında LF satır sonu kullan; Windows CRLF bozabilir.

Node yardımcıları: **[../js/README.md](../js/README.md)**
