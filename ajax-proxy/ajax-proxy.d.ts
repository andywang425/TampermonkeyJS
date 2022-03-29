interface ProxyMap {
  readyState?: AttrProxy<number>
  response?: AttrProxy<any>
  responseText?: AttrProxy<string>
  responseType?: AttrProxy<XMLHttpRequestResponseType>
  responseURL?: AttrProxy<string>
  responseXML?: AttrProxy<Document | null>
  status?: AttrProxy<number>
  statusText?: AttrProxy<string>
  timeout?: AttrProxy<number>
  withCredentials?: AttrProxy<boolean>
  upload?: AttrProxy<XMLHttpRequestUpload>
  UNSENT?: AttrProxy<number>
  OPENED?: AttrProxy<number>
  HEADERS_RECEIVED?: AttrProxy<number>
  LOADING?: AttrProxy<number>
  DONE?: AttrProxy<number>

  onreadystatechange?: (xhr: FullWritableXMLHTTPRequest) => void
  onabort?: (xhr: FullWritableXMLHTTPRequest) => void
  onerror?: (xhr: FullWritableXMLHTTPRequest) => void
  onload?: (xhr: FullWritableXMLHTTPRequest) => void
  onloadend?: (xhr: FullWritableXMLHTTPRequest) => void
  onloadstart?: (xhr: FullWritableXMLHTTPRequest) => void
  onprogress?: (xhr: FullWritableXMLHTTPRequest) => void
  ontimeout?: (xhr: FullWritableXMLHTTPRequest) => void

  open?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  abort?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  getAllResponseHeaders?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  getResponseHeader?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  overrideMimeType?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  send?: (args: any[], xhr: FullWritableXMLHTTPRequest) => boolean | void | any
  setRequestHeader?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  addEventListener?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
  removeEventListener?: (
    args: any[],
    xhr: FullWritableXMLHTTPRequest
  ) => boolean | void | any
}

interface AttrProxy<T> {
  setter?: boolean | SetGetFn<T>
  getter?: boolean | SetGetFn<T>
}

interface SetGetFn<T> {
  (this: XMLHttpRequest, value: T, xhr: XMLHttpRequest): T
}

type FullWritableXMLHTTPRequest = XMLHttpRequestUpload & WtritableAttrs
interface WtritableAttrs {
  readyState: number
  response: any
  responseText: string
  responseURL: string
  responseXML: Document | null
  status: number
  statusText: string
  upload: XMLHttpRequestUpload
  DONE: number
  HEADERS_RECEIVED: number
  LOADING: number
  OPENED: number
  UNSENT: number
}