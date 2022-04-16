// ==UserScript==
// @name        steam卡牌利润最大化
// @namespace   https://github.com/lzghzr/GreasemonkeyJS
// @version     0.2.26
// @author      lzghzr
// @description 按照美元区出价, 最大化steam卡牌卖出的利润
// @supportURL  https://github.com/lzghzr/GreasemonkeyJS/issues
// @match       http://steamcommunity.com/*/inventory/
// @match       https://steamcommunity.com/*/inventory/
// @connect     sp0.baidu.com
// @license     MIT
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// @noframes
// ==/UserScript==
import { GM_addStyle, GM_xmlhttpRequest } from '../@types/tm_f'
import { baiduExch, priceoverview, itemordershistogram, sellitem, rgItem } from './SteamCardMaximumProfit'

const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
let gInputUSDCNY: HTMLInputElement
let gDivLastChecked: HTMLDivElement
let gInputAddCent: HTMLInputElement
let gSpanQuickSurplus: HTMLSpanElement
let gSpanQuickError: HTMLSpanElement
const gDivItems: HTMLDivElement[] = []
const gQuickSells: ItemInfo[] = []
// 执行程序
addCSS()
addUI()
doLoop()
const elmDivActiveInventoryPage = <HTMLDivElement>document.querySelector('#inventories')
// 创建观察者对象
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    // 有点丑的复选框
    const rt = <HTMLDivElement>mutation.target
    if (rt.classList.contains('inventory_page')) {
      const itemHolders = <NodeListOf<HTMLDivElement>>rt.querySelectorAll('.itemHolder')
      itemHolders.forEach(itemHolder => {
        const rgItem = itemHolder.rgItem
        if (rgItem !== undefined && !gDivItems.includes(rgItem.element) && rgItem.description.marketable === 1) {
          gDivItems.push(rgItem.element)
          // 复选框
          const elmDiv = document.createElement('div')
          elmDiv.classList.add('scmpItemCheckbox')
          rgItem.element.appendChild(elmDiv)
        }
      })
    }
  })
})
// 传入目标节点和观察选项
observer.observe(elmDivActiveInventoryPage, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
/**
 * 添加复选框和汇率输入框
 * 
 */
async function addUI() {
  // 插入快速出售按钮
  const elmDivInventoryPageRight = <HTMLDivElement>document.querySelector('.inventory_page_right')
  const elmDiv = document.createElement('div')
  elmDiv.innerHTML = `
<div class="scmpQuickSell">快速以此价格出售:
  <span class="btn_green_white_innerfade" id="scmpQuickSellItem">null</span>
  <span>
    加价: $
    <input class="filter_search_box" id="scmpAddCent" type="number" value="0.00" step="0.01">
  </span>
</div>
<div>
  汇率:
  <input class="filter_search_box" id="scmpExch" type="number" value="6.50">
  <span class="btn_green_white_innerfade" id="scmpQuickAllItem">快速出售</span>
  剩余:
  <span id="scmpQuickSurplus">0</span>
  失败:
  <span id="scmpQuickError">0</span>
</div>`
  elmDivInventoryPageRight.appendChild(elmDiv)
  // 获取快速出售按钮
  const elmSpanQuickSellItem = <HTMLSpanElement>elmDiv.querySelector('#scmpQuickSellItem')
  const elmSpanQuickAllItem = <HTMLSpanElement>document.querySelector('#scmpQuickAllItem')
  gInputAddCent = <HTMLInputElement>elmDiv.querySelector('#scmpAddCent')
  gSpanQuickSurplus = <HTMLSpanElement>elmDiv.querySelector('#scmpQuickSurplus')
  gSpanQuickError = <HTMLSpanElement>elmDiv.querySelector('#scmpQuickError')
  // 监听全局点击事件
  document.addEventListener('click', async (ev: MouseEvent) => {
    const evt = <HTMLElement>ev.target
    // 点击物品
    if (evt.className === 'inventory_item_link') {
      elmSpanQuickSellItem.innerText = 'null'
      const rgItem = (<HTMLDivElement>evt.parentNode).rgItem
      const itemInfo = new ItemInfo(rgItem)
      const priceOverview = await getPriceOverview(itemInfo)
      if (priceOverview !== 'error') elmSpanQuickSellItem.innerText = <string>priceOverview.formatPrice
    }
    // 选择逻辑
    else if (evt.classList.contains('scmpItemCheckbox')) {
      const rgItem = (<HTMLDivElement>evt.parentNode).rgItem
      const select = evt.classList.contains('scmpItemSelect')
      // 改变背景
      const changeClass = (elmDiv: HTMLDivElement) => {
        const elmCheckbox = <HTMLDivElement>elmDiv.querySelector('.scmpItemCheckbox')
        if ((<HTMLDivElement>elmDiv.parentNode).style.display !== 'none' && !elmCheckbox.classList.contains('scmpItemSuccess')) {
          elmCheckbox.classList.remove('scmpItemError')
          elmCheckbox.classList.toggle('scmpItemSelect', !select)
        }
      }
      // shift多选
      if (gDivLastChecked !== undefined && ev.shiftKey) {
        const start = gDivItems.indexOf(gDivLastChecked)
        const end = gDivItems.indexOf(rgItem.element)
        const someDivItems = gDivItems.slice(Math.min(start, end), Math.max(start, end) + 1)
        for (const y of someDivItems) changeClass(y)
      }
      else changeClass(rgItem.element)
      gDivLastChecked = rgItem.element
    }
  })
  // 点击快速出售
  elmSpanQuickSellItem.addEventListener('click', (ev: Event) => {
    const evt = <HTMLSpanElement>ev.target
    const elmDivActiveInfo = <HTMLDivElement>document.querySelector('.activeInfo')
    const rgItem = elmDivActiveInfo.rgItem
    const elmDivitemCheck = <HTMLDivElement>rgItem.element.querySelector('.scmpItemCheckbox')
    if (!elmDivitemCheck.classList.contains('scmpItemSuccess') && evt.innerText !== 'null') {
      const price = W.GetPriceValueAsInt(evt.innerText)
      const itemInfo = new ItemInfo(rgItem, price)
      quickSellItem(itemInfo)
    }
  })
  // 点击全部出售
  elmSpanQuickAllItem.addEventListener('click', () => {
    const elmDivItemInfos = document.querySelectorAll('.scmpItemSelect')
    elmDivItemInfos.forEach(elmDivItemInfo => {
      const rgItem = (<HTMLDivElement>elmDivItemInfo.parentNode).rgItem
      const itemInfo = new ItemInfo(rgItem)
      if (rgItem.description.marketable === 1) gQuickSells.push(itemInfo)
    })
  })
  // 点击加价
  gInputAddCent.addEventListener('input', () => {
    const activeInfo = <HTMLLinkElement>document.querySelector('.activeInfo > .inventory_item_link')
    activeInfo.click()
  })
  // 改变汇率
  gInputUSDCNY = <HTMLInputElement>elmDiv.querySelector('#scmpExch')
  // 在线获取实时汇率
  const baiduExch = await XHR<baiduExch>({
    GM: true,
    method: 'GET',
    url: `https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=1%E7%BE%8E%E5%85%83%E7%AD%89%E4%BA%8E%E5%A4%9A%E5%B0%91%E4%BA%BA%E6%B0%91%E5%B8%81&resource_id=6017&t=${Date.now()}&ie=utf8&oe=utf8&format=json&tn=baidu`,
    responseType: 'json',
  })
  if (baiduExch?.body?.data[0] !== undefined && baiduExch.response.status === 200) gInputUSDCNY.value = baiduExch.body.data[0].number2
}
/**
 * 获取美元区价格
 * 
 * @param {ItemInfo} itemInfo 
 * @returns {(Promise<'error' | ItemInfo>)} 
 */
async function getPriceOverview(itemInfo: ItemInfo): Promise<'error' | ItemInfo> {
  const priceoverview = await XHR<priceoverview>({
    method: 'GET',
    url: `/market/priceoverview/?country=US&currency=1&appid=${itemInfo.rgItem.description.appid}\
&market_hash_name=${encodeURIComponent(W.GetMarketHashName(itemInfo.rgItem.description))}`,
    responseType: 'json'
  })
  const stop = (): 'error' => itemInfo.status = 'error'
  if (priceoverview !== undefined && priceoverview.response.status === 200
    && priceoverview.body.success && priceoverview.body.lowest_price) {
    // 对$进行处理, 否则会报错
    itemInfo.lowestPrice = priceoverview.body.lowest_price.replace('$', '')
    return calculatePrice(itemInfo)
  }
  else {
    const marketListings = await XHR<string>({
      method: 'GET',
      url: `/market/listings/${itemInfo.rgItem.description.appid}\
/${encodeURIComponent(W.GetMarketHashName(itemInfo.rgItem.description))}`
    })
    if (marketListings === undefined || marketListings.response.status !== 200) return stop()
    const marketLoadOrderSpread = marketListings.body.match(/Market_LoadOrderSpread\( (\d+)/)
    if (marketLoadOrderSpread === null) return stop()
    const itemordershistogram = await XHR<itemordershistogram>({
      method: 'GET',
      url: `/market/itemordershistogram/?country=US&language=english&currency=1&item_nameid=${marketLoadOrderSpread[1]}&two_factor=0`,
      responseType: 'json'
    })
    if (itemordershistogram?.body?.sell_order_graph[0] === undefined || itemordershistogram.response.status !== 200
      || itemordershistogram.body.success !== 1) return stop()
    itemInfo.lowestPrice = ' ' + itemordershistogram.body.sell_order_graph[0][0]
    return calculatePrice(itemInfo)
  }
}
/**
 * 计算价格
 * 
 * @param {ItemInfo} itemInfo 
 * @returns {ItemInfo} 
 */
function calculatePrice(itemInfo: ItemInfo): ItemInfo {
  // 格式化取整
  let price = W.GetPriceValueAsInt(<string>itemInfo.lowestPrice)
  const addCent = parseFloat(gInputAddCent.value) * 100
  // 汇率
  const exchangeRate = parseFloat(gInputUSDCNY.value)
  // 手续费
  const publisherFee = itemInfo.rgItem.description.market_fee || W.g_rgWalletInfo.wallet_publisher_fee_percent_default
  const feeInfo = W.CalculateFeeAmount(price, publisherFee)
  price = price - feeInfo.fees
  // 换算成人民币
  itemInfo.price = Math.floor((price + addCent) * exchangeRate)
  // 格式化
  itemInfo.formatPrice = W.v_currencyformat(itemInfo.price, W.GetCurrencyCode(W.g_rgWalletInfo.wallet_currency))
  return itemInfo
}
/**
 * 快速出售
 * 
 * @param {ItemInfo} itemInfo 
 * @returns {Promise < void>} 
 */
async function quickSellItem(itemInfo: ItemInfo): Promise<void> {
  itemInfo.status = 'run'
  const sellitem = await XHR<sellitem>({
    method: 'POST',
    url: 'https://steamcommunity.com/market/sellitem/',
    data: `sessionid=${W.g_sessionID}&appid=${itemInfo.rgItem.description.appid}\
&contextid=${itemInfo.rgItem.contextid}&assetid=${itemInfo.rgItem.assetid}&amount=1&price=${itemInfo.price}`,
    responseType: 'json',
    withCredentials: true
  })
  if (sellitem === undefined || sellitem.response.status !== 200 || !sellitem.body.success) itemInfo.status = 'error'
  else itemInfo.status = 'success'
}
/**
 * 批量出售采用轮询
 * 
 */
async function doLoop() {
  const itemInfo = gQuickSells.shift()
  const loop = () => {
    setTimeout(() => {
      doLoop()
    }, 500)
  }
  if (itemInfo !== undefined) {
    const priceOverview = await getPriceOverview(itemInfo)
    if (priceOverview !== 'error') {
      await quickSellItem(priceOverview)
      doLoop()
    }
    else loop()
  }
  else loop()
}
/**
 * 添加CSS
 * 
 */
function addCSS() {
  GM_addStyle(`
.scmpItemSelect {
  background: yellow;
}
.scmpItemRun {
  background: blue;
}
.scmpItemSuccess {
  background: green;
}
.scmpItemError {
  background: red;
}
.scmpItemCheckbox {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid yellow;
  opacity: 0.7;
  cursor: default;
}
.scmpItemCheckbox:hover {
  opacity: 1;
}
#scmpExch {
  width: 3.3em;
  -moz-appearance: textfield;
}
#scmpExch::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
#scmpAddCent {
  width: 3.9em;
}`)
}
/**
 * 使用Promise封装xhr
 * 因为上下文问题, GM_xmlhttpRequest为单独一项
 * fetch和GM_xmlhttpRequest兼容过于复杂, 所以使用XMLHttpRequest
 * 
 * @template T 
 * @param {XHROptions} XHROptions 
 * @returns {(Promise<response<T> | undefined>)} 
 */
function XHR<T>(XHROptions: XHROptions): Promise<response<T> | undefined> {
  return new Promise(resolve => {
    const onerror = (error: any) => {
      console.error(error)
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
/**
 * 物品信息
 * 
 * @class ItemInfo
 */
class ItemInfo {
  constructor(rgItem: rgItem, price?: number) {
    this.rgItem = rgItem
    if (price !== undefined) this.price = price
  }
  /**
   * rgItem
   * 
   * @type {rgItem}
   * @memberof ItemInfo
   */
  public rgItem: rgItem
  /**
   * 价格, 整数
   * 
   * @type {number}
   * @memberof ItemInfo
   */
  public price?: number
  /**
   * 价格, 格式化带单位
   * 
   * @type {string}
   * @memberof ItemInfo
   */
  public formatPrice?: string
  /**
   * 当前状态, 选择, 出售, 失败
   * 
   * @private
   * @type {string}
   * @memberof ItemInfo
   */
  private _status: string = ''
  public get status(): string {
    return this._status
  }
  public set status(valve: string) {
    this._status = valve
    const elmCheckbox = <HTMLDivElement | null>this.rgItem.element.querySelector('.scmpItemCheckbox')
    if (elmCheckbox === null) return
    switch (valve) {
      case 'run':
        elmCheckbox.classList.remove('scmpItemError')
        elmCheckbox.classList.remove('scmpItemSelect')
        elmCheckbox.classList.add('scmpItemRun')
        break
      case 'success':
        gSpanQuickSurplus.innerText = gQuickSells.length.toString()
        elmCheckbox.classList.remove('scmpItemError')
        elmCheckbox.classList.remove('scmpItemRun')
        elmCheckbox.classList.add('scmpItemSuccess')
        break
      case 'error':
        gSpanQuickSurplus.innerText = gQuickSells.length.toString()
        gSpanQuickError.innerText = (parseInt(gSpanQuickError.innerText) + 1).toString()
        elmCheckbox.classList.remove('scmpItemRun')
        elmCheckbox.classList.add('scmpItemError')
        elmCheckbox.classList.add('scmpItemSelect')
        break
      default:
        break
    }
  }
  /**
   * 最低价, 整数
   * 
   * @type {string}
   * @memberof ItemInfo
   */
  public lowestPrice?: string
}