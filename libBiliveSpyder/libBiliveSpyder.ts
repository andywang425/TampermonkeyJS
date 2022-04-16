// ==UserScript==
// @name        BiliveSpyder
// @namespace   https://github.com/lzghzr/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description BiliveSpyder
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       *://*/*
// @grant       none
// @run-at      document-start
// ==/UserScript==
export { }

((W) => {
  // @ts-ignore typescript仍未支持
  if (W[Symbol.for('BiliveSpyder')] !== undefined) return

  W.webpackChunklive_room = W.webpackChunklive_room || []

  W.webpackChunklive_room.push = new Proxy(W.webpackChunklive_room.push, {
    apply: function (target, _this, args) {
      for (const [name, fn] of Object.entries<Function>(args[0][1])) {
        let fnStr = fn.toString()
        if (fnStr.includes('exports.spyder')) {
          const regexp = /(?<left>exports\.spyder=)/s
          const match = fnStr.match(regexp)
          if (match !== null)
            fnStr = fnStr.replace(regexp, '$<left>window[Symbol.for("BiliveSpyder")]=')
          else console.error(GM_info.script.name, '功能失效')
        }
        if (fnStr.includes('this.lastHeartbeatTimestamp=')) {
          const regexp = /(?<left>"组件内日志："\+t\)\)}var \w+=)/s
          const match = fnStr.match(regexp)
          if (match !== null)
            fnStr = fnStr.replace(regexp, '$<left>window[Symbol.for("BiliveHeartbeat")]=')
          else console.error(GM_info.script.name, '功能失效')
        }
        if (fn.toString() !== fnStr) args[0][1][name] = str2Fn(fnStr)
      }
      return Reflect.apply(target, _this, args)
    }
  })

  function str2Fn(str: string): Function | void {
    const fnReg = str.match(/^function\((.*?)\){(.*)}$/s)
    if (fnReg !== null) {
      const [, args, body] = fnReg
      const fnStr = [...args.split(','), body]
      return new Function(...fnStr)
    }
  }
})(typeof unsafeWindow === 'undefined' ? window : unsafeWindow)

// b = new window[Symbol.for("BiliveHeartbeat")].constructor
// b.init()
// b.update({room_id:5082,area_id:283,parent_area_id:6})
// b.start({sign:(s,r) => window[Symbol.for("BiliveSpyder")](JSON.stringify(s), r), onFail:e => console.log(e)})