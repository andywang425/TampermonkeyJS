// ==UserScript==
// @name        bilibili直播净化
// @namespace   https://github.com/lzghzr/GreasemonkeyJS
// @version     4.0.26
// @author      lzghzr
// @description 屏蔽聊天室礼物以及关键字, 净化聊天室环境
// @supportURL  https://github.com/lzghzr/GreasemonkeyJS/issues
// @include     /^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/
// @match       https://live.bilibili.com/blackboard/activity-*
// @match       https://www.bilibili.com/blackboard/activity-*
// @match       https://www.bilibili.com/blackboard/live/*
// @require     https://github.com/lzghzr/TampermonkeyJS/raw/5fe14e0f8ac7ae8dd9a8fe8f8cbc58fe2d273112/bliveproxy/bliveproxy.js#sha256-QC/hfqL2rdtTK3GeK1ZUXDXmHU1xp42kC+ard3NKc9Q=
// @require     https://github.com/lzghzr/TampermonkeyJS/raw/5fe14e0f8ac7ae8dd9a8fe8f8cbc58fe2d273112/ajax-proxy/ajax-proxy.js#sha256-gdnIAuKAoGbiVdPUVGp6xctZaZJlOwsdQ0o4LawIKzk=
// @license     MIT
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==
import { GM_addStyle, GM_getValue, GM_setValue } from '../@types/tm_f'
import { config, ajaxProxy } from './BiLiveNoVIP'

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow

