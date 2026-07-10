/* Copy instruments.js name/desc into lang/tr/pack.js instruments section */
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

function emit(lang, sections) {
  let out = '/* Language pack: ' + lang + ' */\nwindow.GAME = window.GAME || {};\n(function () {\n';
  out += "  var R = function (s, d) { GAME.i18n.register('" + lang + "', s, d); };\n";
  for (const [sec, data] of Object.entries(sections)) {
    out += '  R(' + JSON.stringify(sec) + ', ' + JSON.stringify(data) + ');\n';
  }
  out += '})();\n';
  fs.writeFileSync(path.join(root, 'lang', lang, 'pack.js'), out);
}

const instruments = loadInstruments();
const tr = loadPack('tr');
if (!tr.instruments) tr.instruments = {};
let n = 0;
instruments.forEach(ins => {
  const cur = tr.instruments[ins.id] || {};
  const next = Object.assign({}, cur, {
    name: cur.name || ins.name,
    desc: ins.desc
  });
  if (JSON.stringify(cur) !== JSON.stringify(next)) n++;
  tr.instruments[ins.id] = next;
});
emit('tr', tr);
console.log('TR instruments name/desc aligned from instruments.js, changed', n);
