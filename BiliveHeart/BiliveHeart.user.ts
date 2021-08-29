// ==UserScript==
// @name        BiliveHeart
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description B站直播心跳
// @include     /^https?:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
/// <reference path='BiliveHeart.d.ts' />
import * as CryptoJS from 'crypto-js'
export { }

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow

class RoomHeart {
  constructor(roomID: number) {
    this.getInfoByRoom(roomID)
  }
  // 获得id，需JSON.stringify
  private areaID!: number
  private parentID!: number
  private seq = 0
  private roomID!: number

  private get id(): number[] {
    return [this.parentID, this.areaID, this.seq, this.roomID]
  }
  // 获得device，需JSON.stringify
  private buvid = this.getItem('LIVE_BUVID')
  private uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, t => {
    const e = 16 * Math.random() | 0
    return ('x' === t ? e : 3 & e | 8).toString(16)
  })

  private device = [this.buvid, this.uuid]
  // 获得ts
  private get ts() {
    return Date.now()
  }
  // 获得patchData，需JSON.stringify
  private patchData: string[] = []
  private isPatch = this.patchData.length === 0 ? 0 : 1
  // 获得ua
  private ua = W && W.navigator ? W.navigator.userAgent : ''
  // 获得csrf
  private csrf = this.getItem("bili_jct") || ''

  private nextInterval = Math.floor(5) + Math.floor(Math.random() * (60 - 5))
  private heartbeatInterval!: number
  private secretKey!: string
  private secretRule!: number[]
  private timestamp!: number
  /**
   * 获取房间信息，可以用window.BilibiliLive代替，但需要时间加载
   *
   * @private
   * @param {number} roomID
   * @returns
   * @memberof RoomHeart
   */
  private async getInfoByRoom(roomID: number) {
    const getInfoByRoom: RoomInfo = await fetch(`//api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomID}`, {
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (getInfoByRoom.code === 0) {
      const roomInfo = getInfoByRoom.data.room_info
        ; ({ area_id: this.areaID, parent_area_id: this.parentID, room_id: this.roomID } = roomInfo)
      // this.webHeartBeat()
      this.e()
    }
    else console.error(GM_info.script.name, `未获取到房间 ${roomID} 信息`)
  }
  /**
   * 暂时无用
   *
   * @private
   * @memberof RoomHeart
   */
  private async webHeartBeat() {
    if (this.seq > 6) return
    const arg = `${this.nextInterval}|${this.roomID}|1|0`
    const argUtf8 = CryptoJS.enc.Utf8.parse(arg)
    const argBase64 = CryptoJS.enc.Base64.stringify(argUtf8)

    const webHeartBeat: WebHeartBeat = await fetch(`//live-trace.bilibili.com/xlive/rdata-interface/v1/heartbeat/webHeartBeat?hb=${encodeURIComponent(argBase64)}&pf=web`, {
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (webHeartBeat.code === 0) {
      this.nextInterval = webHeartBeat.data.next_interval
      setTimeout(() => this.webHeartBeat(), this.nextInterval * 1000)
    }
    else console.error(GM_info.script.name, `房间 ${this.roomID} 心跳失败`)
  }
  /**
   * E
   *
   * @private
   * @returns
   * @memberof RoomHeart
   */
  private async e() {
    const arg = {
      id: JSON.stringify(this.id),
      device: JSON.stringify(this.device),
      ts: this.ts,
      is_patch: this.isPatch,
      heart_beat: JSON.stringify(this.patchData),
      ua: this.ua,
    }
    const e: E = await fetch('//live-trace.bilibili.com/xlive/data-interface/v1/x25Kn/E', {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: 'POST',
      body: `${this.json2str(arg)}&csrf_token=${this.csrf}&csrf=${this.csrf}&visit_id=`,
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (e.code === 0) {
      this.seq += 1
        ; ({ heartbeat_interval: this.heartbeatInterval, secret_key: this.secretKey, secret_rule: this.secretRule, timestamp: this.timestamp } = e.data)
      setTimeout(() => this.x(), this.heartbeatInterval * 1000)
    }
    else console.error(GM_info.script.name, `房间 ${this.roomID} 获取小心心失败`)
  }
  /**
   * X
   *
   * @private
   * @returns
   * @memberof RoomHeart
   */
  private async x() {
    if (this.seq > 6) return
    const sypderData: sypderData = {
      id: JSON.stringify(this.id),
      device: JSON.stringify(this.device),
      ets: this.timestamp,
      benchmark: this.secretKey,
      time: this.heartbeatInterval,
      ts: this.ts,
      ua: this.ua,
    }
    const s = this.sypder(JSON.stringify(sypderData), this.secretRule)
    const arg = Object.assign({ s }, sypderData)
    this.patchData[0] = JSON.stringify(arg)
    const x: E = await fetch('//live-trace.bilibili.com/xlive/data-interface/v1/x25Kn/X', {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: 'POST',
      body: `${this.json2str(arg)}&csrf_token=${this.csrf}&csrf=${this.csrf}&visit_id=`,
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (x.code === 0) {
      this.seq += 1
        ; ({ heartbeat_interval: this.heartbeatInterval, secret_key: this.secretKey, secret_rule: this.secretRule, timestamp: this.timestamp } = x.data)
      setTimeout(() => this.x(), this.heartbeatInterval * 1000)
    }
    else console.error(GM_info.script.name, `房间 ${this.roomID} 小心心 心跳失败`)
  }
  private sypder(str: string, rule: number[]): string {
    const data: sypderData = JSON.parse(str)
    const [parent_id, area_id, seq_id, room_id]: number[] = JSON.parse(data.id)
    const [buvid, uuid]: string[] = JSON.parse(data.device)
    const key = data.benchmark
    const newData = {
      platform: 'web',
      parent_id,
      area_id,
      seq_id,
      room_id,
      buvid,
      uuid,
      ets: data.ets,
      time: data.time,
      ts: data.ts,
    }
    let s = JSON.stringify(newData)
    for (const r of rule) {
      switch (r) {
        case 0:
          s = CryptoJS.HmacMD5(s, key).toString(CryptoJS.enc.Hex)
          break
        case 1:
          s = CryptoJS.HmacSHA1(s, key).toString(CryptoJS.enc.Hex)
          break
        case 2:
          s = CryptoJS.HmacSHA256(s, key).toString(CryptoJS.enc.Hex)
          break
        case 3:
          s = CryptoJS.HmacSHA224(s, key).toString(CryptoJS.enc.Hex)
          break
        case 4:
          s = CryptoJS.HmacSHA512(s, key).toString(CryptoJS.enc.Hex)
          break
        case 5:
          s = CryptoJS.HmacSHA384(s, key).toString(CryptoJS.enc.Hex)
          break
        default:
          break
      }
    }
    return s
  }
  private getItem(t: string): string {
    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(t).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || ''
  }
  private json2str(arg: any): string {
    let str = ''
    for (const name in arg) str += `${name}=${encodeURIComponent(arg[name])}&`
    return str.slice(0, -1)
  }
}

document.addEventListener('readystatechange', async () => {
  if (document.readyState === 'complete') {
    const bagList: BagList = await fetch(`//api.live.bilibili.com/xlive/web-room/v1/gift/bag_list?t=1630203941175&room_id=${W.BilibiliLive.ROOMID}`, {
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (bagList.code !== 0) return console.error(GM_info.script.name, '未获取到包裹列表')

    let giftNum = 0
    if (bagList.data.list.length > 0)
      for (const gift of bagList.data.list) {
        if (gift.gift_id === 30607) {
          const expire = (gift.expire_at - Date.now() / 1000) / 60 / 60 / 24
          if (expire > 6 && expire <= 7) giftNum += gift.gift_num
        }
      }
    if (giftNum >= 24) return console.error(GM_info.script.name, '已获取今日小心心')

    const medal: Medal = await fetch('//api.live.bilibili.com/i/api/medal?page=1&pageSize=1000', {
      mode: 'cors',
      credentials: 'include',
    }).then(res => res.json())
    if (medal.code !== 0) return console.error(GM_info.script.name, '未获取到勋章列表')

    const fansMedalList = medal.data.fansMedalList
    const control = 24 - giftNum
    const loopNum = Math.ceil(control / fansMedalList.length)
    for (let i = 0; i < loopNum; i++) {
      let count = 0
      for (const funsMedalData of fansMedalList) {
        if (count >= control) break
        new RoomHeart(funsMedalData.roomid)
        await Sleep(1000)
        count++
      }
      await Sleep(6 * 60 * 1000)
    }
  }
  /**
  *
  * @param {number} ms
  * @returns {Promise<'sleep'>}
  */
  function Sleep(ms: number): Promise<'sleep'> {
    return new Promise<'sleep'>(resolve => setTimeout(() => resolve('sleep'), ms))
  }
})
