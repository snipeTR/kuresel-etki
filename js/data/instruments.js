/* ============ KÜRESEL ETKİ — Enstrümanlar (4 Katman + Makro Araçlar) ============ */
window.GAME = window.GAME || {};

/*
 Alanlar:
  type: 'toggle' | 'slider' | 'numerical'
  layer: 1..4  (1 Yapısal, 2 Konjonktürel, 3 Piyasa Operasyonları, 4 Gri Alan)
  targeted: hedef ülke seçilir (yaptırım vb.)
  project: uzun vadeli proje süresi (tur) — tamamlanınca 'complete' etkileri uygulanır (kalıcı)
  risk: 0-3 tespit riski (gri alan). Tespit → ilişki çöküşü + misilleme
  cost: siyasi sermaye maliyeti
  pulse:   değişiklik anında doğan etkiler [{k, s:'imm'|'short'|'med'|'long', m}]
           m = toplam etki; toggle'da delta=±1, slider'da delta=(yeni-eski)/100,
           numerical'da delta=(yeni-eski) birim başına
  sustain: açık kaldığı sürece tur başına etki [{k, m}] (seviyeyle orantılı)
  onTarget: hedef ülkeye etkiler {pulse:[], sustain:[], rel:aktivasyonda ilişki değişimi}
  complete: proje bitince kalıcı taban kaymaları [{k, m}] (kendi ülkesine; 'g:' küresel)
  groups: iç grup memnuniyet etkisi (aktivasyonda, delta ile orantılı)
  needsExporter: 'oil'|'food' — yalnızca negatif bağımlılık (ihracatçı) ise tam etki
  scaleReserves: onTarget reserves şokunu hedefin rezervine göre ölçekle
  Anahtarlar: growth, inflation, unemployment, reserves, debt, currency, trade, influence,
              approval, stability | küresel: g:oil, g:food, g:chip, g:dollar, g:ship, g:trade
*/

