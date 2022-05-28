type md5 = (string: string, key?: string, raw?: boolean) => string
type XHRheaders = Record<string, string>
/**
 * 二维码
 *
 * @interface authCode
 */
interface authCode {
  code: number
  message: string
  ttl: number
  data: authCodeData
}
interface authCodeData {
  url: string
  auth_code: string
}
/**
 * 确认
 *
 * @interface confirm
 */
interface confirm {
  code: number
  message: string
  ttl: number
  data: confirmData
}
interface confirmData {
  gourl: string
}
/**
 * 取到token
 *
 * @interface poll
 */
interface poll {
  code: number
  message: string
  ttl: number
  data: pollData
}
interface pollData {
  is_new: boolean
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
  token_info: pollDataTokenInfo
  cookie_info: pollDataCookieInfo
  sso: string[]
}
interface pollDataCookieInfo {
  cookies: pollDataCookieInfoCooky[]
  domains: string[]
}
interface pollDataCookieInfoCooky {
  name: string
  value: string
  http_only: number
  expires: number
}
interface pollDataTokenInfo {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}

export { md5, XHRheaders, authCode, confirm, pollData, poll }