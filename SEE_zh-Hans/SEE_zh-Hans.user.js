// ==UserScript==
// @name        SEE zh-Hans
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description SEE 中文化脚本
// @include     *://steamcommunity.com/id/*/inventory*
// @include     *://steamcommunity.com/profiles/*/inventory*
// @include     *://steamcommunity.com/market*
// @include     *://steamcommunity.com/tradeoffer*
// @require     https://github.com/lzghzr/TampermonkeyJS/raw/75a1a97c8b010f78f986fa2c56646e910af419e2/libReplaceText/libReplaceText.js#sha256-zjITNEjaUMqzPJSSjGkZp6J7uHKibg4dBo6BbnJjG/k=
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
const zh_Hans = [
  ['View in Community Market', '在社区市场中查看'],
  ['Price', '价格'],
  ['Quantity', '数量'],
  ['Sell', '出售'],
  ['Buy', '购买'],
  ['➜ Sell', '➜ 出售'],
  ['Sell All Items', '出售全部物品'],
  ['Sell Selected Items', '出售选定物品'],
  ['Sell All Cards', '出售全部卡牌'],
  ['Turn Selected Items Into Gems', '将选定物品分解为宝石'],
  ['Unpack Selected Booster Packs', '拆开选定补充包'],
  ['Reload Inventory', '重新加载库存'],
  ['This is likely the highest buy order price.', '这可能是当前最高的买价。'],
  ['Loading market listings', '加载交易列表中...'],
  ['Deselect all', '取消选择'],
  ['Select all', '选择全部'],
  ['Remove selected', '移除选定'],
  ['Relist selected', '重新上架选定物品'],
  ['Relist overpriced', '重新上架高价物品'],
  ['Select overpriced', '选择高价物品'],
  ['This is likely the highest buy order price.', '这可能是当前最高的买价。'],
  ['Calculate prices as the:\u00a0', '基准价格计算方式:\u00a0'],
  ['Maximum of the average history and lowest sell listing', '过去的均价 和 当前最低售价 两个数间取大值'],
  ['Lowest sell listing', '当前最低售价'],
  ['Highest current buy order or lowest sell listing', '当前最高订单价 或 当前最低售价'],
  ['Hours to use for the average history calculated price:\u00a0', '用于获取均价的小时数:\u00a0'],
  ['The value to add to the calculated price (minimum and maximum are respected):\u00a0', '自动调整价格 (请谨慎对待):\u00a0'],
  ['Use the second lowest sell listing when the lowest sell listing has a low quantity:\u00a0', '当前最低售价较少时，使用第二低售价。:\u00a0'],
  ['Show price labels in inventory:\u00a0', '在库存中显示价格标签:\u00a0'],
  ['Show price labels in trade offers:\u00a0', '在报价中显示价格标签:\u00a0'],
  ['Minimum:\u00a0', '最低售价:\u00a0'],
  ['\u00a0and maximum:\u00a0', '\u00a0最高售价:\u00a0'],
  ['\u00a0price for normal cards', '\u00a0普通卡牌的售价'],
  ['\u00a0price for foil cards', '\u00a0闪亮卡牌的售价'],
  ['\u00a0price for other items', '\u00a0其他物品的售价'],
  ['Market items per page:\u00a0', '每页的物品数量:\u00a0'],
  ['Automatically relist overpriced market listings (slow on large inventories):\u00a0', '自动重新上架售价过高的物品:\u00a0'],
  [/^Total listed for ([\d\.]+)¥, you will receive ([\d\.]+)¥\.$/, '统计 已添加至市场 ¥ $1，你将会收到 ¥ $2。'],
  [/^Processing (\d+) items$/, '正在处理 $1 个物品'],
  [/^Sell (\d+) Items?$/, '出售 $1 个物品'],
  [/^Turn (\d+) Items? Into Gems$/, '分解 $1 个物品为宝石'],
  [/^Unpack (\d+) Booster Packs?$/, '拆开 $1 个补充包'],
  [/^The best price is ([\d\.]+)¥\.$/, '最好的价格是 ¥ $1'],
  [/listed for ([\d\.]+)¥, you will receive ([\d\.]+)¥\.$/, '以 ¥ $1 添加至市场，你将会收到 ¥ $2。'],
  [/not added to market because (.*)$/, '上架市场失败，因为 $1'],
  [/not added to market\.$/, '上架市场失败。'],
  [/turned into (\d+) gems\.$/, '已分解为 $1 个宝石。'],
  [/not unpacked\.$/, '拆包失败。'],
  [/unpacked\.$/, '拆包成功。'],
  [/or more$/, '或更高'],
  [/or less$/, '或更低'],
  [/([\d\.]+)¥/g, '¥ $1']
];
new ReplaceText(zh_Hans, 'regexp');