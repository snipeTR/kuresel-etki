# KÜRESEL ETKİ — Açık yapılacaklar (örnek / herkese açık)

> Kalıcı kurallar: [`AGENTS.md`](AGENTS.md)  
> Gerçek sunucu IP, SSH anahtarı ve kişisel yollar bu **public** repoda **yoktur**.  
> Yerel kopyanda `YAPILACAKLAR.md` tut (gitignore’da).  
> Sahiplik yedeği: private repo `kuresel-etki-secrets` (yalnızca repo sahibi erişir; public’e eklenmez).

## Yerel not (kendin doldur)

| Ne | Değer |
|----|--------|
| Canlı URL | _(kendi sunucun)_ |
| SSH | _(kendi anahtarın)_ |
| Deploy kökü | _(ör. /var/www/html/oyungrok)_ |

## Yapılacaklar (açık)

- [ ] Etki büyüklüklerinin oynayış geri bildirimiyle ince ayarı
- [ ] Grafik overlay sistemi (müdahale işaretleri grafikte)
- [ ] "Ne olurdu eğer" karşılaştırma modu (opsiyonel)

## localStorage anahtarları (istemci)

| Anahtar | Amaç |
|---------|------|
| `kureselEtkiSave_oyungrok` | Kalıcı oyun kaydı |
| `kureselEtkiTurnJob_oyungrok` | Yarım tur AI script |
| `keFeedCollapsed_oyungrok` | Feed daraltma |
| `keLang_oyungrok` | Dil (tr/en) |
| `keSettings_oyungrok` | Ayarlar (ses, chatSpeed slow|fast, …) |
| `keTunables_oyungrok` | Gelişmiş ayarlar (sabitler) |
| `keGlossSkip_oyungrok` | Sözlük “bir daha gösterme” |

> Gerçek sunucu IP / SSH **asla** bu public örneğe veya public commit’e yazılmaz.
