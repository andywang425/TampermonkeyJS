// ==UserScript==
// @name        I am Groot!
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.5
// @author      lzghzr
// @description I am Groot!
// @match       http://*/*
// @match       https://*/*
// @require     https://github.com/lzghzr/TampermonkeyJS/raw/75a1a97c8b010f78f986fa2c56646e910af419e2/libReplaceText/libReplaceText.js#sha256-zjITNEjaUMqzPJSSjGkZp6J7uHKibg4dBo6BbnJjG/k=
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
new ReplaceText([[/^[\s\S]*$/g, 'I am Groot!']], 'match');