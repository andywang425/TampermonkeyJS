// ==UserScript==
// @name        AutoMagnet
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description 自动补全磁力链
// @match       http://*/*
// @match       https://*/*
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
"use strict";
document.addEventListener('copy', ev => {
  const selection = document.getSelection();
  const clipboardData = ev.clipboardData;
  if (selection !== null && clipboardData !== null) {
    const copyText = selection.toString().trim();
    if (copyText.match(/^[0-9a-zA-Z]{40}$/)) {
      const magnet = 'magnet:?xt=urn:btih:' + copyText;
      clipboardData.setData('text/plain', magnet);
      ev.preventDefault();
    }
  }
});