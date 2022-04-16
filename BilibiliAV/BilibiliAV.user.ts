// ==UserScript==
// @name        BilibiliAV
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.3
// @author      lzghzr
// @match       https://www.bilibili.com/video/BV*
// @match       https://www.bilibili.com/video/bv*
// @description 将BV替换为AV
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
export { }

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow

// 算法来自 https://www.zhihu.com/question/381784377/answer/1099438784

const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
const tr: { [index: string]: number } = {}
for (let i = 0; i < 58; i++) tr[table[i]] = i
const s = [9, 8, 1, 6, 2, 4]
const xor = 177451812
const add = 8728348608
function dec(x: string) {
  let r = 0
  for (let i = 0; i < 6; i++) r += tr[x[s[i]]] * 58 ** i
  return (r - add) ^ xor
}
// @ts-ignore
function enc(x: string) {
  let y = Number.parseInt(x)
  y = (y ^ xor) + add
  let r = Array.from('1  4 1 7  ')
  for (let i = 0; i < 6; i++)  r[s[i]] = table[Math.floor(y / 58 ** i % 58)]
  return r.join('')
}

const BVReg = W.location.pathname.match(/(BV|bv)(\w{10,11})/)
if (BVReg !== null) {
  const V = BVReg[1]
  const BV = BVReg[2]
  const AV = dec(BV).toString()
  W.history.replaceState(null, '', W.location.href.replace(`${V}${BV}`, `av${AV}`))
}