# tools/sh — Shell / sunucu betikleri

Linux/macOS (veya sunucu) için bash betikleri.  
**Oyunun tarayıcı runtime’ı değildir.** Windows’ta WSL/Git Bash veya sunucu SSH ile çalıştırın.

**Tek komut kurulum (repo kökü `install.sh`):**
```bash
curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash
```
Bu, repoyu indirip buradaki `INSTALL.sh` + `install-ops-to-home.sh` zincirini çalıştırır.

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
| `harden-sshd.sh` | SSH kopma riskini azaltır: `sshd_config.d/99-gi-keepalive.conf` (ClientAlive, MaxStartups, UseDNS no). **Port/key değiştirmez** |
| `install-ops-to-home.sh` | Sunucuda `~/gi-ops/` sarmalayıcılarını kurar (`deploy`, `release`, `install-deps`, …) |

### Sık kullanım (repo / oyungrok)

```bash
bash tools/sh/install.sh
bash tools/sh/install.sh --check-only
bash tools/sh/deploy-from-github.sh
bash tools/sh/release.sh --yes
bash tools/sh/harden-sshd.sh --yes
bash tools/sh/install-ops-to-home.sh --yes   # → ~/gi-ops
```

### Sunucu home (`~/gi-ops`) — tercih edilen

```bash
cd ~/gi-ops
./status.sh
./update-dev.sh          # GitHub → /oyungrok only
./update-release.sh      # deploy + site kökü release
./install-deps.sh --yes  # paketler
./release.sh --yes       # yalnız oyungrok → /
./harden-sshd.sh --yes
```

---

## Kurallar (ajanlar)

1. **Geliştirme yolu:** her anlamlı iş → `deploy-from-github` → **`/oyungrok/`**.  
2. **Site kökü (`/`):** yalnızca kullanıcı isterse veya bilerek `release.sh`. Otomatik her commit’te çalıştırma.  
3. **`/oyun/` asla** yazma/silme (eski stabil).  
4. Yeni shell betikleri buraya (`tools/sh/`); Node araçları `tools/js/`.  
5. Yeni `.sh` dosyalarında LF satır sonu kullan; Windows CRLF bozabilir.  
6. **SSH:** `harden-sshd.sh` idempotent ve güvenli sayılır. Port/key/fail2ban agresif ban **kullanıcı onayı olmadan yapma**. Kilit: OCI Console connection.

Node yardımcıları: **[../js/README.md](../js/README.md)**
