// ==UserScript==
// @name                bilibili直播净化
// @namespace           https://github.com/lzghzr/GreasemonkeyJS
// @version             4.2.37
// @author              lzghzr
// @description         屏蔽聊天室礼物以及关键字, 净化聊天室环境
// @icon                data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIHN0cm9rZT0iIzAwYWVlYyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHRleHQgZm9udC1mYW1pbHk9Ik5vdG8gU2FucyBDSksgU0MiIGZvbnQtc2l6ZT0iMjIiIHg9IjUiIHk9IjIzIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMCIgZmlsbD0iIzAwYWVlYyI+5ruaPC90ZXh0Pjwvc3ZnPg==
// @supportURL          https://github.com/lzghzr/GreasemonkeyJS/issues
// @match               https://live.bilibili.com/*
// @match               https://www.bilibili.com/blackboard/*
// @license             MIT
// @compatible          chrome 基础功能需要 88 以上支持 :not() 伪类，高级功能需要 105 及以上支持 :has() 伪类
// @compatible          edge 基础功能需要 88 以上支持 :not() 伪类，高级功能需要 105 及以上支持 :has() 伪类
// @compatible          firefox 基础功能需要 84 以上支持 :not() 伪类，高级功能需要 121 及以上支持 :has() 伪类
// @grant               GM_addStyle
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               unsafeWindow
// @run-at              document-start
// ==/UserScript==
const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
class NoVIP {
  elmStyleCSS;
  chatObserver;
  danmakuObserver;
  Start() {
    this.elmStyleCSS = GM_addStyle('');
    this.AddCSS();
    const chatMessage = new Map();
    this.chatObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('danmaku-item')) {
            const chatNode = addedNode.querySelector('.danmaku-item-right');
            if (chatNode !== null) {
              const chatText = chatNode.innerText;
              const dateNow = Date.now();
              if (chatMessage.has(chatText) && dateNow - chatMessage.get(chatText) < 10_000) {
                addedNode.classList.add('NoVIP_chat_hide');
              }
              else {
                chatMessage.set(chatText, dateNow);
              }
            }
          }
        });
      });
    });
    const elmDivChatList = document.querySelector('#chat-items');
    if (elmDivChatList !== null) {
      this.chatObserver.observe(elmDivChatList, { childList: true });
    }
    const danmakuMessage = new Map();
    this.danmakuObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          const danmakuNode = addedNode instanceof Text ? addedNode.parentElement : addedNode;
          if (danmakuNode?.classList?.contains('bili-dm')) {
            const danmakuText = danmakuNode.innerText.split(/ ?[x×]\d+$/);
            const dateNow = Date.now();
            if (danmakuMessage.has(danmakuText[0]) && dateNow - danmakuMessage.get(danmakuText[0]) < 10_000) {
              danmakuNode.classList.add('NoVIP_danmaku_hide');
            }
            else if (danmakuText[1] !== undefined) {
              danmakuNode.classList.add('NoVIP_danmaku_hide');
            }
            else {
              danmakuMessage.set(danmakuText[0], dateNow);
            }
          }
        });
      });
    });
    const elmDivDanmaku = document.querySelector('#live-player');
    if (elmDivDanmaku !== null) {
      this.danmakuObserver.observe(elmDivDanmaku, { childList: true, subtree: true });
    }
    setInterval(() => {
      const dateNow = Date.now();
      chatMessage.forEach((value, key) => {
        if (dateNow - value > 60_000) {
          chatMessage.delete(key);
        }
      });
      danmakuMessage.forEach((value, key) => {
        if (dateNow - value > 60_000) {
          danmakuMessage.delete(key);
        }
      });
    }, 60_000);
    const docObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode instanceof HTMLDivElement && addedNode.classList.contains('dialog-ctnr')) {
            const blockEffectCtnr = addedNode.querySelector('.block-effect-ctnr');
            if (blockEffectCtnr !== null) {
              this.AddUI(blockEffectCtnr);
            }
          }
        });
      });
    });
    docObserver.observe(document, { childList: true, subtree: true });
    const block = localStorage.getItem('LIVE_BLCOK_EFFECT_STATE');
    if (block?.includes('2')) {
      localStorage.setItem('LIVE_BLCOK_EFFECT_STATE', '2');
    }
    else {
      localStorage.setItem('LIVE_BLCOK_EFFECT_STATE', '');
    }
    this.ChangeCSS();
  }
  NORoomSkin() {
    if (config.menu.noRoomSkin.enable) {
      W.roomBuffService.__NORoomSkin = true;
      W.roomBuffService.unmount();
    }
    else {
      W.roomBuffService.__NORoomSkin = false;
      W.roomBuffService.mount(W.roomBuffService.__NORoomSkin_skin);
    }
  }
  ChangeCSS() {
    let height = 62;
    let cssText = `
/* 统一用户名颜色 */
.chat-item .user-name {
  color: var(--brand_blue) !important;
}`;
    if (config.menu.noGuardIcon.enable) {
      cssText += `
/* 聊天背景 */
.chat-item.chat-colorful-bubble {
  background-color: unset !important;
  border-image-source: unset !important;
  border-radius: unset !important;
  display: block !important;
  margin: unset !important;
}
/* 聊天背景 */
.chat-item.chat-colorful-bubble div:has(div[style*="border-image-source"]),
/* 欢迎提示条 */
#welcome-area-bottom-vm:has(.sama-avatar-box),
/* 粉丝勋章内标识 */
.chat-item .fans-medal-item-ctnr .medal-guard,
/* 舰队指挥官标识 */
.chat-item .pilot-icon,
.chat-item .pilot-icon ~ br,
/* 订阅舰长 */
.chat-item.guard-buy {
  display: none !important;
}
/* 兼容chrome 105以下版本 */
@supports not selector(:has(a, b)) {
  .chat-item.chat-colorful-bubble div[style*="border-image-source"]
  #welcome-area-bottom-vm {
  display: none !important;
  }
}`;
    }
    if (config.menu.noWealthMedalIcon.enable) {
      cssText += `
/* 聊天背景, 存疑 */
.chat-item.wealth-bubble {
  border-image-source: unset !important;
}
/* 聊天背景, 存疑 */
.chat-item.has-bubble {
  border-image-source: unset !important;
  border-image-slice: unset !important;
  border-image-width: unset !important;
  box-sizing: unset !important;
  display: block !important;
  margin: unset !important;
}
/* 欢迎提示条 */
#welcome-area-bottom-vm:has(.wealth-medal),
/* 弹幕 */
.bili-dm > .bili-icon,
/* 聊天 */
.chat-item .wealth-medal-ctnr {
  display: none !important;
}
/* 兼容chrome 105以下版本 */
@supports not selector(:has(a, b)) {
  #welcome-area-bottom-vm {
  display: none !important;
  }
}`;
    }
    if (config.menu.noGiftMsg.enable) {
      height -= 32;
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
/* 礼物栏 */
.gift-control-panel > *:not(.left-part-ctnr),
#web-player__bottom-bar__container,

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
}`;
    }
    if (config.menu.noSystemMsg.enable) {
      height -= 30;
      cssText += `
.chat-history-list.with-brush-prompt {
  height: 100% !important;
}
/* 目前只看到冲榜提示 */
.chat-history-panel #all-guide-cards,
/* 聊天下方滚动消息，进场、点赞之类的 */
#brush-prompt,
/* 初始系统提示 */
.chat-item.convention-msg,
/* 各种野生消息 */
.chat-item.common-danmuku-msg,
/* 各种野生消息 x2 */
.chat-item.misc-msg,
/* 各种野生消息 x3 (Toasts) */
.link-toast,
/* pk */
.chat-item.new-video-pk-item-dm {
  display: none !important;
}`;
    }
    if (config.menu.noSuperChat.enable) {
      cssText += `
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
.chat-item .name,
.chat-item .card-item-name {
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
.chat-item .card-item-name>span {
  color: var(--brand_blue) !important;
}
/* 为 SuperChat 用户名添加 : */
.chat-item.superChat-card-detail .name:after,
.chat-item.superChat-card-detail .card-item-name>span:after {
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
  color: var(--text2) !important;
}
/* SuperChat 提示条 */
#chat-msg-bubble-vm,
/* SuperChat 保留条 */
#pay-note-panel-vm,
.chat-item .bottom-background,
/* SuperChat 聊天条 右上角电池 */
.chat-item .card-item-top-right,
/* SuperChat 按钮 */
#chat-control-panel-vm .super-chat {
  display: none !important;
}`;
    }
    if (config.menu.noEmoticons.enable) {
      cssText += `
#chat-control-panel-vm .emoticons-panel,
.chat-item.chat-emoticon {
  display: none !important;
}`;
    }
    if (config.menu.noEmotDanmaku.enable) {
      cssText += `
.bili-dm > img:not(.bili-icon) {
  display: none !important;
}`;
    }
    if (config.menu.noLikeBtn.enable) {
      cssText += `
/* 点赞按钮 */
#chat-control-panel-vm .like-btn,
/* 点赞消息 */
.chat-item[data-type="6"],
/* 点赞数 */
#head-info-vm .icon-ctnr:has(.like-icon) {
  display: none !important;
}
/* 兼容chrome 105以下版本 */
@supports not selector(:has(a, b)) {
  #head-info-vm .like-icon,
  #head-info-vm .like-text {
  display: none !important;
  }
}`;
    }
    if (config.menu.noGiftControl.enable) {
      cssText += `
