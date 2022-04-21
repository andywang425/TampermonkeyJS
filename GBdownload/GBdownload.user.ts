// ==UserScript==
// @name        gb688下载
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     2.1.1
// @author      lzghzr
// @description 下载gb688.cn上的国标文件
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       *://*.gb688.cn/bzgk/gb/newGbInfo*
// @match       *://*.samr.gov.cn/bzgk/gb/newGbInfo*
// @connect     c.gb688.cn
// @require     https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// ==/UserScript==
import { GM_xmlhttpRequest } from '../@types/tm_f'
import * as CryptoJS from 'crypto-js'

// 获取预览按钮
const online = document.querySelector('button.btn.ck_btn.btn-sm.btn-primary')
if (online === null || (<HTMLElement>online).innerText !== '在线预览') throw '没有预览, 没有下载'
// 获取下载按钮
const download = document.querySelector('button.btn.xz_btn.btn-sm.btn-warning')
if (download !== null) download.remove()
// 添加下载按钮
const GBdownload = document.createElement('button')
GBdownload.style.cssText = 'margin-right:20px'
GBdownload.className = 'btn xz_btn btn-sm btn-warning'
GBdownload.innerText = '下载标准'
online.insertAdjacentElement('afterend', GBdownload)
// 读取hcno值
const hcno = (<HTMLElement>online).dataset.value
if (hcno === null) {
  GBdownload.innerText = '未获取到hcno'
  throw '未获取到hcno'
}
// 处理点击
GBdownload.onclick = async () => {
  const header = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
    'Connection': 'keep-alive',
    'DNT': 1,
    'Referer': 'http://openstd.samr.gov.cn/',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36}'
  }

  // 获取文件名
  const GBname = document.body.innerText.match(/标准号：(?<id>.*?)\n中文标准名称：(?<name>.*?)\s\n/)
  if (GBname === null) {
    GBdownload.innerText = '文件名获取失败'
    throw '文件名获取失败'
  }
  GBdownload.innerText = '下载中...0%'
  const { id, name } = <{ [index: string]: string }>GBname.groups
  // 获取密码
  const password = await XHR<string>({
    GM: true,
    method: 'GET',
    url: `http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=${hcno}`,
    headers: Object.assign({}, header, {
      'Cache-Control': 'max-age=0',
    }),
    responseType: 'text'
  })
  if (password === undefined || password.response.status !== 200) {
    GBdownload.innerText = '密码获取失败'
    throw '密码获取失败'
  }
  // 提取密码
  const encryptedData = password.body.match(/HCNO = "(.*?)";/)
  if (encryptedData === null) {
    GBdownload.innerText = '提取密码失败'
    throw '提取密码失败'
  }
  // 解析密码
  const encrypted = encryptedData[1]
  const key = CryptoJS.enc.Latin1.parse('k092zd51r35bw271')
  const iv = CryptoJS.enc.Latin1.parse('780eo9k3vv2juu65')
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv })
  const decoded = decrypted.toString(CryptoJS.enc.Utf8)

  const decryptedData = decoded.match(/(?<key>.{16}):(?<iv>.{16}):(?<hcno>.{32})/)
  if (decryptedData === null || decryptedData.groups === undefined) {
    GBdownload.innerText = '解析密码失败'
    throw '解析密码失败'
  }
  const { key: newKEY, iv: newIV, hcno: newHCNO } = decryptedData.groups
  // // 获取文件大小
  const size = await XHR<string>({
    GM: true,
    // 此处应为GET, 但由于未知原因, 使用GET时无法获取headers
    method: 'HEAD',
    url: `http://c.gb688.cn/bzgk/gb/viewGb?type=online&hcno=${newHCNO}`,
    headers: Object.assign({}, header, {
      'Accept': '*/*',
      'Referer': `http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=${hcno}`,
    })
  })
  if (size === undefined || size.response.status !== 200) {
    GBdownload.innerText = '文件大小获取失败'
    throw '文件大小获取失败'
  }
  // 解析文件大小
  const sizeHeader = (<GMXMLHttpRequestResponse>size.response).responseHeaders
  const bytes = sizeHeader.match(/bytes 0-\d+\/(\d+)/)
  if (bytes === null) {
    GBdownload.innerText = '文件大小解析失败'
    throw '文件大小解析失败'
  }
  // 下载文件, 最好分段下载
  const len = Number(bytes[1])
  const loop = Math.ceil(len / 327680)
  const progress: number[] = []
  const loading = () => {
    const loaded = progress.reduce((acc, cur) => acc + cur) / loop * 100
    GBdownload.innerText = `下载中...${loaded.toFixed(2)}%`
  }

  const chunks: Uint8Array[] = []
  const pdfKEY = CryptoJS.enc.Latin1.parse(newKEY)
  const pdfIV = CryptoJS.enc.Latin1.parse(newIV)
  for (let i = 0; i < loop; i++) {
    const encryptedPDF = await XHR<string>({
      GM: true,
      method: 'GET',
      url: `http://c.gb688.cn/bzgk/gb/viewGb?type=online&hcno=${newHCNO}`,
      headers: Object.assign({}, header, {
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Range': `bytes=${327680 * i}-${Math.min(327680 * (i + 1) - 1, len - 1)}`,
        'Referer': `http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=${hcno}`,
      }),
      responseType: 'text',
      onprogress: ev => {
        progress[i] = ev.loaded / ev.total
        loading()
      }
    })
      .then(view => {
        if (view === undefined || (view.response.status !== 200 && view.response.status !== 206)) {
          GBdownload.innerText = '文件获取失败'
          throw '文件获取失败'
        }
        return view.body
      })
    // 解密文件
    const decryptedPDF = CryptoJS.AES.decrypt(encryptedPDF, pdfKEY, { iv: pdfIV })
    chunks.push(CryptJsWordArrayToUint8Array(decryptedPDF))
  }
  const pdf = new Blob(chunks, { type: 'application/pdf' })
  const blobURL = URL.createObjectURL(pdf)

  const PDFname = `${id}(${name}).pdf`
  const windowsName = PDFname.replaceAll('\\', '＼').replaceAll('/', '／').replaceAll(':', '：').replaceAll('*', '＊').replaceAll('?', '？').replaceAll('"', '＂').replaceAll('<', '＜').replaceAll('>', '＞').replaceAll('|', '｜')

  const tempLink = document.createElement('a')
  tempLink.download = windowsName
  tempLink.href = blobURL
  tempLink.click()
  GBdownload.innerText = '下载标准'
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
      // @ts-ignore
      if (XHROptions.onprogress !== undefined) xhr.onprogress = ev => XHROptions.onprogress(ev)
      xhr.onerror = onerror
      xhr.ontimeout = onerror
      xhr.send(XHROptions.data)
    }
  })
}
/**
 * Converts a cryptjs WordArray to native Uint8Array
 *
 * @param {CryptoJS.lib.WordArray} wordArray
 * @returns
 */
function CryptJsWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray) {
  const l = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(l);
  var i = 0 /*dst*/, j = 0 /*src*/;
  while (true) {
    // here i is a multiple of 4
    if (i == l)
      break;
    var w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l)
      break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l)
      break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l)
      break;
    result[i++] = (w & 0x000000ff);
  }
  return result;
}
