/* Inject chat speed UI strings into lang packs */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function stripChatKeys(s) {
  return s.replace(/,"set_chat_speed":"[^"]*"(,"set_chat_[^"]*":"[^"]*")*/g, '');
}

function inject(file, volumeKey, add) {
  const p = path.join(root, file);
  let s = stripChatKeys(fs.readFileSync(p, 'utf8'));
  if (!s.includes(volumeKey)) {
    console.error('missing', volumeKey, 'in', file);
    process.exit(1);
  }
  s = s.replace(volumeKey, volumeKey + add);
  fs.writeFileSync(p, s);
  console.log('ok', file);
}

inject(
  'lang/tr/pack.js',
  '"set_volume":"Ses"',
  ',"set_chat_speed":"Chat hızı"' +
    ',"set_chat_slow":"Yavaş"' +
    ',"set_chat_fast":"Hızlı"' +
    ',"set_chat_slow_hint":"Ülke başına 0,5–2 sn (varsayılan)"' +
    ',"set_chat_fast_hint":"Her ülke 0,2 sn"' +
    ',"set_chat_speed_note":"Olay akışında AI ülkelerin karar gecikmesi. Yavaş = mevcut tempo; hızlı = 0,2 sn/ülke."'
);

inject(
  'lang/en/pack.js',
  '"set_volume":"Volume"',
  ',"set_chat_speed":"Chat speed"' +
    ',"set_chat_slow":"Slow"' +
    ',"set_chat_fast":"Fast"' +
    ',"set_chat_slow_hint":"0.5–2 s per country (default)"' +
    ',"set_chat_fast_hint":"0.2 s per country"' +
    ',"set_chat_speed_note":"Delay between AI country decisions in the event feed. Slow = current pace; fast = 0.2 s per country."'
);