/* 排行榜 */
.rank-list-section .gift-rank-cntr .top3-cntr .default,
.rank-list-section .guard-rank-cntr:not(.open) .guard-empty {
  height: 42px !important;
}
.rank-list-section .guard-rank-cntr:not(.open) .guard-empty {
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
.rank-list-section .gift-rank-cntr .top3-cntr .default-msg {
  bottom: -12px !important;
}
.rank-list-section,
.rank-list-section.new .rank-list-ctnr[style*="height: 178px;"] {
  height: 98px !important;
}
.rank-list-section .tab-content,
.rank-list-section .tab-content-pilot,
.rank-list-section.new .guard-rank-cntr .rank-list-cntr {
  min-height: unset !important;
}
.rank-list-section .tab-content[style*="height: 9"],
.rank-list-section .tab-content-pilot[style*="height: 9"],
.rank-list-section .gift-rank-cntr .top3-cntr {
  height: 64px !important;
}
.rank-list-section .guard-rank-cntr .top3-cntr > span {
  height: 32px !important;
}
.rank-list-section.new .gift-rank-cntr .top3-cntr,
.rank-list-section.new .guard-rank-cntr {
  height: unset !important;
}
.rank-list-section.new .gift-rank-cntr .top3-cntr {
  padding-top: 5px !important;
}
.rank-list-section.new .guard-rank-cntr .top3-cntr {
  top: 15px !important;
}
/* 调整聊天区 */
.rank-list-section~.chat-history-panel {
  height: calc(100% - 98px - 145px) !important;
}
/* 直播分区 */
.live-area {
  display: flex !important;
}
/* 排行榜 */
.rank-list-section.new .gift-rank-cntr .top3 > div ~ div,
.rank-list-section.new .guard-rank-cntr .top3-cntr > span ~ span,
.rank-list-section.new .pilot,
/* 人气榜 */
#head-info-vm .popular-and-hot-rank,
/* 礼物星球 */
#head-info-vm .gift-planet-entry,
/* 活动榜 */
#head-info-vm .activity-entry,
/* 粉丝团  */
#head-info-vm .follow-ctnr,
/* 礼物按钮 */
#web-player-controller-wrap-el .web-live-player-gift-icon-wrap,
/* 头像框 */
.blive-avatar-pendant,
/* 主播城市 */
.anchor-location,
/* 水印 */
.web-player-icon-roomStatus,
.blur-edges-ctnr,
/* 遮罩 */
#web-player-module-area-mask-panel {
  display: none !important;
}`;
    }
    if (config.menu.noFansMedalIcon.enable) {
      cssText += `
