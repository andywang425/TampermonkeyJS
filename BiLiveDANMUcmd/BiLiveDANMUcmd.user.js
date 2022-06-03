// ==UserScript==
// @name        bilibili直播弹幕修复
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description 修复bilibili直播弹幕
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @include     /^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @require     https://fastly.jsdelivr.net/gh/lzghzr/TampermonkeyJS@e4c2e5a14b55a5a0a3fab43f206496cb30c9b6e6/bliveproxy/bliveproxy.js
// @license     MIT
// @run-at      document-start
// ==/UserScript==
"use strict";
const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
W.bliveproxy.addCommandHandler('ALL', command => {
  if (command.cmd.startsWith('DANMU_MSG'))
    command.cmd = 'DANMU_MSG';
});