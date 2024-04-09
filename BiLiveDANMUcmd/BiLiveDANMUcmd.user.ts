// ==UserScript==
// @name        bilibili直播弹幕修复
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.2
// @author      lzghzr
// @description 修复bilibili直播弹幕
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @include     /^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @require     https://github.com/lzghzr/TampermonkeyJS/raw/a81315bc497aeeb7b5e7b9acd5aeaf41a13ef2e3/bliveproxy/bliveproxy_inline.js#sha256-voXUaa+mxDJt0KsqyZ4sGt8vS/TJndo9UZRYnh3C1h0=
// @license     MIT
// @run-at      document-start
// ==/UserScript==

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
// @ts-ignore
W.bliveproxy.addCommandHandler('ALL', command => {
  if (command.cmd.startsWith('DANMU_MSG')) command.cmd = 'DANMU_MSG'
})