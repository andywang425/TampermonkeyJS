// https://tampermonkey.net/documentation.php

/**
 * The unsafeWindow Object provides full access to the pages javascript functions and variables.
 */
declare const unsafeWindow: Window

/**
 * Get some info about the script and TM. 
 */
declare const GM_info: {
  downloadMode: string
  isIncognito: boolean
  script: GMInfoScript
  scriptHandler: string
  scriptMetaStr: string
  scriptSource: string
  scriptUpdateURL?: string
  scriptWillUpdate: boolean
  version: string
}
interface GMInfoScript {
  author: string
  blockers: string[]
  description: string
  description_i18n: GMInfoI18n
  downloadURL: string | null
  evilness: number
  excludes: string[]
  grant: string[]
  header: string
  homepage: string | null
  icon: string | null
  icon64: string | null
  includes: string[]
  lastModified: number
  matches: string[]
  name: string
  name_i18n: GMInfoI18n
  namespace: string
  options: GMInfoOptions
  position: number
  resources: GMInfoResources[]
  'run-at': string
  supportURL?: string
  sync: GMInfoSync
  unwrap: boolean
  updateURL: string | null
  uuid: string
  version: string
  webRequest: string | null
}
interface GMInfoI18n {
  [index: string]: string
}
interface GMInfoOptions {
  awareOfChrome: boolean
  check_for_updates: boolean
  comment: string | null
  compat_arrayleft: boolean
  compat_foreach: boolean
  compat_forvarin: boolean
  compat_metadata: boolean
  compat_prototypes: boolean
  compat_uW_gmonkey: boolean
  compat_wrappedjsObject: boolean
  compatopts_for_requires: boolean
  noframes: boolean | null
  override: GMInfoOverride
  run_at: string
}
interface GMInfoOverride {
  merge_connects: boolean
  merge_excludes: boolean
  merge_includes: boolean
  merge_matches: boolean
  orig_connects: string[]
  orig_excludes: string[]
  orig_includes: string[]
  orig_matches: string[]
  orig_noframes: boolean | null
  orig_run_at: string
  use_blockers: string[]
  use_connects: string[]
  use_excludes: string[]
  use_includes: string[]
  use_matches: string[]
}
interface GMInfoResources {
  content: string
  meta: string
  name: string
  url: string
}
interface GMInfoSync {
  imported: boolean
}

/**
 * GM_openInTab
 * 
 * @interface GMOpenInTabOptions
 */
interface GMOpenInTabOptions {
  /**
   * decides whether the new tab should be focused
   * 
   * @type {boolean}
   * @memberof GMOpenInTabOptions
   */
  active?: boolean
  /**
   * inserts the new tab after the current one
   * 
   * @type {boolean}
   * @memberof GMOpenInTabOptions
   */
  insert?: boolean
  /**
   * makes the browser re-focus the current tab on close.
   * 
   * @type {boolean}
   * @memberof GMOpenInTabOptions
   */
  setParent?: boolean
}
interface GMOpenInTabRetuens {
  close: () => void
  closed: boolean
  onclose: () => void
}

/**
 * GM_xmlhttpRequest
 * 
 * @interface GMXMLHttpRequestOptions
 */
interface GMXMLHttpRequestOptions {
  /**
   * one of GET, HEAD, POST
   *
   * @type {('GET' | 'HEAD' | 'POST')}
   * @memberof GMXMLHttpRequestOptions
   */
  method: 'GET' | 'HEAD' | 'POST'
  /**
   * the destination URL
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  url: string
  /**
   * ie. user-agent, referer, ... (some special headers are not supported by Safari and Android browsers)
   * 
   * @type {{ [index: string]: string | number }}
   * @memberof GMXMLHttpRequestOptions
   */
  headers?: { [index: string]: string | number }
  /**
   * some string to send via a POST request
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  data?: string
  /**
   * some string to send via a POST request
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  body?: string
  /**
   * send the data string in binary mode
   * 
   * @type {boolean}
   * @memberof GMXMLHttpRequestOptions
   */
  binary?: boolean
  /**
   * a timeout in ms
   * 
   * @type {number}
   * @memberof GMXMLHttpRequestOptions
   */
  timeout?: number
  /**
   * a property which will be added to the response Object
   * 
   * @type {*}
   * @memberof GMXMLHttpRequestOptions
   */
  context?: any
  /**
   * one of arraybuffer, blob, json
   * 
   * @type {XMLHttpRequestResponseType}
   * @memberof GMXMLHttpRequestOptions
   */
  responseType?: XMLHttpRequestResponseType
  /**
   * a MIME type for the request
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  overrideMimeType?: string
  /**
   * don't send cookies with the requests (please see the fetch notes)
   * 
   * @type {boolean}
   * @memberof GMXMLHttpRequestOptions
   */
  anonymous?: boolean
  /**
   * (beta) use a fetch instead of a xhr request
   * (at Chrome this causes xhr.abort, details.timeout and xhr.onprogress to not work and makes xhr.onreadystatechange receive only readyState 4 events)
   * 
   * @type {boolean}
   * @memberof GMXMLHttpRequestOptions
   */
  fetch?: boolean
  /**
   * a username for authentication
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  username?: string
  /**
   * a password
   * 
   * @type {string}
   * @memberof GMXMLHttpRequestOptions
   */
  password?: string
  /**
   * callback to be executed if the request was aborted
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onabort?: (response: GMXMLHttpRequestResponse) => void
  /**
   * callback to be executed if the request ended up with an error
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onerror?: (response: GMXMLHttpRequestResponse) => void
  /**
   * callback to be executed if the request was loaded
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onload?: (response: GMXMLHttpRequestResponse) => void
  /**
   * callback to be executed if the request started to load
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onloadstart?: (response: GMXMLHttpRequestResponse) => void
  /**
   * callback to be executed if the request made some progress
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onprogress?: (response: GMXMLHttpRequestProgressResponse) => void
  /**
   * callback to be executed if the request's ready state changed
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  onreadystatechange?: (response: GMXMLHttpRequestResponse) => void
  /**
   * callback to be executed if the request failed due to a timeout
   * 
   * @memberof GMXMLHttpRequestOptions
   */
  ontimeout?: ({ }) => void
}
interface GMXMLHttpRequestResponse {
  readonly context: any
  readonly finalUrl: string
  readonly readyState: number
  readonly response: ArrayBuffer | Blob | string | any
  readonly responseHeaders: string
  readonly responseText: string
  readonly responseXML: Document
  readonly status: number
  readonly statusText: string
}
interface GMXMLHttpRequestProgressResponse extends GMXMLHttpRequestResponse {
  readonly lengthComputable: boolean
  readonly loaded: number
  readonly total: number
}
interface GMXMLHttpRequestReturns {
  /**
   * function to be called to cancel this request
   * 
   * @memberof GMXMLHttpRequestReturns
   */
  abort(): void
}

