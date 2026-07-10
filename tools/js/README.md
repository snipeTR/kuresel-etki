# tools/js — Node yardımcı betikleri

Bu klasör **oyunun tarayıcı runtime’ı değildir.**  
`index.html` bu dosyaları yüklemez. Yalnızca geliştirici / ajan komut satırı araçlarıdır.

```text
node tools/js/<script>.js [args]
```

Proje kökü (`global-impact` / `ekonomi oyunu`) içinden çalıştırın.  
Script’ler `__dirname/../..` ile repo kökünü bulur.

---

## Kalıcı scriptler (silme)

| Dosya | Ne işe yarar |
|--------|----------------|
| `sync-instrument-descs.js` | Enstrüman `name`/`desc` senkronu: `instruments.js` ↔ `lang/tr|en/pack.js`. Kontrol: `--check` |
| `sync-help-i18n.js` | `js/ui/help.js` (TR) + EN metinleri → `lang/*/pack.js` help/about |
| `build-lang-tr.js` | TR dil paketini veri dosyalarından üret (büyük yenileme) |
| `build-lang-en.js` | EN dil paketini üret / güncelle |
| `fill-tr-descs-from-data.js` | `instruments.js` desc → TR pack instruments |

### Sık kullanım

```bash
# Her enstrüman desc değişikliğinden sonra
node tools/js/sync-instrument-descs.js --check

# Yardım / about mekaniği değişince
node tools/js/sync-help-i18n.js
```

---

## Kurallar (ajanlar)

1. **Tek seferlik `patch-*.js` ekleme.** Kalıcı iş ya bu scriptlere ya doğrudan kaynak dosyalara (`js/`, `lang/`) yazılır.
2. Yeni kalıcı Node aracı buraya (`tools/js/`) konur; shell betikleri `tools/sh/`.
3. `root = path.join(__dirname, '../..')` — `tools/js` altında bir seviye daha derine inme.
4. Runtime oyun kodu buraya konmaz (`js/ui`, `js/core`, `js/data` kullan).

Shell / sunucu betikleri: **[../sh/README.md](../sh/README.md)**