class NoVIP {
  public noBBChat = false
  public noBBDanmaku = false
  public roomSkinList: HTMLStyleElement[] = []
  public elmStyleCSS!: HTMLStyleElement
  public chatObserver!: MutationObserver
  public danmakuObserver!: MutationObserver
  public Start() {
    // css
    this.elmStyleCSS = GM_addStyle('')
    // 添加相关css
    this.AddCSS()
    // 刷屏聊天信息
    const chatMessage = new Map<string, number>()
    this.chatObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('danmaku-item')) {
            const chatNode = <HTMLSpanElement>addedNode.querySelector('.danmaku-item-right')
            if (chatNode !== null) {
              const chatText = chatNode.innerText
              const dateNow = Date.now()
              if (chatMessage.has(chatText) && dateNow - <number>chatMessage.get(chatText) < 5000) addedNode.remove()
              chatMessage.set(chatText, dateNow)
            }
          }
        })
      })
    })
    // 刷屏弹幕
    const danmakuMessage = new Map<string, number>()
    this.danmakuObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          const danmakuNode = addedNode instanceof Text ? <HTMLDivElement>addedNode.parentElement : <HTMLDivElement>addedNode
          if (danmakuNode?.classList?.contains('bili-dm')) {
            const danmakuText = danmakuNode.innerText
            const dateNow = Date.now()
            if (danmakuMessage.has(danmakuText) && dateNow - <number>danmakuMessage.get(danmakuText) < 5000) danmakuNode.innerText = ''
            danmakuMessage.set(danmakuText, dateNow)
          }
        })
      })
    })
    // 定时清空, 虽说应该每条分开统计, 但是刷起屏来实在是太快了, 比较消耗资源
    setInterval(() => {
      const dateNow = Date.now()
      chatMessage.forEach((value, key) => {
        if (dateNow - value > 60 * 1000) chatMessage.delete(key)
      })
      danmakuMessage.forEach((value, key) => {
        if (dateNow - value > 60 * 1000) danmakuMessage.delete(key)
      })
    }, 60 * 1000)
    // 监听相关DOM
    const docObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('dialog-ctnr')) {
            const blockEffectCtnr = addedNode.querySelector<HTMLDivElement>('.block-effect-ctnr')
            if (blockEffectCtnr !== null) this.AddUI(blockEffectCtnr)
          }
          // 屏蔽房间皮肤
          else if (addedNode instanceof HTMLStyleElement && addedNode.id === 'skin-css') {
            this.roomSkinList.push(addedNode)
            this.NORoomSkin()
          }
        })
      })
    })
    docObserver.observe(document, { childList: true, subtree: true })
    // 屏蔽房间皮肤
    const skin = <HTMLStyleElement>document.head.querySelector('#skin-css')
    if (skin !== null) {
      this.roomSkinList.push(skin)
    }
    // 取消自带设置
    const block = localStorage.getItem('LIVE_BLCOK_EFFECT_STATE')
    if (block?.includes('2')) {
      localStorage.setItem('LIVE_BLCOK_EFFECT_STATE', '2')
    }
    else {
      localStorage.setItem('LIVE_BLCOK_EFFECT_STATE', '')
    }
    // 最后调用
    this.ChangeCSS()
  }
  /**
   * 聊天过滤
   *
   * @memberof NoVIP
   */
  public NOBBChat() {
    if (config.menu.noBBChat.enable && !this.noBBChat) {
      const elmDivChatList = document.querySelector('#chat-items')
      if (elmDivChatList !== null) {
        this.noBBChat = true
        this.chatObserver.observe(elmDivChatList, { childList: true })
      }
    }
    else if (!config.menu.noBBChat.enable && this.noBBChat) {
      this.noBBChat = false
      this.chatObserver.disconnect()
    }
  }
  /**
   * 弹幕过滤
   *
   * @memberof NoVIP
   */
  public NOBBDanmaku() {
    if (config.menu.noBBDanmaku.enable && !this.noBBDanmaku) {
      const elmDivDanmaku = document.querySelector('#live-player')
      if (elmDivDanmaku !== null) {
        this.noBBDanmaku = true
        this.danmakuObserver.observe(elmDivDanmaku, { childList: true, subtree: true })
      }
    }
    else if (!config.menu.noBBDanmaku.enable && this.noBBDanmaku) {
      this.noBBDanmaku = false
      this.danmakuObserver.disconnect()
    }
  }
  /**
   * 屏蔽房间皮肤
   *
   * @memberof NoVIP
   */
  public NORoomSkin() {
    if (config.menu.noRoomSkin.enable) {
      this.roomSkinList.forEach((roomSkin) => {
        roomSkin.disabled = true
      })
    }
    else {
      this.roomSkinList.forEach((roomSkin) => {
        roomSkin.disabled = false
      })
    }
  }
  /**
   * 覆盖原有css
   *
   * @memberof NoVIP
   */
  public ChangeCSS() {
    let height = 62
    //css内容
    let cssText = `
/* 统一用户名颜色 */
.chat-item .user-name {
  color: #23ade5 !important;
}`
    if (config.menu.noGuardIcon.enable) cssText += `
/* 排行榜 */
#rank-list-ctnr-box.bgStyle {
  background-image: unset !important;
}
#rank-list-ctnr-box.bgStyle .item {
  color: #9499A0 !important;
}
#rank-list-ctnr-box.bgStyle .item.active {
  color: #2F3238 !important;
}
#rank-list-ctnr-box.bgStyle .hundred .rank {
  color: #2F3238 !important;
  font-weight: unset !important;
}
#rank-list-ctnr-box.bgStyle .daily-text {
  color: #61666D !important;
}

.chat-item.guard-danmaku .vip-icon {
  margin-right: 4px !important;
}
.chat-item.guard-danmaku .admin-icon,
.chat-item.guard-danmaku .anchor-icon,
.chat-item.guard-danmaku .fans-medal-item-ctnr,
.chat-item.guard-danmaku .guard-icon,
.chat-item.guard-danmaku .title-label,
.chat-item.guard-danmaku .user-level-icon,
.chat-item.guard-danmaku .user-lpl-logo {
  margin-right: 5px !important;
}
.chat-item.guard-level-1,
.chat-item.guard-level-2 {
  margin: 0 !important;
  padding: 4px 5px !important;
}
.chat-item.chat-colorful-bubble {
  background-color: rgba(248, 248, 248, 0) !important;
  border-radius: 0px !important;
  display: block !important;
  margin: 0 !important;
}
#welcome-area-bottom-vm,
.chat-item.common-danmuku-msg,
.chat-item.guard-buy,
.chat-item.welcome-guard,
.chat-item .guard-icon,
.chat-item.guard-level-1:after,
.chat-item.guard-level-2:after,
.chat-item.guard-level-1:before,
.chat-item.guard-level-2:before {
  display: none !important;
}`
    if (config.menu.noGiftMsg.enable) {
      // 底部小礼物, 调整高度
      height -= 32
      cssText += `
/* 底部小礼物, 调整高度 */
.chat-history-list.with-penury-gift {
  height: 100% !important;
}
/* 热门流量推荐 */
.chat-item.hot-rank-msg,
/* VIP标识 */
#activity-welcome-area-vm,
.chat-item .vip-icon,
.chat-item.welcome-msg,
/* 高能标识 */
.chat-item.top3-notice,
.chat-item .rank-icon,
/* 分享直播间 */
.chat-item.important-prompt-item,

#chat-gift-bubble-vm,
#penury-gift-msg,
#gift-screen-animation-vm,
#my-dear-haruna-vm .super-gift-bubbles,
.chat-item.gift-item,
.chat-item.system-msg,

.web-player-inject-wrap .announcement-wrapper,
.bilibili-live-player-video-operable-container>div:first-child>div:last-child,
.bilibili-live-player-video-gift,
.bilibili-live-player-danmaku-gift {
  display: none !important;
}`
    }
    if (config.menu.noSystemMsg.enable) {
      height -= 30
      cssText += `
.chat-history-list.with-brush-prompt {
  height: 100% !important;
}
/* 超人气推荐 */
body[style*="overflow: hidden;"] {
  overflow-y: overlay !important;
}
body[style*="overflow: hidden;"]>iframe[src*="live-app-hotrank/result"],
/* 进场 */
#brush-prompt,
.chat-item.misc-msg,
/* 初始 */
.chat-item.convention-msg,
/* 点赞 */
.chat-item[data-type="6"] {
  display: none !important;
}`
    }
    if (config.menu.noSuperChat.enable) cssText += `
/* 调整 SuperChat 聊天框 */
.chat-history-list {
  padding-top: 5px !important;
}
.chat-item.superChat-card-detail {
  margin-left: unset !important;
  margin-right: unset !important;
  min-height: unset !important;
}
.chat-item .card-item-middle-top {
  background-color: unset !important;
  background-image: unset !important;
  border: unset !important;
  display: inline !important;
  padding: unset !important;
}
.chat-item .card-item-middle-top-right {
  display: unset !important;
}
.chat-item .superChat-base {
  display: unset !important;
  height: unset !important;
  line-height: unset !important;
  vertical-align: unset !important;
  width: unset !important;
}
.chat-item .superChat-base .fans-medal-item-ctnr {
  margin-right: 4px !important;
}
.chat-item .name {
  color: #23ade5 !important;
  display: unset !important;
  font-size: unset !important;
  font-weight: unset !important;
  height: unset !important;
  line-height: 20px !important;
  margin-left: unset !important;
  opacity: unset !important;
  overflow: unset !important;
  text-overflow: unset !important;
  vertical-align: unset !important;
  white-space: unset !important;
  width: unset !important;
}
/* 为 SuperChat 用户名添加 : */
.chat-item.superChat-card-detail .name:after {
  content: ' : ';
}
.chat-item .card-item-middle-bottom {
  background-color: unset !important;
  display: unset !important;
  padding: unset !important;
}
.chat-item .input-contain {
  display: unset !important;
}
.chat-item .text {
  color: #646c7a !important;
}
/* SuperChat 提示条 */
#chat-msg-bubble-vm,
/* SuperChat 保留条 */
#pay-note-panel-vm,

.chat-item .bottom-background,
.chat-item .card-item-top-right,
#chat-control-panel-vm .super-chat {
  display: none !important;
}`
    if (config.menu.noEmoticons.enable) cssText += `
#chat-control-panel-vm .emoticons-panel,
.chat-item.chat-emoticon {
  display: none !important;
}`
    if (config.menu.noEmotDanmaku.enable) cssText += `
.bili-dm > img {
  display: none !important;
}`
    if (config.menu.noGiftControl.enable) cssText += `
/* 人气榜 */
#head-info-vm .popular-and-hot-rank,
/* 活动榜 */
#head-info-vm .gift-planet-entry,
#head-info-vm .activity-entry,
/* 礼物按钮 */
#web-player-controller-wrap-el .web-live-player-gift-icon-wrap,
/* 礼物栏 */
#gift-control-vm .gift-control-panel,
#web-player__bottom-bar__container {
  display: none !important;
}`
    if (config.menu.noKanBanMusume.enable) cssText += `
#my-dear-haruna-vm {
  display: none !important;
}`
    if (config.menu.noMedalIcon.enable) cssText += `
.chat-item .fans-medal-item-ctnr {
  display: none !important;
}`
    if (config.menu.noLiveTitleIcon.enable) cssText += `
.chat-item .title-label {
  display: none !important;
}`
    if (config.menu.noRaffle.enable) cssText += `
body[style*="overflow: hidden;"] {
  overflow-y: overlay !important;
}
#shop-popover-vm,
#anchor-guest-box-id,
#player-effect-vm,
#chat-draw-area-vm,
#gift-control-vm .gift-left-part,
.anchor-lottery-entry,
.popular-main .lottery {
  display: none !important;
}`
    if (config.menu.noDanmakuColor.enable) cssText += `
.bili-dm {
  color: #ffffff !important;
}`
    if (config.menu.noGameId.enable) cssText += `
#pk-vm,
#awesome-pk-vm,
#chaos-pk-vm,
/* 互动游戏 */
#game-id,
/* 一起玩 */
#chat-control-panel-vm .play-together-entry {
  display: none !important;
}`
    cssText += `
.chat-history-list.with-penury-gift.with-brush-prompt {
  height: calc(100% - ${height}px) !important;
}`
    this.NOBBChat()
    this.NOBBDanmaku()
    this.NORoomSkin()
    this.elmStyleCSS.innerHTML = cssText
  }
  /**
   * 添加设置菜单
   *
   * @param {HTMLDivElement} addedNode
   * @memberof NoVIP
   */
  public AddUI(addedNode: HTMLDivElement) {
    const elmUList = <HTMLUListElement>addedNode.firstElementChild
    // 去除注释
    elmUList.childNodes.forEach(child => {if (child instanceof Comment) child.remove()})
    const listLength = elmUList.childElementCount
    if (listLength > 10) return

    const changeListener = (itemHTML: HTMLLIElement, x: string) => {
      const itemSpan = <HTMLSpanElement>itemHTML.querySelector('span')
      const itemInput = <HTMLInputElement>itemHTML.querySelector('input')

      itemInput.checked = config.menu[x].enable
      itemInput.checked ? selectedCheckBox(itemSpan) : defaultCheckBox(itemSpan)

      itemInput.addEventListener('change', ev => {
        const evt = <HTMLInputElement>ev.target
        evt.checked ? selectedCheckBox(itemSpan) : defaultCheckBox(itemSpan)
        config.menu[x].enable = evt.checked
        GM_setValue('blnvConfig', JSON.stringify(config))
        this.ChangeCSS()
      })
    }
    const selectedCheckBox = (spanClone: HTMLSpanElement) => {
      spanClone.classList.remove('checkbox-default')
      spanClone.classList.add('checkbox-selected')
    }
    const defaultCheckBox = (spanClone: HTMLSpanElement) => {
      spanClone.classList.remove('checkbox-selected')
      spanClone.classList.add('checkbox-default')
    }
    const replaceItem = (listNodes: NodeListOf<HTMLLIElement>, x: string): HTMLLIElement | void => {
      for (const child of listNodes) {
        if (child.innerText === config.menu[x].replace) {
          return child
        }
      }
    }

    const itemHTML = <HTMLLIElement>(<HTMLLIElement>elmUList.firstElementChild).cloneNode(true)
    const itemInput = <HTMLInputElement>itemHTML.querySelector('input')
    const itemLabel = <HTMLLabelElement>itemHTML.querySelector('label')
    itemInput.id = itemInput.id.replace(/\d/, '')
    itemLabel.htmlFor = itemLabel.htmlFor.replace(/\d/, '')

    // 替换原有设置
    // 循环插入内容
    let i = listLength + 10
    const listNodes = <NodeListOf<HTMLLIElement>>elmUList.childNodes
    for (const x in config.menu) {
      const child = replaceItem(listNodes, x)
      if (child === undefined) {
        const itemHTMLClone = <HTMLLIElement>itemHTML.cloneNode(true)
        const itemInputClone = <HTMLInputElement>itemHTMLClone.querySelector('input')
        const itemLabelClone = <HTMLLabelElement>itemHTMLClone.querySelector('label')
        itemInputClone.id += i
        itemLabelClone.htmlFor += i
        i++
        itemLabelClone.innerText = config.menu[x].name

        changeListener(itemHTMLClone, x)

        elmUList.appendChild(itemHTMLClone)
      }
      else {
        const itemHTMLClone = <HTMLLIElement>child.cloneNode(true)
        const itemLabelClone = <HTMLLabelElement>itemHTMLClone.querySelector('label')
        itemLabelClone.innerText = config.menu[x].name

        changeListener(itemHTMLClone, x)
        child.remove()
        elmUList.appendChild(itemHTMLClone)
      }
    }
  }
  /**
   * 添加菜单所需css
   *
   * @memberof NoVIP
   */
  public AddCSS() {
    GM_addStyle(`
.gift-block {
  border: 2px solid;
  border-radius: 50%;
  display: inline-block;
  height: 17px;
  text-align: center;
  width: 17px;
}
.gift-block:before {
  content: '滚' !important;
  font-size: 13px;
  vertical-align: top;
}
/* 多行菜单 */
.border-box.dialog-ctnr.common-popup-wrap.top-left[style*="width: 200px;"] {
  width: 270px !important;
}
.block-effect-ctnr .item {
  float: left;
}
.block-effect-ctnr .item .cb-icon {
  left: unset !important;
  margin-left: -6px;
}
.block-effect-ctnr .item label {
  width: 84px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 隐藏网页全屏榜单 */
.player-full-win .rank-list-section {
  display: none !important;
}
.player-full-win .chat-history-panel:not([style]) {
  height: calc(100% - 135px) !important;
}`)
  }
}

