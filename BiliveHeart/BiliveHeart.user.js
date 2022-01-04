// ==UserScript==
// @name        BiliveHeart
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.5
// @author      lzghzr
// @description B站直播心跳
// @include     /^https?:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @license     MIT
// @grant       none
// @run-at      document-end
// ==/UserScript==
const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
const patchData = {};
class RoomHeart {
    constructor(roomID) {
        this.getInfoByRoom(roomID);
    }
    areaID;
    parentID;
    seq = 0;
    roomID;
    get id() {
        return [this.parentID, this.areaID, this.seq, this.roomID];
    }
    buvid = this.getItem('LIVE_BUVID');
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, t => {
        const e = 16 * Math.random() | 0;
        return ('x' === t ? e : 3 & e | 8).toString(16);
    });
    device = [this.buvid, this.uuid];
    get ts() {
        return Date.now();
    }
    get patchData() {
        const list = [];
        for (const [_, data] of Object.entries(patchData))
            list.push(data);
        return list;
    }
    get isPatch() { return this.patchData.length === 0 ? 0 : 1; }
    ua = W && W.navigator ? W.navigator.userAgent : '';
    csrf = this.getItem("bili_jct") || '';
    nextInterval = Math.floor(5) + Math.floor(Math.random() * (60 - 5));
    heartBeatInterval;
    secretKey;
    secretRule;
    timestamp;
    lastHeartbeatTimestamp = Date.now();
    get watchTimeFromLastReport() {
        const t = Math.ceil(((new Date).getTime() - this.lastHeartbeatTimestamp) / 1000);
        return t < 0 ? 0 : t > this.heartBeatInterval ? this.heartBeatInterval : t;
    }
    async getInfoByRoom(roomID) {
        const getInfoByRoom = await fetch(`//api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}&from=room`, {
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.json());
        if (getInfoByRoom.code === 0) {
            ;
            ({ area_id: this.areaID, parent_area_id: this.parentID, room_id: this.roomID } = getInfoByRoom.data);
            this.e();
        }
        else
            console.error(GM_info.script.name, `未获取到房间 ${roomID} 信息`);
    }
    async webHeartBeat() {
        if (this.seq > 6)
            return;
        const arg = `${this.nextInterval}|${this.roomID}|1|0`;
        const argUtf8 = CryptoJS.enc.Utf8.parse(arg);
        const argBase64 = CryptoJS.enc.Base64.stringify(argUtf8);
        const webHeartBeat = await fetch(`//live-trace.bilibili.com/xlive/rdata-interface/v1/heartbeat/webHeartBeat?hb=${encodeURIComponent(argBase64)}&pf=web`, {
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.json());
        if (webHeartBeat.code === 0) {
            this.nextInterval = webHeartBeat.data.next_interval;
            setTimeout(() => this.webHeartBeat(), this.nextInterval * 1000);
        }
        else
            console.error(GM_info.script.name, `房间 ${this.roomID} 心跳失败`);
    }
    async savePatchData() {
        if (this.seq > 6)
            return;
        const sypderData = {
            id: JSON.stringify(this.id),
            device: JSON.stringify(this.device),
            ets: this.timestamp,
            benchmark: this.secretKey,
            time: this.watchTimeFromLastReport > this.heartBeatInterval ? this.heartBeatInterval : this.watchTimeFromLastReport,
            ts: this.ts,
            ua: this.ua,
        };
        const s = this.sypder(JSON.stringify(sypderData), this.secretRule);
        const arg = Object.assign({ s }, sypderData);
        patchData[this.roomID] = arg;
        setTimeout(() => this.savePatchData(), 15 * 1000);
    }
    async e() {
        const arg = {
            id: JSON.stringify(this.id),
            device: JSON.stringify(this.device),
            ts: this.ts,
            is_patch: 0,
            heart_beat: '[]',
            ua: this.ua,
        };
        const e = await fetch('//live-trace.bilibili.com/xlive/data-interface/v1/x25Kn/E', {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            method: 'POST',
            body: `${this.json2str(arg)}&csrf_token=${this.csrf}&csrf=${this.csrf}&visit_id=`,
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.json());
        if (e.code === 0) {
            this.seq += 1;
            ({ heartbeat_interval: this.heartBeatInterval, secret_key: this.secretKey, secret_rule: this.secretRule, timestamp: this.timestamp } = e.data);
            setTimeout(() => this.x(), this.heartBeatInterval * 1000);
        }
        else
            console.error(GM_info.script.name, `房间 ${this.roomID} 获取小心心失败`);
    }
    async x() {
        if (this.seq > 6)
            return;
        const sypderData = {
            id: JSON.stringify(this.id),
            device: JSON.stringify(this.device),
            ets: this.timestamp,
            benchmark: this.secretKey,
            time: this.heartBeatInterval,
            ts: this.ts,
            ua: this.ua,
        };
        const s = this.sypder(JSON.stringify(sypderData), this.secretRule);
        const arg = Object.assign({ s }, sypderData);
        patchData[this.roomID] = arg;
        this.lastHeartbeatTimestamp = Date.now();
        const x = await fetch('//live-trace.bilibili.com/xlive/data-interface/v1/x25Kn/X', {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            method: 'POST',
            body: `${this.json2str(arg)}&csrf_token=${this.csrf}&csrf=${this.csrf}&visit_id=`,
            mode: 'cors',
            credentials: 'include',
        }).then(res => res.json());
        if (x.code === 0) {
            this.seq += 1;
            ({ heartbeat_interval: this.heartBeatInterval, secret_key: this.secretKey, secret_rule: this.secretRule, timestamp: this.timestamp } = x.data);
            setTimeout(() => this.x(), this.heartBeatInterval * 1000);
        }
        else
            console.error(GM_info.script.name, `房间 ${this.roomID} 小心心 心跳失败`);
    }
    sypder(str, rule) {
        const data = JSON.parse(str);
        const [parent_id, area_id, seq_id, room_id] = JSON.parse(data.id);
        const [buvid, uuid] = JSON.parse(data.device);
        const key = data.benchmark;
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
        };
        let s = JSON.stringify(newData);
        for (const r of rule) {
            switch (r) {
                case 0:
                    s = CryptoJS.HmacMD5(s, key).toString(CryptoJS.enc.Hex);
                    break;
                case 1:
                    s = CryptoJS.HmacSHA1(s, key).toString(CryptoJS.enc.Hex);
                    break;
                case 2:
                    s = CryptoJS.HmacSHA256(s, key).toString(CryptoJS.enc.Hex);
                    break;
                case 3:
                    s = CryptoJS.HmacSHA224(s, key).toString(CryptoJS.enc.Hex);
                    break;
                case 4:
                    s = CryptoJS.HmacSHA512(s, key).toString(CryptoJS.enc.Hex);
                    break;
                case 5:
                    s = CryptoJS.HmacSHA384(s, key).toString(CryptoJS.enc.Hex);
                    break;
                default:
                    break;
            }
        }
        return s;
    }
    getItem(t) {
        return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(t).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || '';
    }
    json2str(arg) {
        let str = '';
        for (const name in arg)
            str += `${name}=${encodeURIComponent(arg[name])}&`;
        return str.slice(0, -1);
    }
}
;
(async () => {
    const bagList = await fetch(`//api.live.bilibili.com/xlive/web-room/v1/gift/bag_list?t=${Date.now()}&room_id=23058`, {
        mode: 'cors',
        credentials: 'include',
    }).then(res => res.json());
    if (bagList.code !== 0)
        return console.error(GM_info.script.name, '未获取到包裹列表');
    let giftNum = 0;
    if (bagList.data.list != null && bagList.data.list.length > 0)
        for (const gift of bagList.data.list) {
            if (gift.gift_id === 30607) {
                const expire = (gift.expire_at - Date.now() / 1000) / 60 / 60 / 24;
                if (expire > 6 && expire <= 7)
                    giftNum += gift.gift_num;
            }
        }
    if (giftNum >= 24)
        return console.error(GM_info.script.name, '已获取今日小心心');
    const fetchMedal = async (pn = 1) => await fetch(`//api.live.bilibili.com/xlive/app-ucenter/v1/user/GetMyMedals?page=${pn}&page_size=10`, {
        mode: 'cors',
        credentials: 'include',
    }).then(res => res.json());
    const medal = await fetchMedal();
    if (medal.code !== 0)
        return console.error(GM_info.script.name, '未获取到勋章列表');
    const medalData = medal.data;
    const fansMedalList = medalData.items;
    let totalpages = medalData.page_info?.total_page;
    if (totalpages > 1) {
        totalpages = totalpages > 3 ? 3 : totalpages;
        for (let index = 2; index <= totalpages; index++) {
            const medalTemp = await fetchMedal(index);
            fansMedalList.push(...medalTemp.data.items);
        }
    }
    const control = 24 - giftNum;
    const loopNum = Math.ceil(control / fansMedalList.length);
    for (let i = 0; i < loopNum; i++) {
        let count = 0;
        for (const funsMedalData of fansMedalList) {
            if (count >= control)
                break;
            new RoomHeart(funsMedalData.roomid);
            await Sleep(1000);
            count++;
        }
        await Sleep(6 * 60 * 1000);
    }
    function Sleep(ms) {
        return new Promise(resolve => setTimeout(() => resolve('sleep'), ms));
    }
})();