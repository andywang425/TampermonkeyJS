// XHROptions
interface XHROptions extends GMXMLHttpRequestOptions {
  GM?: boolean
  withCredentials?: boolean
}
// XHR返回
interface response<T> {
  response: XMLHttpRequest | GMXMLHttpRequestResponse
  body: T
}