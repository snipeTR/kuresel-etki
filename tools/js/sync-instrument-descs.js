#!/usr/bin/env node
/**
 * Enstrüman name/desc senkronu:
 *  - js/data/instruments.js  (TR kaynak / baseline)
 *  - lang/tr/pack.js instruments
 *  - lang/en/pack.js instruments
 *
 * Kullanım:
 *   node tools/sync-instrument-descs.js           # rapor (eksik/farklı)
 *   node tools/sync-instrument-descs.js --fix-tr  # TR pack'i data desc ile doldur
 *   node tools/sync-instrument-descs.js --check   # hata kodu 1 eğer TR desc boşsa
 *
 * Ajan kuralı: enstrüman mantığı veya maliyeti değişince
 *  1) instruments.js desc güncelle
 *  2) lang/tr + lang/en instruments[id].name/desc güncelle
 *  3) bu scripti --check ile çalıştır
 *  4) CHANGELOG + git push + sunucu deploy
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '../..');

function loadInstruments() {
  const sandbox = { window: {}, console };
  sandbox.window.GAME = sandbox.GAME = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/data/instruments.js'), 'utf8'), sandbox);
  return sandbox.GAME.INSTRUMENTS;
}

function loadPack(lang) {
  const pack = {};
  const sb = { window: {}, GAME: { i18n: { register(l, s, d) { pack[s] = d; } } } };
  sb.window.GAME = sb.GAME;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(root, 'lang', lang, 'pack.js'), 'utf8'), sb);
  return pack;
}

function emitPack(lang, sections) {
  let out = '/* Language pack: ' + lang + ' */\nwindow.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  fs.writeFileSync(path.join(root, 'lang', lang, 'pack.js'), out);
}

const fillTr = process.argv.includes('--fill-tr');
const check = process.argv.includes('--check');
const instruments = loadInstruments();
const tr = loadPack('tr');
const en = loadPack('en');
if (!tr.instruments) tr.instruments = {};
if (!en.instruments) en.instruments = {};

let missingTr = 0, missingEn = 0, staleTr = 0;
instruments.forEach(ins => {
  const t = tr.instruments[ins.id] || {};
  const e = en.instruments[ins.id] || {};
  if (!t.desc) {
    missingTr++;
    console.log('[TR missing desc]', ins.id);
    if (fillTr) tr.instruments[ins.id] = Object.assign({}, t, { name: t.name || ins.name, desc: ins.desc });
  } else if (t.desc !== ins.desc && fillTr) {
    // fill-tr only fills empty; report mismatch
    staleTr++;
    console.log('[TR desc ≠ data]', ins.id);
  } else if (t.desc !== ins.desc) {
    staleTr++;
    console.log('[TR desc ≠ data]', ins.id, '\n  data:', (ins.desc || '').slice(0, 80), '\n  pack:', (t.desc || '').slice(0, 80));
  }
  if (!e.desc) {
    missingEn++;
    console.log('[EN missing desc]', ins.id);
  }
  if (!t.name) console.log('[TR missing name]', ins.id);
  if (!e.name) console.log('[EN missing name]', ins.id);
});

if (fillTr) {
  emitPack('tr', tr);
  console.log('TR pack rewritten from data where missing.');
}

console.log('---');
console.log('instruments', instruments.length);
console.log('missingTrDesc', missingTr, 'missingEnDesc', missingEn, 'trDataMismatch', staleTr);
console.log('(mismatch: TR pack should match instruments.js for TR baseline; EN is translated)');

if (check && (missingTr || missingEn)) process.exit(1);
if (check && staleTr) {
  console.log('HINT: Update lang/tr/pack.js instruments[].desc to match instruments.js (or copy data→tr).');
  process.exit(1);
}
process.exit(0);