// 加载设置
const defaultConfig: config = {
  version: 1679755673751,
  menu: {
    noGiftMsg: {
      name: '屏蔽礼物相关',
      replace: '屏蔽全部礼物及广播',
      enable: false
    },
    noSystemMsg: {
      name: '屏蔽系统消息',
      replace: '屏蔽进场信息',
      enable: false
    },
    noSuperChat: {
      name: '屏蔽醒目留言',
      replace: '屏蔽醒目留言',
      enable: false
    },
    noEmoticons: {
      name: '屏蔽表情聊天',
      replace: '屏蔽表情动画（右下角）',
      enable: false
    },
    noEmotDanmaku: {
      name: '屏蔽表情弹幕',
      replace: '屏蔽表情弹幕',
      enable: false
    },
    noGiftControl: {
      name: '屏蔽礼物控件',
      enable: false
    },
    noKanBanMusume: {
      name: '屏蔽看板娘',
      enable: false
    },
    noGuardIcon: {
      name: '屏蔽舰队标识',
      enable: false
    },
    noMedalIcon: {
      name: '屏蔽粉丝勋章',
      enable: false
    },
    noLiveTitleIcon: {
      name: '屏蔽成就头衔',
      enable: false
    },
    noRaffle: {
      name: '屏蔽抽奖橱窗',
      enable: false
    },
    noBBChat: {
      name: '屏蔽刷屏聊天',
      enable: false
    },
    noBBDanmaku: {
      name: '屏蔽刷屏弹幕',
      enable: false
    },
    noDanmakuColor: {
      name: '屏蔽弹幕颜色',
      enable: false
    },
    noGameId: {
      name: '屏蔽互动游戏',
      enable: false
    },
    noActivityPlat: {
      name: '屏蔽活动皮肤',
      enable: false
    },
    noRoomSkin: {
      name: '屏蔽房间皮肤',
      enable: false
    },
    noRoundPlay: {
      name: '屏蔽视频轮播',
      enable: false
    },
    noSleep: {
      name: '屏蔽挂机检测',
      enable: false
    },
    invisible: {
      name: '隐身入场',
      enable: false
    }
  }
}
const userConfig = <config>JSON.parse(GM_getValue('blnvConfig', JSON.stringify(defaultConfig)))
let config: config
if (userConfig.version === undefined || userConfig.version < defaultConfig.version) {
  for (const x in defaultConfig.menu) {
    try {
      defaultConfig.menu[x].enable = userConfig.menu[x].enable
    }
    catch (error) {
      console.error(GM_info.script.name, error)
    }
  }
  config = defaultConfig
}
else config = userConfig

