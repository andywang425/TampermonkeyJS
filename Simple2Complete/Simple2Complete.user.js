// ==UserScript==
// @name        Simple2Complete
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description 搜索引擎直接跳转论坛完整版
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @include     /^https?:\/\/.*\/(:?archiver|simple)\/(:?\?|t)/
// @license     MIT
// @grant       none
// @run-at      document-end
// ==/UserScript==
const end = document.querySelector('#end') || document.querySelector('#footer');
if (end !== null) {
    const link = end.querySelector('a');
    location.href = link.href;
}
else {
    const link = document.querySelector('a');
    location.href = link.href;
}