/* 团体勋章 */
.chat-item .group-medal-ctnr,
/* 团体勋章 底部提示条 */
#brush-prompt .group-medal-ctnr,
/* 粉丝勋章 聊天 */
.chat-item .fans-medal-item-ctnr,
/* 粉丝勋章 底部提示条 */
#brush-prompt .fans-medal-item-ctnr {
  display: none !important;
}`;
    }
    if (config.menu.noLiveTitleIcon.enable) {
      cssText += `
.chat-item .title-label {
  display: none !important;
}`;
    }
    if (config.menu.noRaffle.enable) {
      cssText += `
body:not(.player-full-win):has(#anchor-guest-box-id)[style*="overflow: hidden;"] {
  overflow-y: overlay !important;
}
#shop-popover-vm,
#anchor-guest-box-id,
#player-effect-vm,
#chat-draw-area-vm,
/* 天选之类的 */
.gift-control-panel .left-part-ctnr,
.anchor-lottery-entry,
.popular-main .lottery {
  display: none !important;
}
/* 兼容chrome 105以下版本 */
@supports not selector(:has(a, b)) {
  body:not(.player-full-win)[style*="overflow: hidden;"] {
  overflow-y: overlay !important;
  }
}`;
    }
    if (config.menu.noDanmakuColor.enable) {
      cssText += `
