export class ajaxProxy {
  static proxyAjax: (proxyMap: ProxyMap) => XMLHttpRequest
  static unProxyAjax: () => void
}
declare global {
  interface Window {
    webpackJsonp: unknown[]
  }
}