GAME.INSTRUMENTS = [

/* ================= TEMEL MAKRO ARAÇLAR (Katman 2 — Numerical) ================= */
{ id:'policy_rate', name:'Merkez Bankası Politika Faizi', layer:2, type:'numerical',
  unit:'%', min:0, max:60, step:0.5, cost:2, escalateCost:true,
  desc:'Para politikasının ana aracı. Artış: enflasyonu ve kuru baskılar ama büyümeyi yavaşlatır, işsizlik baskısı yaratır.',
  pulse:[ {k:'currency', s:'imm',  m:0.9},
          {k:'inflation',s:'short',m:-0.55},
          {k:'growth',  s:'short', m:-0.22},
          {k:'growth',  s:'med',   m:-0.10},
          {k:'unemployment', s:'med', m:0.08} ],
  sustain:[ {k:'inflation', m:-0.03}, {k:'growth', m:-0.008}, {k:'currency', m:0.02} ],
  groups:{business:-1.2, labor:-1.5, liberal:0.4} },

{ id:'tax_rate', name:'Vergi Oranı', layer:2, type:'numerical',
  unit:'%', min:5, max:60, step:1, cost:2, escalateCost:true,
  desc:'Genel vergi yükü. Artış bütçeyi/borcu rahatlatır ama büyümeyi, yatırımı ve toplum desteğini sıkar.',
  pulse:[ {k:'debt',   s:'short', m:-0.8},
          {k:'growth', s:'short', m:-0.15},
          {k:'approval',s:'imm',  m:-0.8},
          {k:'unemployment', s:'med', m:0.06} ],
  sustain:[ {k:'debt', m:-0.04}, {k:'growth', m:-0.006} ],
  groups:{business:-1.5, labor:-1.0, rural:-0.8} },

{ id:'public_spending', name:'Kamu Harcaması / Borçlanma', layer:2, type:'numerical',
  unit:'% GDP', min:0, max:20, step:0.5, cost:2, escalateCost:true,
  desc:'Kamu yatırımı ve harcama seviyesi. Büyümeyi canlandırır ama borç ve enflasyon üretir.',
  pulse:[ {k:'growth',   s:'short', m:0.35},
          {k:'inflation',s:'short', m:0.25},
          {k:'debt',     s:'med',   m:1.6},
          {k:'unemployment', s:'short', m:-0.2} ],
  sustain:[ {k:'debt', m:0.12}, {k:'growth', m:0.01}, {k:'inflation', m:0.02} ],
  groups:{labor:1.2, rural:1.0, business:0.3, bureau:0.8} },

{ id:'fx_intervention', name:'Döviz Müdahalesi', layer:2, type:'numerical',
  unit:' mlr$', min:0, max:150, step:5, cost:3,
  desc:'Rezerv satarak kuru savunmak. Ucuz ama sık kullanım siyasi sermaye yenilenmesini aşındırır; enflasyon gecikmeli yükselir. Seviye açık kaldıkça rezerv hızla erir.',
  pulse:[ {k:'currency', s:'imm', m:0.09},
          {k:'reserves', s:'imm', m:-1.15} ],
  sustain:[ {k:'currency', m:0.018}, {k:'reserves', m:-0.48} ],
  groups:{business:0.2} },

{ id:'qe', name:'Miktarsal Gevşeme (QE / Bilanço)', layer:2, type:'numerical',
  unit:'% GDP', min:0, max:25, step:0.5, cost:9,
  desc:'Merkez bankası varlık alımıyla likidite basmak. Büyüme ve varlık fiyatlarını destekler; enflasyon ve kur riski yaratır.',
  pulse:[ {k:'growth', s:'short', m:0.18},
          {k:'inflation', s:'med', m:0.22},
          {k:'currency', s:'imm', m:-0.35},
          {k:'debt', s:'med', m:-0.4} ],
  sustain:[ {k:'growth', m:0.012}, {k:'inflation', m:0.04}, {k:'currency', m:-0.03} ],
  groups:{business:2, labor:0.5, liberal:-0.5} },

/* ================= KATMAN 1 — YAPISAL / STRATEJİK (Uzun Vade) ================= */
{ id:'reserve_currency', name:'Rezerv Para Birimi Statüsü İnşası', layer:1, type:'toggle',
  project:32, cost:15,
  desc:'Kendi para biriminle enerji ve emtia ticaretini zorlamak. 8 yıllık dev proje.',
  pulse:[ {k:'influence', s:'med', m:2}, {k:'debt', s:'med', m:3} ],
  sustain:[ {k:'influence', m:0.15}, {k:'debt', m:0.15} ],
  complete:[ {k:'currency', m:12}, {k:'influence', m:12}, {k:'g:dollar', m:-8} ],
  groups:{nationalist:4, business:2} },

{ id:'alt_finance', name:'Alternatif Finansal Altyapı (SWIFT Rakibi)', layer:1, type:'toggle',
  project:28, cost:12,
  desc:'Yaptırımlara dirençli alternatif ödeme sistemi kurmak ve yaygınlaştırmak.',
  pulse:[ {k:'debt', s:'med', m:2} ],
  sustain:[ {k:'influence', m:0.12} ],
  complete:[ {k:'influence', m:8}, {k:'trade', m:15}, {k:'g:dollar', m:-5} ],
  groups:{nationalist:3, bureau:2} },

{ id:'capital_markets', name:'Derin Sermaye Piyasaları Oluşturmak', layer:1, type:'toggle',
  project:24, cost:10,
  desc:'Tahvil ve hisse piyasalarını küresel yatırımcılar için güvenli liman yapmak.',
  sustain:[ {k:'reserves', m:1.5} ],
  complete:[ {k:'debt', m:-10}, {k:'reserves', m:80}, {k:'growth', m:0.4} ],
  groups:{business:5, liberal:2} },

{ id:'cbdc', name:'CBDC ile Dolarsızlaşma', layer:1, type:'toggle',
  project:20, cost:10,
  desc:'Sınır ötesi ödemelerde programlanabilir dijital merkez bankası parası.',
  sustain:[ {k:'influence', m:0.08} ],
  complete:[ {k:'influence', m:6}, {k:'currency', m:5}, {k:'g:dollar', m:-4} ],
  groups:{bureau:3, liberal:-1, nationalist:2} },

{ id:'infra_corridor', name:'Altyapı Kuşağı ve Ulaştırma Koridorları', layer:1, type:'toggle',
  project:28, cost:14,
  desc:'Büyük altyapı projeleriyle küresel tedarik zincirlerini kendine bağlamak.',
  pulse:[ {k:'debt', s:'med', m:6}, {k:'growth', s:'med', m:0.5} ],
  sustain:[ {k:'influence', m:0.1}, {k:'debt', m:0.2} ],
  complete:[ {k:'trade', m:30}, {k:'influence', m:10}, {k:'growth', m:0.6}, {k:'g:ship', m:-6} ],
  groups:{business:3, labor:2, nationalist:2} },

{ id:'brain_gain', name:'Beyin Göçü Programı', layer:1, type:'slider', cost:8,
  desc:'Seçici vize ve vatandaşlıkla nitelikli insan çekmek. Ar-Ge kapasitesini büyütür; bütçe ve toplumsal gerilim maliyeti vardır.',
  pulse:[ {k:'growth', s:'med', m:0.6}, {k:'debt', s:'short', m:1.5} ],
  sustain:[ {k:'growth', m:0.02}, {k:'influence', m:0.03}, {k:'debt', m:0.08} ],
  groups:{business:2, liberal:2, nationalist:-2} },

{ id:'migration_weapon', name:'Göç Silahı', layer:1, type:'toggle', targeted:true, risk:1, cost:12,
  desc:'Sınırları kontrollü açarak hedef ülkenin sosyal ve bütçe yükünü artırmak.',
  onTarget:{ rel:-45,
    pulse:[ {k:'stability', s:'short', m:-6}, {k:'approval', s:'short', m:-4}, {k:'debt', s:'med', m:3},
            {k:'unemployment', s:'med', m:0.8} ] },
  groups:{nationalist:2, liberal:-4} },

{ id:'eez_expansion', name:'Stratejik Deniz Yetki Alanı Genişletme', layer:1, type:'toggle',
  project:24, cost:10,
  desc:'MEB ilanları ve kıta sahanlığı başvurularıyla kaynak haklarını büyütmek.',
  pulse:[ {k:'influence', s:'med', m:2} ],
  complete:[ {k:'reserves', m:40}, {k:'influence', m:6}, {k:'trade', m:8} ],
  groups:{nationalist:4} },

{ id:'space_deepsea', name:'Uzay ve Derin Deniz Kaynakları', layer:1, type:'toggle',
  project:36, cost:12,
  desc:'Uzay madenciliği ve okyanus tabanına yatırım. Geleceğin kaynaklarında avantaj.',
  pulse:[ {k:'debt', s:'med', m:4} ],
  complete:[ {k:'growth', m:0.8}, {k:'influence', m:10}, {k:'g:chip', m:-5} ],
  groups:{business:2, nationalist:2} },

{ id:'tech_standards', name:'Teknoloji Standartlarını Dikte Etmek', layer:1, type:'toggle',
  project:24, cost:10,
  desc:'5G/6G ve yapay zeka standartlarını küresel norm haline getirmek.',
  sustain:[ {k:'influence', m:0.08} ],
  complete:[ {k:'influence', m:8}, {k:'growth', m:0.4}, {k:'trade', m:12} ],
  groups:{business:3, liberal:1} },

{ id:'ip_regime', name:'Kapsamlı Fikri Mülkiyet Rejimi', layer:1, type:'toggle',
  project:24, cost:8,
  desc:'Patent ve tasarımları uluslararası anlaşmalarla korumak; değer zincirinden pay almak.',
  complete:[ {k:'trade', m:10}, {k:'growth', m:0.3}, {k:'influence', m:4} ],
  groups:{business:3} },

{ id:'edu_export', name:'Eğitim ve Dil İhracatı', layer:1, type:'slider', cost:6,
  desc:'Burs programları, kampüsler ve dil kurslarıyla yumuşak güç inşası.',
  pulse:[ {k:'debt', s:'short', m:0.8} ],
  sustain:[ {k:'influence', m:0.06}, {k:'debt', m:0.04} ],
  groups:{liberal:2, bureau:1} },

{ id:'brussels_effect', name:'Hukuki Empoze (Brüksel Etkisi)', layer:1, type:'toggle',
  project:20, cost:10,
  desc:'Kendi regülasyonlarını küresel şirketlere dayatmak.',
  complete:[ {k:'influence', m:7}, {k:'trade', m:8} ],
  groups:{bureau:3, liberal:2, business:-1} },

{ id:'rd_policy', name:'Stratejik Ar-Ge ve Sanayi Politikası', layer:1, type:'slider', cost:9,
  desc:'Devlet destekli Ar-Ge, teknoloji parkları ve ileri sanayi yatırımı. Uzun vadeli verimlilik artışı.',
  pulse:[ {k:'debt', s:'short', m:2}, {k:'growth', s:'med', m:0.35} ],
  sustain:[ {k:'growth', m:0.025}, {k:'debt', m:0.12}, {k:'influence', m:0.02} ],
  groups:{business:2, labor:1, liberal:1, rural:-0.5} },

/* ================= KATMAN 2 — KONJONKTÜREL MÜDAHALE ================= */
{ id:'chokepoint', name:'Tedarik Zinciri Silahlaştırması', layer:2, type:'toggle', targeted:true, cost:12,
  desc:'Kritik hammadde ihracatına kota/lisans getirmek. Küresel üretimi sarsar; kendi ihracatın da daralır.',
  pulse:[ {k:'g:chip', s:'imm', m:8}, {k:'g:ship', s:'imm', m:5}, {k:'trade', s:'short', m:-8},
          {k:'growth', s:'short', m:-0.15} ],
  onTarget:{ rel:-50,
    pulse:[ {k:'growth', s:'short', m:-0.8}, {k:'inflation', s:'short', m:1.2}, {k:'g:chip', s:'imm', m:3} ] },
  groups:{nationalist:3, business:-2} },

{ id:'subsidy', name:'Sübvansiyon Savaşları', layer:2, type:'slider', cost:8,
  desc:'Stratejik sektörlere devlet teşviki. Yerli üretici güçlenir, bütçe zorlanır; aşırı kullanım enflasyon üretir.',
  pulse:[ {k:'growth', s:'short', m:0.7}, {k:'unemployment', s:'short', m:-0.6}, {k:'inflation', s:'med', m:0.3} ],
  sustain:[ {k:'debt', m:0.35}, {k:'growth', m:0.015}, {k:'inflation', m:0.02} ],
  groups:{business:3, labor:3, rural:2} },

{ id:'anti_dumping', name:'Anti-Damping ve Telafi Edici Vergi', layer:2, type:'toggle', targeted:true, cost:6,
  desc:'"Haksız rekabet" gerekçesiyle korunma önlemleri. İthalatı kısar, iç fiyatları yükseltir.',
  pulse:[ {k:'trade', s:'short', m:6}, {k:'inflation', s:'short', m:0.4}, {k:'growth', s:'short', m:0.1} ],
  onTarget:{ rel:-25, pulse:[ {k:'trade', s:'short', m:-8}, {k:'growth', s:'short', m:-0.15} ] },
  groups:{business:2, labor:2} },

{ id:'strategic_stock', name:'Stratejik Stok Yönetimi', layer:2, type:'slider', cost:6,
  desc:'Petrol, gıda, tahıl stok seviyesi. Yüksek stok iç fiyatları korur; alım döneminde küresel fiyatı iter.',
  pulse:[ {k:'g:food', s:'imm', m:4}, {k:'g:oil', s:'imm', m:3}, {k:'debt', s:'short', m:1.2} ],
  sustain:[ {k:'inflation', m:-0.06}, {k:'stability', m:0.08}, {k:'debt', m:0.05} ],
  groups:{rural:3, labor:2} },

{ id:'capital_controls', name:'Makro-İhtiyati Tedbirler (Sermaye Kontrolü)', layer:2, type:'slider', cost:10,
  desc:'Sıcak para giriş/çıkışını zorlaştırmak. Kur şoklarını azaltır, yatırımcıyı ürkütür, büyüme yavaşlar.',
  pulse:[ {k:'currency', s:'imm', m:4}, {k:'reserves', s:'short', m:-8} ],
  sustain:[ {k:'currency', m:0.05}, {k:'growth', m:-0.015}, {k:'reserves', m:-0.3}, {k:'trade', m:-0.4} ],
  groups:{business:-4, nationalist:1, bureau:1} },

{ id:'shadow_fx', name:'Gölge Döviz Piyasası Müdahalesi', layer:2, type:'toggle', risk:1, cost:8,
  desc:'Kamu bankalarıyla gizli kur müdahalesi. Görünmez ama rezervi eritir; enflasyon yüksekse etkinliği düşer.',
  sustain:[ {k:'currency', m:0.35}, {k:'reserves', m:-3.5} ],
  groups:{bureau:1, liberal:-1} },

{ id:'debt_trap', name:'Borç Tuzağı Diplomasisi', layer:2, type:'toggle', targeted:true, risk:1, cost:10,
  desc:'Hedefe ödeyemeyeceği stratejik kredi açmak. Kısa vadede hedef büyür; orta vadede borç bağımlılığı ve nüfuz.',
  pulse:[ {k:'reserves', s:'imm', m:-25}, {k:'influence', s:'short', m:1} ],
  sustain:[ {k:'influence', m:0.1} ],
  onTarget:{ rel:-15,
    pulse:[ {k:'debt', s:'med', m:8}, {k:'growth', s:'short', m:0.5}, {k:'reserves', s:'imm', m:20} ],
    sustain:[ {k:'debt', m:0.4} ] },
  groups:{nationalist:2, business:1} },

{ id:'secondary_sanctions', name:'İkincil Yaptırımlar', layer:2, type:'toggle', targeted:true, cost:14,
  desc:'Hedefle ticaret yapan üçüncü tarafları da cezalandırmak. Etki alanı geniş, küresel ticaret ve kendi ihracatın da zarar görür.',
  pulse:[ {k:'trade', s:'short', m:-10}, {k:'g:trade', s:'short', m:-2}, {k:'growth', s:'short', m:-0.2},
          {k:'influence', s:'imm', m:1.5} ],
  onTarget:{ rel:-60,
    pulse:[ {k:'growth', s:'short', m:-1.2}, {k:'trade', s:'short', m:-25}, {k:'currency', s:'imm', m:-6},
            {k:'reserves', s:'short', m:-20} ],
    sustain:[ {k:'growth', m:-0.05}, {k:'trade', m:-2} ] },
  groups:{nationalist:4, liberal:-2, business:-2} },

{ id:'asset_freeze', name:'Varlık Dondurma ve El Koyma', layer:2, type:'toggle', targeted:true, cost:14,
  scaleReserves:true,
  desc:'Hedefin merkez bankası rezervlerine ve elit varlıklarına el koymak. Etki hedefin rezerv büyüklüğüne ve senin finansal gücüne bağlıdır.',
  onTarget:{ rel:-80,
    pulse:[ {k:'reserves', s:'imm', m:-100}, {k:'currency', s:'imm', m:-8}, {k:'stability', s:'short', m:-5},
            {k:'debt', s:'short', m:3} ] },
  pulse:[ {k:'influence', s:'imm', m:2}, {k:'g:dollar', s:'short', m:1} ],
  groups:{nationalist:4, business:-1, liberal:-2} },

{ id:'service_ban', name:'Teknik Servis Yasağı', layer:2, type:'toggle', targeted:true, cost:8,
  desc:'Uçak motoru, yazılım, bakım hizmetlerini kesmek. Hedefin altyapısı yavaşça çöker; senin firmaların da ciro kaybeder.',
  pulse:[ {k:'trade', s:'short', m:-3} ],
  onTarget:{ rel:-40,
    sustain:[ {k:'growth', m:-0.06}, {k:'stability', m:-0.15}, {k:'trade', m:-0.8} ] },
  groups:{nationalist:2, business:-1} },

{ id:'food_weapon', name:'Gıda ve Tohum Silahı', layer:2, type:'toggle', targeted:true, risk:1, cost:12,
  needsExporter:'food',
  desc:'Gıda ihracatını yasaklamak veya tohum bağımlılığı yaratmak. Gıda ihracatçılarında tam etki; ithalatçılarda zayıf.',
  pulse:[ {k:'g:food', s:'imm', m:10}, {k:'trade', s:'short', m:-6} ],
  onTarget:{ rel:-55,
    pulse:[ {k:'inflation', s:'short', m:2.5}, {k:'stability', s:'short', m:-6}, {k:'approval', s:'short', m:-3} ] },
  groups:{nationalist:2, rural:2, liberal:-3} },

{ id:'energy_weapon', name:'Enerji İhracat Kısıtı / Enerji Silahı', layer:2, type:'toggle', targeted:true, cost:13,
  needsExporter:'oil',
  desc:'Petrol/gaz ihracatını kısıtlayarak hedefi ve küresel enerji fiyatlarını vurmak. Enerji ihracatçılarında güçlü; aksi halde zayıf.',
  pulse:[ {k:'g:oil', s:'imm', m:14}, {k:'trade', s:'short', m:-12}, {k:'growth', s:'short', m:-0.25},
          {k:'reserves', s:'short', m:-15} ],
  onTarget:{ rel:-55,
    pulse:[ {k:'inflation', s:'imm', m:2.0}, {k:'growth', s:'short', m:-1.0}, {k:'stability', s:'short', m:-4} ],
    sustain:[ {k:'inflation', m:0.15}, {k:'growth', m:-0.04} ] },
  groups:{nationalist:4, business:-2, rural:1} },

{ id:'tariff', name:'Genel Gümrük Tarifesi', layer:2, type:'slider', targeted:true, cost:7,
  desc:'Hedef ülkeye karşı genel gümrük duvarı. Yerli sanayiyi korur, enflasyon ve misilleme riski yaratır.',
  pulse:[ {k:'trade', s:'short', m:3}, {k:'inflation', s:'short', m:0.35}, {k:'growth', s:'short', m:0.05} ],
  sustain:[ {k:'inflation', m:0.02}, {k:'trade', m:0.3} ],
  onTarget:{ rel:-20,
    pulse:[ {k:'trade', s:'short', m:-6}, {k:'growth', s:'short', m:-0.12} ],
    sustain:[ {k:'trade', m:-0.6} ] },
  groups:{business:1.5, labor:2, liberal:-1} },

{ id:'export_credit', name:'İhracat Kredisi ve Exim Desteği', layer:2, type:'slider', cost:7,
  desc:'İhracatçılara ucuz kredi ve garanti. Ticaret dengesini ve büyümeyi destekler; bütçe ve risk maliyeti vardır.',
  pulse:[ {k:'trade', s:'short', m:8}, {k:'growth', s:'short', m:0.25}, {k:'debt', s:'med', m:1.5} ],
  sustain:[ {k:'trade', m:0.8}, {k:'growth', m:0.01}, {k:'debt', m:0.1} ],
  groups:{business:3, labor:1} },

{ id:'currency_swap', name:'İkili Döviz Swap Hattı', layer:2, type:'toggle', targeted:true, cost:8,
  desc:'Hedefle karşılıklı döviz swap anlaşması. Her iki tarafta da likidite ve güven artar; ilişki güçlenir.',
  pulse:[ {k:'reserves', s:'imm', m:8}, {k:'currency', s:'short', m:1.5}, {k:'influence', s:'short', m:1} ],
  onTarget:{ rel:25,
    pulse:[ {k:'reserves', s:'imm', m:12}, {k:'currency', s:'short', m:2}, {k:'stability', s:'short', m:2} ] },
  groups:{business:2, bureau:1, liberal:1} },

{ id:'price_controls', name:'Fiyat Kontrolleri', layer:2, type:'slider', cost:8,
  desc:'Temel mallarda tavan fiyat. Kısa vadede enflasyonu ve öfkeyi bastırır; orta vadede kıtlık, kara borsa ve yatırım cayması.',
  pulse:[ {k:'inflation', s:'imm', m:-1.2}, {k:'approval', s:'imm', m:2}, {k:'stability', s:'short', m:1.5} ],
  sustain:[ {k:'inflation', m:-0.08}, {k:'growth', m:-0.02}, {k:'stability', m:-0.05} ],
  groups:{labor:3, rural:2, business:-3, liberal:-1} },

{ id:'aid_diplomacy', name:'Kalkınma Yardımı Diplomasisi', layer:2, type:'toggle', targeted:true, cost:9,
  desc:'Hedefe ekonomik yardım ve yumuşak kredi. İlişki ve nüfuz kazanırsın; bütçe ve rezerv maliyeti vardır.',
  pulse:[ {k:'reserves', s:'imm', m:-12}, {k:'debt', s:'short', m:1.5}, {k:'influence', s:'med', m:2} ],
  sustain:[ {k:'influence', m:0.08} ],
  onTarget:{ rel:35,
    pulse:[ {k:'growth', s:'short', m:0.35}, {k:'stability', s:'short', m:2}, {k:'reserves', s:'imm', m:10} ] },
  groups:{liberal:2, bureau:1, nationalist:-1} },

/* ================= KATMAN 3 — MİKRO / PİYASA OPERASYONLARI ================= */
{ id:'espionage', name:'Ekonomik Casusluk ve Rekabet İstihbaratı', layer:3, type:'toggle', targeted:true, risk:2, cost:10,
  desc:'Devlet destekli siber operasyonlarla Ar-Ge sırlarını almak.',
  sustain:[ {k:'growth', m:0.03}, {k:'influence', m:0.02} ],
  onTarget:{ rel:0, sustain:[ {k:'growth', m:-0.02}, {k:'trade', m:-0.3} ] },
  groups:{nationalist:2, liberal:-2} },

{ id:'insider_trading', name:'İçeriden Öğrenenlerin Ticareti (Devlet Bağlantılı)', layer:3, type:'toggle', risk:3, cost:12,
  desc:'Jeopolitik bilgiyle borsada pozisyon almak. Rezervi büyütür, skandalı büyük olur.',
  sustain:[ {k:'reserves', m:2.5} ],
  groups:{liberal:-2, business:1} },

{ id:'rating_pressure', name:'Derecelendirme ve Endeks Baskısı', layer:3, type:'toggle', targeted:true, risk:2, cost:10,
  desc:'Hedefin kredi notunu siyasi baskıyla düşürtmek, endekslerden çıkartmak. Finans merkezleri daha etkili.',
  pulse:[ {k:'influence', s:'imm', m:0.5} ],
  onTarget:{ rel:-30,
    pulse:[ {k:'currency', s:'imm', m:-5}, {k:'debt', s:'short', m:4}, {k:'reserves', s:'short', m:-35},
            {k:'growth', s:'short', m:-0.25} ] },
  groups:{business:1} },

{ id:'national_champion', name:'Kartel ve Tekel Teşvikleri (Ulusal Şampiyon)', layer:3, type:'toggle', cost:8,
  desc:'Yerli devlerin birleşmesine izin vererek küresel rekabet gücü yaratmak. Verimlilik artar, rekabet ve fiyat disiplini bozulur.',
  pulse:[ {k:'growth', s:'med', m:0.5}, {k:'inflation', s:'med', m:0.5}, {k:'trade', s:'med', m:4} ],
  sustain:[ {k:'trade', m:1.2}, {k:'inflation', m:0.03} ],
  groups:{business:4, labor:-1, liberal:-1} },

{ id:'patent_revoke', name:'Lisans ve Patent İptalleri', layer:3, type:'toggle', targeted:true, risk:2, cost:8,
  desc:'Zorunlu lisanslama veya yabancı patentleri geçersiz kılmak. Kısa vadeli üretim kazancı, uzun vadeli itibar kaybı.',
  pulse:[ {k:'growth', s:'short', m:0.3}, {k:'influence', s:'short', m:-1} ],
  onTarget:{ rel:-35, pulse:[ {k:'trade', s:'short', m:-6}, {k:'growth', s:'short', m:-0.1} ] },
  groups:{business:1, nationalist:2, liberal:-1} },

{ id:'cert_weapon', name:'Sertifikasyon Silahlaştırma', layer:3, type:'toggle', targeted:true, risk:1, cost:6,
  desc:'Helal/organik/etik standartları ticaret engeline dönüştürmek.',
  pulse:[ {k:'trade', s:'short', m:4}, {k:'inflation', s:'short', m:0.15} ],
  onTarget:{ rel:-20, pulse:[ {k:'trade', s:'short', m:-5} ] },
  groups:{rural:1, nationalist:1} },

{ id:'jawboning', name:'Piyasa Duyarlılığı Yönetimi (Jawboning)', layer:3, type:'slider', cost:4,
  desc:'Üst düzey açıklamalarla piyasa algısını yönlendirmek. Ucuz ama kısa ömürlü; aşırı kullanım güveni aşındırır.',
  pulse:[ {k:'currency', s:'imm', m:2.5}, {k:'approval', s:'imm', m:0.5} ],
  sustain:[ {k:'currency', m:0.02} ],
  groups:{bureau:0.5} },

{ id:'disinfo', name:'Dezenformasyon ve Kara Propaganda', layer:3, type:'toggle', targeted:true, risk:3, cost:12,
  desc:'Hedefin bankacılık sistemi hakkında panik söylentileri yaymak.',
  onTarget:{ rel:0,
    pulse:[ {k:'currency', s:'imm', m:-4}, {k:'stability', s:'short', m:-5}, {k:'reserves', s:'short', m:-40},
            {k:'approval', s:'short', m:-2} ] },
  groups:{liberal:-2, nationalist:1} },

/* ================= KATMAN 4 — GRİ ALAN (Melez / Politik) ================= */
{ id:'ngo_use', name:'Devlet Dışı Aktörlerin Kullanımı (NGO)', layer:4, type:'toggle', targeted:true, risk:2, cost:12,
  desc:'Fonlanan STK\'larla hedef ülkede protesto ve siyasi baskı üretmek.',
  pulse:[ {k:'debt', s:'short', m:1} ],
  onTarget:{ rel:0,
    sustain:[ {k:'stability', m:-0.4}, {k:'approval', m:-0.3} ] },
  groups:{liberal:-2, nationalist:1} },

{ id:'corruption_net', name:'Yolsuzluk ve Nüfuz Ticareti', layer:4, type:'toggle', targeted:true, risk:3, cost:14,
  desc:'Gri ödemelerle yabancı yetkililer üzerinde nüfuz kurmak.',
  pulse:[ {k:'reserves', s:'imm', m:-5} ],
  sustain:[ {k:'influence', m:0.12}, {k:'trade', m:1.5} ],
  onTarget:{ rel:0, sustain:[ {k:'stability', m:-0.2} ] },
  groups:{liberal:-3, bureau:-1} },

{ id:'insurgency_finance', name:'İsyanın Ekonomik Finansmanı', layer:4, type:'toggle', targeted:true, risk:3, cost:16,
  desc:'Hedef ülkedeki ayrılıkçı grupları ekonomik olarak desteklemek. En tehlikeli araç.',
  pulse:[ {k:'reserves', s:'imm', m:-8}, {k:'influence', s:'short', m:-1} ],
  onTarget:{ rel:0,
    sustain:[ {k:'stability', m:-0.8}, {k:'growth', m:-0.05}, {k:'approval', m:-0.2} ] },
  groups:{liberal:-4, nationalist:2} },

{ id:'lawfare', name:'Uluslararası Hukuk İstismarı (Lawfare)', layer:4, type:'toggle', targeted:true, risk:1, cost:8,
  desc:'Yatırım anlaşmaları ve mahkemeler üzerinden sürekli dava baskısı.',
  onTarget:{ rel:-25,
    sustain:[ {k:'growth', m:-0.02}, {k:'reserves', m:-3}, {k:'trade', m:-0.4} ] },
  sustain:[ {k:'influence', m:0.04} ],
  groups:{bureau:1} }
];

GAME.LAYERS = {
  1:{name:'Yapısal Strateji',      short:'Yapısal'},
  2:{name:'Konjonktürel Müdahale', short:'Konjonktürel'},
  3:{name:'Piyasa Operasyonları',  short:'Piyasa Op.'},
  4:{name:'Gri Alan Taktikleri',   short:'Gri Alan'}
};

GAME.INSTRUMENTS_BY_ID = {};
GAME.INSTRUMENTS.forEach(i => GAME.INSTRUMENTS_BY_ID[i.id] = i);
