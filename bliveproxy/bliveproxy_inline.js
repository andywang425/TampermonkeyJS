// ==UserScript==
// @name         bliveproxy
// @namespace    https://github.com/lzghzr/TampermonkeyJS
// @version      1.0.0
// @author       xfgryujk, lzghzr
// @description  B站直播websocket message hook框架
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// 使用方法：
// bliveproxy.addCommandHandler('DANMU_MSG', command => {
//   console.log(command)
//   let info = command.info
//   info[1] = '测试'
// })
//
// 如果@grant不是none，则要使用unsafeWindow.bliveproxy

(function (W) {

  function main() {
    if (W.bliveproxy) {
      // 防止多次加载
      return
    }
    initApi()
    hook()
  }

  function initApi() {
    W.bliveproxy = api
  }

  let api = {
    addCommandHandler(cmd, handler) {
      let handlers = this._commandHandlers[cmd]
      if (!handlers) {
        handlers = this._commandHandlers[cmd] = []
      }
      handlers.push(handler)
    },
    removeCommandHandler(cmd, handler) {
      let handlers = this._commandHandlers[cmd]
      if (!handlers) {
        return
      }
      this._commandHandlers[cmd] = handlers.filter(item => item !== handler)
    },

    // 私有API
    _commandHandlers: {},
    _getCommandHandlers(cmd) {
      return this._commandHandlers[cmd] || null
    },
    _handleCommand(command) {
      let cmd = command.cmd || ''
      let pos = cmd.indexOf(':')
      if (pos != -1) {
        cmd = cmd.substr(0, pos)
      }
      let handlers = this._getCommandHandlers(cmd)
      if (handlers) {
        for (let handler of handlers) {
          handler(command)
        }
      }
      // 全部监控
      let ALLhandlers = this._getCommandHandlers('ALL')
      if (ALLhandlers) {
        for (let ALLhandler of ALLhandlers) {
          ALLhandler(command)
        }
      }
      return command
    }
  }

  function hook() {
    let add = 0x0
    Set.prototype.add = new Proxy(Set.prototype.add, {
      apply: function (target, _this, args) {
        if (args[0] && args[0] instanceof Function) {
          let fnStr = args[0].toString()
          if (fnStr.includes('.onMessageReply(')) {
            const regexp = /(?<left>\{)(?<right>\w\.onMessageReply\((?<mut>\w),)/s
            const match = fnStr.match(regexp)
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>window.bliveproxy._handleCommand($<mut>);$<right>')
            }
            else {
              console.error(GM_info.script.name, 'bliveproxy失效', fnStr)
            }
            add = add | 0x1
          }
          if (args[0].toString() !== fnStr) {
            args[0] = str2Fn(fnStr)
          }
          if (add === 0x1) {
            Set.prototype.add = target
          }
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
    function str2Fn(str) {
      const fnReg = str.match(/([^\{]*)\{(.*)\}$/s)
      if (fnReg !== null) {
        const [, head, body] = fnReg
        const args = head.replaceAll(/function[^\(]*|[\s()=>]/g, '').split(',')
        return new Function(...args, body)
      }
    }
  }

  main()
})(typeof unsafeWindow === 'undefined' ? window : unsafeWindow)
