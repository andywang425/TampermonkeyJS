// ==UserScript==
// @name        bilibili直播弹幕修复
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.3
// @author      lzghzr
// @description 修复bilibili直播弹幕
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       https://live.bilibili.com/*
// @license     MIT
// @run-at      document-start
// ==/UserScript==

Array.prototype.concat = new Proxy(Array.prototype.concat, {
  apply: function (target, _this, args) {
    if (args[0] && args[0] instanceof Object && args[0].cmd) {
      const command = args[0]
      if (command.cmd.startsWith('DANMU_MSG')) {
        command.cmd = 'DANMU_MSG'
      }
    }
    return Reflect.apply(target, _this, args)
  }
})
