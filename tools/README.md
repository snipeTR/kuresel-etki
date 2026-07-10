# tools/

Geliştirici ve ajan araçları. **Oyun runtime’ı değil.**

**Tek komut sunucu/dev kurulum** (repo kökü):
```bash
curl -fsSL https://raw.githubusercontent.com/snipeTR/global-impact/main/install.sh | bash
```
→ kök [`install.sh`](../install.sh) · paketler: [`sh/INSTALL.sh`](sh/INSTALL.sh)

| Klasör | İçerik |
|--------|--------|
| **[js/](js/)** | Node CLI (`node tools/js/...`) — i18n/desc/help senkron |
| **[sh/](sh/)** | Bash (`bash tools/sh/...`) — kurulum, deploy, release, gi-ops |

Ayrıntı: her klasördeki `README.md`.