/**
 * GM_download
 * 
 * @interface GMDownloadOptions
 */
interface GMDownloadOptions {
  /**
   * the URL from where the data should be downloaded
   * 
   * @type {string}
   * @memberof GMDownloadOptions
   */
  url: string
  /**
   * the filename - for security reasons the file extension needs to be whitelisted at the Tampermonkey options page
   * 
   * @type {string}
   * @memberof GMDownloadOptions
   */
  name: string
  /**
   * see GM_xmlhttpRequest for more details
   * 
   * @type {*}
   * @memberof GMDownloadOptions
   */
  headers?: any
  /**
   * boolean value, show a saveAs dialog
   * 
   * @type {boolean}
   * @memberof GMDownloadOptions
   */
  saveAs?: boolean
  /**
   * callback to be executed if the download ended up with an error
   * 
   * @memberof GMDownloadOptions
   */
  onerror?: (error: GMDownloadError) => void
  /**
   * callback to be executed if the download finished
   * 
   * @memberof GMDownloadOptions
   */
  onload?: ({ }) => void
  /**
   * callback to be executed if the download made some progress
   * 
   * @memberof GMDownloadOptions
   */
  onprogress?: (response: GMXMLHttpRequestProgressResponse) => void
  /**
   * callback to be executed if the download failed due to a timeout
   * 
   * @memberof GMDownloadOptions
   */
  ontimeout?: ({ }) => void
}
/**
 * not_enabled - the download feature isn't enabled by the user
 * not_whitelisted - the requested file extension is not whitelisted
 * not_permitted - the user enabled the download feature, but did not give the downloads permission
 * not_supported - the download feature isn't supported by the browser/version
 * not_succeeded - the download wasn't started or failed, the details attribute may provide more information
 * 
 * @interface GMDownloadError
 */
interface GMDownloadError {
  error: 'not_enabled' | 'not_whitelisted ' | 'not_permitted' | 'not_supported' | 'not_succeeded'
  details?: any
}
interface GMDownloadReturns {
  /**
   * function to be called to cancel this download
   * 
   * @memberof GMDownloadReturns
   */
  abort(): void
}

/**
 * GM_notification
 * 
 * @interface GMNotificationOptions
 */
interface GMNotificationOptions {
  /**
   * the text of the notification (optional if highlight is set)
   * 
   * @type {string}
   * @memberof GMNotificationOptions
   */
  text?: string
  /**
   * the notificaton title
   * 
   * @type {string}
   * @memberof GMNotificationOptions
   */
  title?: string
  /**
   * the image
   * 
   * @type {string}
   * @memberof GMNotificationOptions
   */
  image?: string
  /**
   * a boolean flag whether to highlight the tab that sends the notfication
   * 
   * @type {boolean}
   * @memberof GMNotificationOptions
   */
  highlight?: boolean
  /**
   * the time after that the notification will be hidden(ms, 0 = disabled)
   * 
   * @type {number}
   * @memberof GMNotificationOptions
   */
  timeout?: number
  /**
   * called when the notification is closed(no matter if this was triggered by a timeout or a click) or the tab was highlighted
   * 
   * @memberof GMNotificationOptions
   */
  ondone?: (click: boolean) => void
  /**
   * called in case the user clicks the notification
   * 
   * @memberof GMNotificationOptions
   */
  onclick?: (click: boolean) => void
}

/**
 * GM_setClipboard
 * 
 * @interface GMSetClipboardInfo
 */
interface GMSetClipboardInfo {
  type: string
  mimetype: string
}