const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
function loadPack(lang) {
  const pack = {};
  const sb = { window: {}, GAME: { i18n: { register(l, s, d) { pack[s] = d; } } } };
  sb.window.GAME = sb.GAME;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(root, 'lang', lang, 'pack.js'), 'utf8'), sb);
  return pack;
}
function emit(lang, sections) {
  let out = '/* Language pack: ' + lang + ' */\nwindow.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  fs.writeFileSync(path.join(root, 'lang', lang, 'pack.js'), out);
}
const tr = loadPack('tr');
const en = loadPack('en');
Object.assign(tr.ui, {
  settings: 'Ayarlar',
  settings_title: 'Ayarlar',
  set_language: 'Dil',
  set_volume: 'Ses',
  set_confirm_new: 'Yeni oyun başlatırken kayıt uyarısı göster',
  set_feed_collapsed: 'Oyun başında olay akışını daralt (masaüstü)',
  set_reset_glossary: 'Sözlük “bir daha gösterme” listesini sıfırla',
  set_reset_done: 'Sıfırlandı — yıldızlı açıklamalar yeniden açılır.',
  set_note: 'Ayarlar bu tarayıcıda kalıcı saklanır (localStorage). Sunucuya gitmez.',
  vol_mute: '🔇 Sessiz',
  vol_40: '🔉 %40',
  vol_100: '🔊 %100'
});
Object.assign(en.ui, {
  settings: 'Settings',
  settings_title: 'Settings',
  set_language: 'Language',
  set_volume: 'Volume',
  set_confirm_new: 'Warn before starting a new game (deletes save)',
  set_feed_collapsed: 'Collapse event feed by default (desktop)',
  set_reset_glossary: 'Reset “don’t show again” glossary list',
  set_reset_done: 'Cleared — starred explanations will show again.',
  set_note: 'Settings are stored in this browser only (localStorage). Not sent to the server.',
  vol_mute: '🔇 Mute',
  vol_40: '🔉 40%',
  vol_100: '🔊 100%'
});
emit('tr', tr);
emit('en', en);
console.log('settings ui ok');