.bili-dm {
  color: #ffffff !important;
}`;
    }
    if (config.menu.noGameId.enable) {
      cssText += `
/* 总容器 */
.web-player-inject-wrap,
/* PK */
/* #pk-vm, */
/* #awesome-pk-vm, */
/* #chaos-pk-vm, */
/* 多人连麦 */
/* #multi-voice-index, */
/* #multi-player, */
/* 互动游戏 */
#game-id,
/* 连麦 */
#chat-control-panel-vm .voice-rtc,
/* 帮玩 */
#chat-control-panel-vm .play-together-service-card-container,
/* 一起玩 */
#chat-control-panel-vm .play-together-entry,
/* 神秘人 */
.chat-item .common-nickname-medal {
  display: none !important;
}`;
    }
    if (config.menu.noBBChat.enable) {
      cssText += `
/* 官方 */
#aside-area-vm #combo-card,
#aside-area-vm #combo-danmaku-vm,
#aside-area-vm .vote-card,
/* 自定义 */
.chat-item.NoVIP_chat_hide {
  display: none !important;
}`;
    }
    if (config.menu.noBBDanmaku.enable) {
      cssText += `
/* 官方 */
.danmaku-item-container .bilibili-combo-danmaku-container,
.danmaku-item-container .combo {
  display: none !important;
}
/* 自定义 */
.bili-dm.NoVIP_danmaku_hide,
/* 官方 */
.danmaku-item-container .mode-adv {
  color: transparent !important;
  text-shadow: unset !important;
}`;
    }
    cssText += `
