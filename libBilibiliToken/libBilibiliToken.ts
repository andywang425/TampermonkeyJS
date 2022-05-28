// ==UserScript==
// @name        libBilibiliToken
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     1.0.0
// @author      lzghzr
// @description 哔哩哔哩cookie获取token
// @match       *://*.bilibili.com/*
// @connect     passport.bilibili.com
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-start
// ==/UserScript==
import { GM_xmlhttpRequest } from '../@types/tm_f'
import { XHRheaders, authCode, confirm, pollData, poll } from './libBilibiliToken.d'

/**
 * 由B站cookie获取token
 * 因为Tampermonkey的限制或者bug, 无法独立设置cookie, 所以不支持多用户
 * 使用之前请确认已经登录
 * 使用方法 await new BilibiliToken().getToken()
 * 更多高级用法请自行开发
 *
 * @class BilibiliToken
 */
class BilibiliToken {
  public static _W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
  // 校验用, 登录时使用独立的参数
  protected static readonly __loginSecretKey: string = '2653583c8873dea268ab9386918b1d65'
  public static readonly loginAppKey: string = '783bbb7264451d82'
  protected static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  // 设备信息
  public build = '6720300'
  public buvid = BilibiliToken.buvidXX
  public Clocale = 'zh-Hans_CN'
  public channel = 'website'
  public localId = this.buvid
  public mobiApp = 'android'
  public platform = 'android'
  public Slocale = 'zh-Hans_CN'
  /**
   * 设备指纹之一, XX开头为AndroidID
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof BilibiliToken
   */
  public static get buvidXX(): string {
    const buvid = this.md5(Math.random().toString()).toUpperCase()
    return 'XX' + buvid[2] + buvid[12] + buvid[22] + buvid
  }
  /**
   * 谜一样的TS
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof BilibiliToken
   */
  public static get TS(): number { return Math.floor(Date.now() / 1000) }
  /**
   * 请求头
   *
   * @type {XHRheaders}
   * @memberof BilibiliToken
   */
  public headers: XHRheaders = {
    'user-agent': 'Mozilla/5.0 BiliDroid/6.72.0 (bbcallen@gmail.com) os/android model/XQ-CT72 mobi_app/android build/6720300 channel/bilih5 innerVer/6720310 osVer/12 network/2',
    'buvid': this.buvid
  }
  /**
   * 登录请求参数
   *
   * @readonly
   * @type {string}
   * @memberof BilibiliToken
   */
  public get loginQuery(): string {
    return `appkey=${BilibiliToken.loginAppKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}&local_id=${this.localId}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}`
  }
  /**
   * 对参数签名
   *
   * @static
   * @param {string} params
   * @param {boolean} [ts=true]
   * @param {string} [secretKey=this.__secretKey]
   * @returns {string}
   * @memberof BilibiliToken
   */
  public static signQuery(params: string, ts: boolean = true, secretKey: string = this.__secretKey): string {
    let paramsSort = params
    if (ts) paramsSort = `${params}&ts=${this.TS}`
    paramsSort = paramsSort.split('&').sort().join('&')
    const paramsSecret = paramsSort + secretKey
    const paramsHash = this.md5(paramsSecret)
    return `${paramsSort}&sign=${paramsHash}`
  }
  /**
   * 对登录参数加参后签名
   *
   * @param {string} [params]
   * @returns {string}
   * @memberof BilibiliToken
   */
  public signLoginQuery(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return BilibiliToken.signQuery(paramsBase, true, BilibiliToken.__loginSecretKey)
  }
  /**
   * 获取二维码
   *
   * @returns {(Promise<string | void>)}
   * @memberof BilibiliToken
   */
  public async getAuthCode(): Promise<string | void> {
    const authCode = await BilibiliToken.XHR<authCode>({
      GM: true,
      anonymous: true,
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
      data: this.signLoginQuery(),
      responseType: 'json',
      headers: this.headers
    })
    if (authCode !== undefined && authCode.response.status === 200 && authCode.body.code === 0) return authCode.body.data.auth_code
    return console.error(GM_info.script.name, 'getAuthCode', authCode)
  }
  /**
   * 确认二维码
   *
   * @param {string} authCode
   * @param {string} csrf
   * @returns {(Promise<string | void>)}
   * @memberof BilibiliToken
   */
  public async qrcodeConfirm(authCode: string, csrf: string): Promise<string | void> {
    const confirm = await BilibiliToken.XHR<confirm>({
      GM: true,
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-tv-login/h5/qrcode/confirm',
      data: `auth_code=${authCode}&csrf=${csrf}&scanning_type=1`,
      responseType: 'json',
      headers: this.headers
    })
    if (confirm !== undefined && confirm.response.status === 200 && confirm.body.code === 0) return confirm.body.data.gourl
    return console.error(GM_info.script.name, 'qrcodeConfirm', confirm)
  }
  /**
   * 取得token
   *
   * @param {string} authCode
   * @returns {(Promise<pollData | void>)}
   * @memberof BilibiliToken
   */
  public async qrcodePoll(authCode: string): Promise<pollData | void> {
    const poll = await BilibiliToken.XHR<poll>({
      GM: true,
      anonymous: true,
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll',
      data: this.signLoginQuery(`auth_code=${authCode}`),
      responseType: 'json',
      headers: this.headers
    })
    if (poll !== undefined && poll.response.status === 200 && poll.body.code === 0) return poll.body.data
    return console.error(GM_info.script.name, 'qrcodePoll', poll)
  }
  /**
   * 获取此时浏览器登录账号token
   *
   * @returns {(Promise<pollData | void>)}
   * @memberof BilibiliToken
   */
  public async getToken(): Promise<pollData | void> {
    const cookie = BilibiliToken._W.document.cookie.match(/bili_jct=(?<csrf>.*?);/)
    if (cookie === null || cookie.groups === undefined) return console.error(GM_info.script.name, 'getToken', 'cookie获取失败')
    const csrf = cookie.groups['csrf']
    const authCode = await this.getAuthCode()
    if (authCode === undefined) return
    const confirm = await this.qrcodeConfirm(authCode, csrf)
    if (confirm === undefined) return
    const token = await this.qrcodePoll(authCode)
    if (token === undefined) return
    return token
  }
  /*
   * JavaScript MD5
   * https://github.com/blueimp/JavaScript-MD5
   *
   * Copyright 2011, Sebastian Tschan
   * https://blueimp.net
   *
   * Licensed under the MIT license:
   * https://opensource.org/licenses/MIT
   *
   * Based on
   * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
   * Digest Algorithm, as defined in RFC 1321.
   * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for more info.
   */
  public static md5(string: string, key?: string, raw?: boolean): string {
    return md5(string, key, raw)
    /**
     * Add integers, wrapping at 2^32.
     * This uses 16-bit operations internally to work around bugs in interpreters.
     *
     * @param {number} x First integer
     * @param {number} y Second integer
     * @returns {number} Sum
     */
    function safeAdd(x: number, y: number): number {
      var lsw = (x & 0xffff) + (y & 0xffff)
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
      return (msw << 16) | (lsw & 0xffff)
    }

    /**
     * Bitwise rotate a 32-bit number to the left.
     *
     * @param {number} num 32-bit number
     * @param {number} cnt Rotation count
     * @returns {number} Rotated number
     */
    function bitRotateLeft(num: number, cnt: number): number {
      return (num << cnt) | (num >>> (32 - cnt))
    }

    /**
     * Basic operation the algorithm uses.
     *
     * @param {number} q q
     * @param {number} a a
     * @param {number} b b
     * @param {number} x x
     * @param {number} s s
     * @param {number} t t
     * @returns {number} Result
     */
    function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
      return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
    }
    /**
     * Basic operation the algorithm uses.
     *
     * @param {number} a a
     * @param {number} b b
     * @param {number} c c
     * @param {number} d d
     * @param {number} x x
     * @param {number} s s
     * @param {number} t t
     * @returns {number} Result
     */
    function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn((b & c) | (~b & d), a, b, x, s, t)
    }
    /**
     * Basic operation the algorithm uses.
     *
     * @param {number} a a
     * @param {number} b b
     * @param {number} c c
     * @param {number} d d
     * @param {number} x x
     * @param {number} s s
     * @param {number} t t
     * @returns {number} Result
     */
    function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
    }
    /**
     * Basic operation the algorithm uses.
     *
     * @param {number} a a
     * @param {number} b b
     * @param {number} c c
     * @param {number} d d
     * @param {number} x x
     * @param {number} s s
     * @param {number} t t
     * @returns {number} Result
     */
    function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }
    /**
     * Basic operation the algorithm uses.
     *
     * @param {number} a a
     * @param {number} b b
     * @param {number} c c
     * @param {number} d d
     * @param {number} x x
     * @param {number} s s
     * @param {number} t t
     * @returns {number} Result
     */
    function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
      return md5cmn(c ^ (b | ~d), a, b, x, s, t)
    }

    /**
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     *
     * @param {Array} x Array of little-endian words
     * @param {number} len Bit length
     * @returns {Array<number>} MD5 Array
     */
    function binlMD5(x: Array<any>, len: number): Array<number> {
      /* append padding */
      x[len >> 5] |= 0x80 << len % 32
      x[(((len + 64) >>> 9) << 4) + 14] = len

      var i
      var olda
      var oldb
      var oldc
      var oldd
      var a = 1732584193
      var b = -271733879
      var c = -1732584194
      var d = 271733878

      for (i = 0; i < x.length; i += 16) {
        olda = a
        oldb = b
        oldc = c
        oldd = d

        a = md5ff(a, b, c, d, x[i], 7, -680876936)
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
        b = md5gg(b, c, d, a, x[i], 20, -373897302)
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

        a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
        d = md5hh(d, a, b, c, x[i], 11, -358537222)
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

        a = md5ii(a, b, c, d, x[i], 6, -198630844)
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

        a = safeAdd(a, olda)
        b = safeAdd(b, oldb)
        c = safeAdd(c, oldc)
        d = safeAdd(d, oldd)
      }
      return [a, b, c, d]
    }

    /**
     * Convert an array of little-endian words to a string
     *
     * @param {Array<number>} input MD5 Array
     * @returns {string} MD5 string
     */
    function binl2rstr(input: Array<number>): string {
      var i
      var output = ''
      var length32 = input.length * 32
      for (i = 0; i < length32; i += 8) {
        output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff)
      }
      return output
    }

    /**
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     *
     * @param {string} input Raw input string
     * @returns {Array<number>} Array of little-endian words
     */
    function rstr2binl(input: string): Array<number> {
      var i
      var output = []
      output[(input.length >> 2) - 1] = undefined
      for (i = 0; i < output.length; i += 1) {
        output[i] = 0
      }
      var length8 = input.length * 8
      for (i = 0; i < length8; i += 8) {
        // @ts-ignore
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32
      }
      // @ts-ignore
      return output
    }

    /**
     * Calculate the MD5 of a raw string
     *
     * @param {string} s Input string
     * @returns {string} Raw MD5 string
     */
    function rstrMD5(s: string): string {
      return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
    }

    /**
     * Calculates the HMAC-MD5 of a key and some data (raw strings)
     *
     * @param {string} key HMAC key
     * @param {string} data Raw input string
     * @returns {string} Raw MD5 string
     */
    function rstrHMACMD5(key: string, data: string): string {
      var i
      var bkey = rstr2binl(key)
      var ipad = []
      var opad = []
      var hash
      ipad[15] = opad[15] = undefined
      if (bkey.length > 16) {
        bkey = binlMD5(bkey, key.length * 8)
      }
      for (i = 0; i < 16; i += 1) {
        ipad[i] = bkey[i] ^ 0x36363636
        opad[i] = bkey[i] ^ 0x5c5c5c5c
      }
      hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
      return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
    }

    /**
     * Convert a raw string to a hex string
     *
     * @param {string} input Raw input string
     * @returns {string} Hex encoded string
     */
    function rstr2hex(input: string): string {
      var hexTab = '0123456789abcdef'
      var output = ''
      var x
      var i
      for (i = 0; i < input.length; i += 1) {
        x = input.charCodeAt(i)
        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
      }
      return output
    }

    /**
     * Encode a string as UTF-8
     *
     * @param {string} input Input string
     * @returns {string} UTF8 string
     */
    function str2rstrUTF8(input: string): string {
      return unescape(encodeURIComponent(input))
    }

    /**
     * Encodes input string as raw MD5 string
     *
     * @param {string} s Input string
     * @returns {string} Raw MD5 string
     */
    function rawMD5(s: string): string {
      return rstrMD5(str2rstrUTF8(s))
    }
    /**
     * Encodes input string as Hex encoded string
     *
     * @param {string} s Input string
     * @returns {string} Hex encoded string
     */
    function hexMD5(s: string): string {
      return rstr2hex(rawMD5(s))
    }
    /**
     * Calculates the raw HMAC-MD5 for the given key and data
     *
     * @param {string} k HMAC key
     * @param {string} d Input string
     * @returns {string} Raw MD5 string
     */
    function rawHMACMD5(k: string, d: string): string {
      return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
    }
    /**
     * Calculates the Hex encoded HMAC-MD5 for the given key and data
     *
     * @param {string} k HMAC key
     * @param {string} d Input string
     * @returns {string} Raw MD5 string
     */
    function hexHMACMD5(k: string, d: string): string {
      return rstr2hex(rawHMACMD5(k, d))
    }

    /**
     * Calculates MD5 value for a given string.
     * If a key is provided, calculates the HMAC-MD5 value.
     * Returns a Hex encoded string unless the raw argument is given.
     *
     * @param {string} string Input string
     * @param {string} [key] HMAC key
     * @param {boolean} [raw] Raw output switch
     * @returns {string} MD5 output
     */
    function md5(string: string, key?: string, raw?: boolean): string {
      if (!key) {
        if (!raw) {
          return hexMD5(string)
        }
        return rawMD5(string)
      }
      if (!raw) {
        return hexHMACMD5(key, string)
      }
      return rawHMACMD5(key, string)
    }
  }
  /**
   *
   * 使用Promise封装xhr
   * 因为上下文问题, GM_xmlhttpRequest为单独一项
   * fetch和GM_xmlhttpRequest兼容过于复杂, 所以使用XMLHttpRequest
   *
   * @static
   * @template T
   * @param {XHROptions} XHROptions
   * @returns {(Promise<response<T> | undefined>)}
   * @memberof BilibiliToken
   */
  public static XHR<T>(XHROptions: XHROptions): Promise<response<T> | undefined> {
    return new Promise(resolve => {
      const onerror = (error: any) => {
        console.error(GM_info.script.name, error)
        resolve(undefined)
      }
      if (XHROptions.GM) {
        if (XHROptions.method === 'POST') {
          if (XHROptions.headers === undefined) XHROptions.headers = {}
          if (XHROptions.headers['Content-Type'] === undefined)
            XHROptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
        }
        XHROptions.timeout = 30 * 1000
        XHROptions.onload = res => resolve({ response: res, body: res.response })
        XHROptions.onerror = onerror
        XHROptions.ontimeout = onerror
        GM_xmlhttpRequest(XHROptions)
      }
      else {
        const xhr = new XMLHttpRequest()
        xhr.open(XHROptions.method, XHROptions.url)
        if (XHROptions.method === 'POST' && xhr.getResponseHeader('Content-Type') === null)
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
        if (XHROptions.withCredentials) xhr.withCredentials = true
        if (XHROptions.responseType !== undefined) xhr.responseType = XHROptions.responseType
        xhr.timeout = 30 * 1000
        xhr.onload = ev => {
          const res = <XMLHttpRequest>ev.target
          resolve({ response: res, body: res.response })
        }
        xhr.onerror = onerror
        xhr.ontimeout = onerror
        xhr.send(XHROptions.data)
      }
    })
  }
}

export default BilibiliToken