if (location.href.match(/^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/)) {
  // 屏蔽视频轮播 & 隐身入场
  if (config.menu.invisible.enable || config.menu.noRoundPlay.enable || config.menu.noSleep.enable) {
    if (config.menu.noRoundPlay.enable)
      Reflect.defineProperty(W, '__NEPTUNE_IS_MY_WAIFU__', {})
    // 拦截xhr
    ajaxProxy.proxyAjax({
      open: function (args, _xhr) {
        // 隐身入场
        if (config.menu.invisible.enable && args[1].includes('//api.live.bilibili.com/xlive/web-room/v1/index/getInfoByUser'))
          return (args[1] = args[1].replace(/room_id=\d+/, 'room_id=273022')) && args
      },
      responseText: {
        getter: function (value, xhr) {
          // 屏蔽视频轮播
          if (config.menu.noRoundPlay.enable && xhr.responseURL.includes('//api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo'))
            return value.replace('"live_status":2', '"live_status":0')
          // 隐身入场
          if (config.menu.invisible.enable && xhr.responseURL.includes('//api.live.bilibili.com/xlive/web-room/v1/index/getInfoByUser'))
            return value.replace('"is_room_admin":false', '"is_room_admin":true')
          return value
        }
      },
      status: {
        getter: function (value, xhr) {
          // 屏蔽视频轮播
          if (config.menu.noRoundPlay.enable && xhr.responseURL.includes('//api.live.bilibili.com/live/getRoundPlayVideo'))
            return 403
          return value
        }
      }
    })
    // 拦截fetch
    W.fetch = new Proxy(W.fetch, {
      apply: async function (target, _this, args: [RequestInfo, RequestInit | undefined]) {
        // 屏蔽视频轮播
        if (config.menu.noRoundPlay.enable) {
          if (typeof args[0] === 'string' && args[0].includes('//api.live.bilibili.com/live/getRoundPlayVideo')) {
            // 为了兼容其他脚本
            const response: Response = await Reflect.apply(target, _this, args)
            return new Response(response.body, {
              status: 403,
              statusText: 'Forbidden',
              headers: response.headers
            })
          }
          if (typeof args[0] === 'string' && args[0].includes('//api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo')) {
            const response: Response = await Reflect.apply(target, _this, args)
            const body = await response.text()
            return new Response(body.replace('"live_status":2', '"live_status":0'))
          }
        }
        // 隐身入场
        if (config.menu.invisible.enable && typeof args[0] === 'string' && args[0].includes('//api.live.bilibili.com/xlive/web-room/v1/index/getInfoByUser')) {
          args[0] = args[0].replace(/room_id=\d+/, 'room_id=273022')
          const response: Response = await Reflect.apply(target, _this, args)
          const body = await response.text()
          return new Response(body.replace('"is_room_admin":false', '"is_room_admin":true'))
        }
        return Reflect.apply(target, _this, args)
      }
    })
    // 拦截函数
    W.webpackChunklive_room = W.webpackChunklive_room || []
    W.webpackChunklive_room.push = new Proxy(W.webpackChunklive_room.push, {
      apply: function (target, _this, args) {
        for (const [name, fn] of Object.entries<Function>(args[0][1])) {
          let fnStr = fn.toString()
          if (fnStr.includes('return this.chatList.children.length')) {
            const regexp = /(?<left>return )this\.chatList\.children\.length/s
            const match = fnStr.match(regexp)
            if (match !== null)
              fnStr = fnStr.replace(regexp, '$<left>[...this.chatList.children].reduce((a,c)=>c.classList.contains("danmaku-item")?a+1:a,0)')
            else console.error(GM_info.script.name, '增强聊天显示失效')
          }
          // 屏蔽视频轮
          if (config.menu.noRoundPlay.enable && fnStr.includes('/xlive/web-room/v2/index/getRoomPlayInfo 接口请求错误')) {
            const regexp = /(?<left>getRoomPlayInfo\?room_id=.*)(?<right>return(?:(?!return).)*?(?<mut>\w+)\.sent.*?getRoomPlayInfo 接口请求错误)/s
            const match = fnStr.match(regexp)
            if (match !== null)
              fnStr = fnStr.replace(regexp, '$<left>if($<mut>.sent.serverResponse.data.live_status===2)$<mut>.sent.serverResponse.data.live_status=0;$<right>')
            else console.error(GM_info.script.name, '屏蔽视频轮播失效')
          }
          // 屏蔽挂机检测
          if (config.menu.noSleep.enable && fnStr.includes('prototype.sleep=function(')) {
            const regexp = /(?<left>prototype\.sleep=function\(.*?\){)/
            const match = fnStr.match(regexp)
            if (match !== null)
              fnStr = fnStr.replace(regexp, '$<left>return;')
            else console.error(GM_info.script.name, '屏蔽挂机检测失效')
          }
          // 隐身入场
          if (config.menu.invisible.enable && fnStr.includes('/web-room/v1/index/getInfoByUser 接口请求错误')) {
            const regexp = /(?<left>getInfoByUser\?room_id=)"\+\w+(?<mid>\+.*)(?<right>return(?:(?!return).)*?(?<mut>\w+)\.sent.*?getInfoByUser 接口请求错误)/s
            const match = fnStr.match(regexp)
            if (match !== null)
              fnStr = fnStr.replace(regexp, '$<left>273022"$<mid>$<mut>.sent.serverResponse.data.badge.is_room_admin=true;$3')
            else console.error(GM_info.script.name, '隐身入场失效')
          }
          if (fn.toString() !== fnStr) args[0][1][name] = str2Fn(fnStr)
        }
        return Reflect.apply(target, _this, args)
      }
    })
    // 拦截ws
    if (config.menu.noRoundPlay.enable) {
      // @ts-ignore
      W.bliveproxy.addCommandHandler('PREPARING', command => {
        delete command.round
      })
    }
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
  }
  // 屏蔽活动皮肤
  // if (config.menu.noActivityPlat.enable && !document.head.innerHTML.includes('addWaifu')) {
  //   document.open()
  //   document.addEventListener('readystatechange', () => {
  //     if (document.readyState === 'complete') new NoVIP().Start()
  //   })
  //   const room4 = await fetch('/4', { credentials: 'include' }).then(res => res.text().catch(() => undefined)).catch(() => undefined)
  //   if (room4 !== undefined) {
  //     document.write(room4.replace(/<script>window\.__NEPTUNE_IS_MY_WAIFU__=.*?<\/script>/, ''))
  //     document.close()
  //   }
  // }
  // 屏蔽活动皮肤
  if (config.menu.noActivityPlat.enable) {
    if (self === top) {
      if (location.pathname.startsWith('/blanc'))
        history.replaceState(null, '', location.href.replace(`${location.origin}/blanc`, location.origin))
      else
        location.href = location.href.replace(location.origin, `${location.origin}/blanc`)
    }
    else {
      top?.postMessage(location.origin + location.pathname, 'https://live.bilibili.com')
      top?.postMessage(location.origin + location.pathname, 'https://www.bilibili.com')
    }
  }
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') new NoVIP().Start()
  })
}
else if (location.href.includes('bilibili.com/blackboard/')) {
  // 屏蔽活动皮肤
  if (config.menu.noActivityPlat.enable)
    W.addEventListener("message", msg => {
      if (msg.origin === 'https://live.bilibili.com' && (<string>msg.data).startsWith('https://live.bilibili.com/blanc/'))
        location.href = msg.data
    })
}