.chat-history-list.with-penury-gift.with-brush-prompt {
  height: calc(100% - ${height}px) !important;
}`;
    this.NORoomSkin();
    this.elmStyleCSS.innerHTML = cssText;
  }
  AddUI(addedNode) {
    const elmUList = addedNode.firstElementChild;
    elmUList.childNodes.forEach(child => {
      if (child instanceof Comment) {
        child.remove();
      }
    });
    const listLength = elmUList.childElementCount;
    if (listLength > 10) {
      return;
    }
    const changeListener = (itemHTML, x) => {
      const itemSpan = itemHTML.querySelector('span');
      const itemInput = itemHTML.querySelector('input');
      itemInput.checked = config.menu[x].enable;
      itemInput.checked ? selectedCheckBox(itemSpan) : defaultCheckBox(itemSpan);
      itemInput.addEventListener('change', ev => {
        const evt = ev.target;
        evt.checked ? selectedCheckBox(itemSpan) : defaultCheckBox(itemSpan);
        config.menu[x].enable = evt.checked;
        GM_setValue('blnvConfig', encodeURI(JSON.stringify(config)));
        this.ChangeCSS();
      });
    };
    const selectedCheckBox = (spanClone) => {
      spanClone.classList.remove('checkbox-default');
      spanClone.classList.add('checkbox-selected');
    };
    const defaultCheckBox = (spanClone) => {
      spanClone.classList.remove('checkbox-selected');
      spanClone.classList.add('checkbox-default');
    };
    const replaceItem = (listNodes, x) => {
      for (const child of listNodes) {
        if (child.innerText === config.menu[x].replace) {
          return child;
        }
      }
    };
    const itemHTML = elmUList.firstElementChild.cloneNode(true);
    const itemInput = itemHTML.querySelector('input');
    const itemLabel = itemHTML.querySelector('label');
    itemInput.id = itemInput.id.replace(/\d/, '');
    itemLabel.htmlFor = itemLabel.htmlFor.replace(/\d/, '');
    let i = listLength + 10;
    const listNodes = elmUList.childNodes;
    for (const x in config.menu) {
      const child = replaceItem(listNodes, x);
      if (child === undefined) {
        const itemHTMLClone = itemHTML.cloneNode(true);
        const itemInputClone = itemHTMLClone.querySelector('input');
        const itemLabelClone = itemHTMLClone.querySelector('label');
        itemInputClone.id += i;
        itemLabelClone.htmlFor += i;
        i++;
        itemLabelClone.innerText = config.menu[x].name;
        changeListener(itemHTMLClone, x);
        elmUList.appendChild(itemHTMLClone);
      }
      else {
        const itemHTMLClone = child.cloneNode(true);
        const itemLabelClone = itemHTMLClone.querySelector('label');
        itemLabelClone.innerText = config.menu[x].name;
        changeListener(itemHTMLClone, x);
        child.remove();
        elmUList.appendChild(itemHTMLClone);
      }
    }
  }
  AddCSS() {
    GM_addStyle(`
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
}
.player-full-win .chat-history-panel.new {
  height: calc(100% - 135px) !important;
}`);
  }
}
const defaultConfig = {
  version: 1710342294818,
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
    noLikeBtn: {
      name: '屏蔽点赞按钮',
      enable: false
    },
    noGiftControl: {
      name: '屏蔽活动控件',
      enable: false
    },
    noGuardIcon: {
      name: '屏蔽舰队标识',
      enable: false
    },
    noWealthMedalIcon: {
      name: '屏蔽荣耀勋章',
      enable: false
    },
    noFansMedalIcon: {
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
    noDanmakuColor: {
      name: '屏蔽弹幕颜色',
      enable: false
    },
    noGameId: {
      name: '屏蔽互动游戏',
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
    noRoomSkin: {
      name: '屏蔽房间皮肤',
      enable: false
    },
    noActivityPlat: {
      name: '屏蔽活动皮肤',
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
};
const userConfig = GM_getValue('blnvConfig', null) === null ? defaultConfig : JSON.parse(decodeURI(GM_getValue('blnvConfig')));
let config;
if (userConfig.version === undefined || userConfig.version < defaultConfig.version) {
  for (const x in defaultConfig.menu) {
    try {
      defaultConfig.menu[x].enable = userConfig.menu[x].enable;
    }
    catch (error) {
      console.error(...scriptName('载入配置失效'), error);
    }
  }
  config = defaultConfig;
}
else {
  config = userConfig;
}
if (location.href.match(/^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d/)) {
  W.getComputedStyle = new Proxy(W.getComputedStyle, {
    apply: function (target, _this, args) {
      if (args !== undefined && args[0] instanceof HTMLElement) {
        let htmlEle = Reflect.apply(target, _this, args);
        htmlEle = new Proxy(htmlEle, {
          get: function (_target, propertyKey) {
            if (propertyKey === 'display' && _target[propertyKey] === 'none') {
              return 'block';
            }
            return Reflect.get(_target, propertyKey);
          }
        });
        return htmlEle;
      }
      return Reflect.apply(target, _this, args);
    }
  });
  Object.defineProperty(W, '__NEPTUNE_IS_MY_WAIFU__', {});
  let push = 1 << 8;
  W.webpackChunklive_room = W.webpackChunklive_room || [];
  W.webpackChunklive_room.push = new Proxy(W.webpackChunklive_room.push, {
    apply: function (target, _this, args) {
      for (const [name, fn] of Object.entries(args[0][1])) {
        let fnStr = fn.toString();
        if (fnStr.includes('staticClass:"block-effect-icon-root"')) {
          const regexp = /(?<left>staticClass:"block-effect-icon-root"\},\[)"on"===(?<mut_t>\w+)\.blockEffectStatus\?(?<svg>(?<mut_n>\w+)\("svg".*?)\[\k<mut_n>\("path".*?blockEffectIconColor\}\}\)\]/s;
          const match = fnStr.match(regexp);
          if (match !== null) {
            fnStr = fnStr.replace(regexp, '$<left>$<svg>\[\
$<mut_n>("circle",{attrs:{cx:"12",cy:"12",r:"10",stroke:$<mut_t>.blockEffectIconColor,"stroke-width":"1.5",fill:"none"}}),\
$<mut_t>._v(" "),\
$<mut_n>("text",{attrs:{"font-family":"Noto Sans CJK SC","font-size":"14",x:"5",y:"17",fill:$<mut_t>.blockEffectIconColor}},[$<mut_t>._v("滚")])\
]');
            console.info(...scriptName('脚本 icon 已加载'));
          }
          else {
            console.error(...scriptName('插入脚本 icon 失效'), fnStr);
          }
          push |= 1 << 0;
        }
        if (fnStr.includes('return this.chatList.children.length')) {
          const regexp = /(?<left>return )this\.chatList\.children\.length/s;
          const match = fnStr.match(regexp);
          if (match !== null) {
            fnStr = fnStr.replace(regexp, '$<left>this.chatList.querySelectorAll(".danmaku-item:not(.NoVIP_hide)").length');
            console.info(...scriptName('增强聊天显示已加载'));
          }
          else {
            console.error(...scriptName('增强聊天显示失效'), fnStr);
          }
          push |= 1 << 1;
        }
        if (fnStr.includes('/xlive/app-room/v2/guardTab/topList')) {
          const regexp = /(?<left>\.guard\+" "\+.*?)(?<right>return(?:(?!return).)*?(?<mut>\w+)\.data.*?\.top3)/s;
          const match = fnStr.match(regexp);
          if (match !== null) {
            fnStr = fnStr.replace(regexp, '$<left>$<mut>.data.info.anchor_guard_achieve_level=0;$<right>');
            console.info(...scriptName('屏蔽大航海背景图已加载'));
          }
          else {
            console.error(...scriptName('屏蔽大航海背景图失效'), fnStr);
          }
          push |= 1 << 2;
        }
        if (config.menu.noRoundPlay.enable) {
          if (fnStr.includes('/xlive/web-room/v2/index/getRoomPlayInfo 接口请求错误')) {
            const regexp = /(?<left>getRoomPlayInfo\?room_id=.*?)(?<right>return(?:(?!return).)*?(?<mut>\w+)\.sent.*?getRoomPlayInfo 接口请求错误)/s;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>if($<mut>.sent.serverResponse.data.live_status===2)$<mut>.sent.serverResponse.data.live_status=0;$<right>');
              console.info(...scriptName('屏蔽视频轮播已加载'));
            }
            else {
              console.error(...scriptName('屏蔽视频轮播失效'), fnStr);
            }
            push |= 1 << 3;
          }
          if (fnStr.includes('case"PREPARING":')) {
            const regexp = /(?<left>case"PREPARING":)(?<right>\w+\((?<mut>\w+)\);break;)/s;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>$<mut>.round=0;$<right>');
              console.info(...scriptName('屏蔽下播轮播已加载'));
            }
            else {
              console.error(...scriptName('屏蔽下播轮播失效'), fnStr);
            }
            push |= 1 << 4;
          }
        }
        else {
          push |= (1 << 3 | 1 << 4);
        }
        if (config.menu.noSleep.enable) {
          if (fnStr.includes('prototype.sleep=function(')) {
            const regexp = /(?<left>prototype\.sleep=function\(\w*\){)/;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>return;');
              console.info(...scriptName('屏蔽挂机检测已加载'));
            }
            else {
              console.error(...scriptName('屏蔽挂机检测失效'), fnStr);
            }
            push |= 1 << 5;
          }
        }
        else {
          push |= 1 << 5;
        }
        if (config.menu.invisible.enable) {
          if (fnStr.includes('/web-room/v1/index/getInfoByUser 接口请求错误')) {
            const regexp = /(?<left>not_mock_enter_effect="\+)\w+(?<right>\W)/s;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>1$<right>');
              console.info(...scriptName('进入房间隐身已加载'));
            }
            else {
              console.error(...scriptName('进入房间隐身失效'), fnStr);
            }
            push |= 1 << 6;
          }
          if (fnStr.includes('this.enterRoomTracker=new ')) {
            const regexp = /(?<left>this\.enterRoomTracker=new \w+),/s;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>,this.enterRoomTracker.report=()=>{},');
              console.info(...scriptName('房间心跳隐身已加载'));
            }
            else {
              console.error(...scriptName('房间心跳隐身失效'), fnStr);
            }
            push |= 1 << 7;
          }
        }
        else {
          push |= (1 << 6 | 1 << 7);
        }
        if (fn.toString() !== fnStr) {
          args[0][1][name] = str2Fn(fnStr);
        }
        if (isAllBitsSet(push)) {
          W.webpackChunklive_room.push = target;
          break;
        }
      }
      return Reflect.apply(target, _this, args);
    }
  });
  let add = 1 << 1;
  Set.prototype.add = new Proxy(Set.prototype.add, {
    apply: function (target, _this, args) {
      if (args[0] && args[0] instanceof Function) {
        let fnStr = args[0].toString();
        if (config.menu.noRoundPlay.enable) {
          if (fnStr.includes('.Preparing:')) {
            const regexp = /(?<left>Preparing:)(?<right>.*?1===(?<mut>\w+)\.round)/s;
            const match = fnStr.match(regexp);
            if (match !== null) {
              fnStr = fnStr.replace(regexp, '$<left>$<mut>.round=0;$<right>');
              console.info(...scriptName('屏蔽下播轮播已加载'));
            }
            else {
              console.error(...scriptName('屏蔽下播轮播失效'), fnStr);
            }
            add |= 1 << 0;
          }
        }
        else {
          add |= 1 << 0;
        }
        if (args[0].toString() !== fnStr) {
          args[0] = str2Fn(fnStr);
        }
        if (isAllBitsSet(add)) {
          Set.prototype.add = target;
        }
      }
      return Reflect.apply(target, _this, args);
    }
  });
  W.fetch = new Proxy(W.fetch, {
    apply: async function (target, _this, args) {
      if (config.menu.noRoundPlay.enable) {
        if (typeof args[0] === 'string' && args[0].includes('/xlive/web-room/v2/index/getRoomPlayInfo')) {
          console.info(...scriptName('屏蔽视频轮播已加载'));
          const response = await Reflect.apply(target, _this, args);
          const body = await response.text();
          return new Response(body.replace('"live_status":2', '"live_status":0'));
        }
      }
      return Reflect.apply(target, _this, args);
    }
  });
  if (config.menu.noActivityPlat.enable) {
    if (self === top) {
      if (location.pathname.startsWith('/blanc')) {
        history.replaceState(null, '', location.href.replace(`${location.origin}/blanc`, location.origin));
      }
      else {
        location.href = location.href.replace(location.origin, `${location.origin}/blanc`);
      }
    }
    else {
      top?.postMessage(location.origin + location.pathname, 'https://live.bilibili.com');
      top?.postMessage(location.origin + location.pathname, 'https://www.bilibili.com');
    }
  }
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
      if (W.roomBuffService.mount !== undefined) {
        W.roomBuffService.mount = new Proxy(W.roomBuffService.mount, {
          apply: function (target, _this, args) {
            if (args[0] !== undefined) {
              _this.__NORoomSkin_skin = args[0];
              if (args[0].id !== 0) {
                _this.__NORoomSkin_skin_id = args[0].id;
              }
              if (_this.__NORoomSkin) {
                args[0].id = 0;
                args[0] = {};
              }
              else if (args[0].id === 0 && args[0].start_time !== 0) {
                args[0].id = _this.__NORoomSkin_skin_id || 0;
              }
            }
            return Reflect.apply(target, _this, args);
          }
        });
        W.roomBuffService.unmount = new Proxy(W.roomBuffService.unmount, {
          apply: function (target, _this, args) {
            if (_this.__NORoomSkin_skin !== undefined) {
              _this.__NORoomSkin_skin.id = 0;
            }
            return Reflect.apply(target, _this, args);
          }
        });
      }
    }
    if (document.readyState === 'complete') {
      new NoVIP().Start();
    }
  });
}
else if (location.href.includes('bilibili.com/blackboard/')) {
  if (config.menu.noActivityPlat.enable) {
    W.addEventListener("message", msg => {
      if (msg.origin === 'https://live.bilibili.com' && msg.data.startsWith('https://live.bilibili.com/blanc/')) {
        location.href = msg.data;
      }
    });
  }
}
function str2Fn(str) {
  const fnReg = str.match(/([^\{]*)\{(.*)\}$/s);
  if (fnReg !== null) {
    const [, head, body] = fnReg;
    const args = head.replaceAll(/function[^\(]*|[\s()=>]/g, '').split(',');
    return new Function(...args, body);
  }
}
function isAllBitsSet(value) {
  if (value === 0) {
    return false;
  }
  return (value & (value + 1)) === 0;
}
function scriptName(name) {
  return [
    `%c${GM_info.script.name}%c ${name}`,
    "font-weight: bold; color: white; background-color: #FF6699; padding: 1px 4px; border-radius: 4px;",
    "font-weight: bold; color: #FF6699;"
  ];
}