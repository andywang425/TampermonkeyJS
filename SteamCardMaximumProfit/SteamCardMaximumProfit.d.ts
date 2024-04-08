declare global {
  interface Window {
    iActiveSelectView: number
    g_rgWalletInfo: rgWalletInfo
    g_sessionID: string
    CalculateFeeAmount(amount: number, publisherFee: string): feeAmount
    GetCurrencyCode(currencyId: number): string
    GetMarketHashName(rgDescriptionData: description): string
    GetPriceValueAsInt(strAmount: string): number
    v_currencyformat(valueInCents: number, currencyCode: string): string
  }
}
declare global {
  interface Node {
    rgItem: rgItem
    wrappedJSObject: wrappedJSObject
  }
}
// 兼容火狐
interface wrappedJSObject {
  rgItem: rgItem
}
// 物品信息
interface rgItem {
  appid: string
  assetid: string
  contextid: string
  description: description
  element: HTMLDivElement
}
// 物品描述
interface description {
  appid: number
  market_fee: string
  marketable: number
}
// 手续费
interface feeAmount {
  steam_fee: number
  publisher_fee: number
  fees: number
  amount: number
}
// 钱包
interface rgWalletInfo {
  wallet_currency: number
  wallet_country: string
  wallet_fee: number
  wallet_fee_minimum: number
  wallet_fee_percent: string
  wallet_publisher_fee_percent_default: string
  wallet_fee_base: number
  wallet_balance: number
  wallet_delayed_balance: number
  wallet_max_balance: number
  wallet_trade_max_balance: number
  success: boolean
  rwgrsn: number
}
// 百度汇率
interface baiduExch {
  ResultCode: number
  ResultNum: number
  QueryID: string
  Result: baiduExchResult
}
interface baiduExchResult {
  pankouinfos: baiduExchResultPankouinfos
}
interface baiduExchResultPankouinfos {
  indicatorTitle: string
  indicatorUrl: string
  list: baiduExchResultPankouinfosList[]
}
interface baiduExchResultPankouinfosList {
  ename: string
  name: string
  value: string
  status: string
  originValue: string
}
// 物品价格
interface priceoverview {
  success: boolean
  lowest_price: string
  volume: string
  median_price: string
}
// 商店物品价格
interface itemordershistogram {
  success: number
  sell_order_table: string
  sell_order_summary: string
  buy_order_table: string
  buy_order_summary: string
  highest_buy_order: string
  lowest_sell_order: string
  buy_order_graph: any[][]
  sell_order_graph: any[][]
  graph_max_y: number
  graph_min_x: number
  graph_max_x: number
  price_prefix: string
  price_suffix: string
}
// 上架信息
interface sellitem {
  success: boolean
  requires_confirmation: number
  needs_mobile_confirmation: boolean
  needs_email_confirmation: boolean
  email_domain: string
}
export { baiduExch, priceoverview, itemordershistogram, sellitem, rgItem }