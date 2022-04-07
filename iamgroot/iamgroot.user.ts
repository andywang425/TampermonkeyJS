// ==UserScript==
// @name        I am Groot!
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.5
// @author      lzghzr
// @description I am Groot!
// @match       http://*/*
// @match       https://*/*
// @require     https://cdn.jsdelivr.net/gh/lzghzr/TampermonkeyJS@4cc2a90f51182ada0aab944ee708a893ed4ee31f/libReplaceText/libReplaceText.js
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
import ReplaceText from '../libReplaceText/libReplaceText'

new ReplaceText([[/^[\s\S]*$/g, 'I am Groot!']], 'match')