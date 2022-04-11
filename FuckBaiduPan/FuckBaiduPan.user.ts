// ==UserScript==
// @name        FuckBaiduPan
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.4
// @author      lzghzr
// @description FuckBaiduPan
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       *://pan.baidu.com/*
// @match       *://yun.baidu.com/*
// @require     https://cdn.jsdelivr.net/gh/lzghzr/TampermonkeyJS@fcb1c5db40d32f877d49c0ed2e41d57bd17ad96f/ajax-proxy/ajax-proxy.js
// @license     MIT
// @grant       none
// @run-at      document-end
// ==/UserScript==

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
//@ts-ignore
W[Symbol.for("FuckBaiduPan")] = ''
// 拦截请求
ajaxProxy.proxyAjax({
  open: function (args, xhr) {
    if (args[1].includes('/share/set')) {
      //@ts-ignore
      if (W[Symbol.for("FuckBaiduPan")] === '')
        //@ts-ignore
        xhr.__share = true
      //@ts-ignore
      else W[Symbol.for("FuckBaiduPan")] = ''
    }
  },
  send: function (body, xhr) {
    //@ts-ignore
    if (xhr.__share) {
      const pwd = prompt('请输入自定义的密码', 'null')
      body[0] = body[0].replace(/pwd=\w{4}/, `pwd=${pwd}`)
    }
  }
})
// 拦截函数
W.webpackJsonp = W.webpackJsonp || []
W.webpackJsonp.push = new Proxy(W.webpackJsonp.push, {
  apply: function (target, _this, args) {
    for (const [name, fn] of Object.entries<Function>(args[0][1])) {
      let fnStr = fn.toString()
      if (fnStr.includes('P=function(){var e=["1","2","3",')) {
        const regexp = /(?<left>P=function\(\)\{)(?<right>var e=\["1","2","3",)/s
        const match = fnStr.match(regexp)
        if (match !== null)
          fnStr = fnStr.replace(regexp, '$<left>var pwd=prompt("请输入自定义的密码","null");window[Symbol.for("FuckBaiduPan")]=pwd;return pwd;$<right>')
        else console.error(GM_info.script.name, '自定义分享码失效')
      }
      if (fn.toString() !== fnStr) args[0][1][name] = str2Fn(fnStr)
    }
    return Reflect.apply(target, _this, args)
  }
})
/**
 * str2Fn
 *
 * @param {string} str
 * @returns {(Function | void)}
 */
function str2Fn(str: string): Function | void {
  const fnReg = str.match(/^function\((.*?)\){(.*)}$/s)
  if (fnReg !== null) {
    const [, args, body] = fnReg
    const fnStr = [...args.split(','), body]
    return new Function(...fnStr)
  }
}