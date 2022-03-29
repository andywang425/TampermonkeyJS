// ==UserScript==
// @name        ajax-proxy
// @namespace   https://github.com/LazyDuke/ajax-proxy
// @version     1.0.2
// @author      wendux
// @description ajax-proxy source code: https://github.com/LazyDuke/ajax-proxy
// @match       *://*/*
// @run-at      document-start
// ==/UserScript==

const ajaxProxy = (W => {
  'use strict';

  /**
   * @description Ajax hook refactor by es6 proxy.
   * @author Lazy Duke
   * @email weiguocai.fzu@gmail.com
   * @class AjaxProxy
   */
  class AjaxProxy {
    constructor() {
      /**
       * @description 代理 Ajax 的方法，调用这个方法开始代理原生 XMLHttpRequest 对象
       * @author Lazy Duke
       * @date 2019-10-27
       * @param {ProxyMap} proxyMap
       * @returns
       */
      this.proxyAjax = (proxyMap) => {
        // 参数校验
        if (proxyMap == null) {
          throw new TypeError('proxyMap can not be undefined or null');
        }
        // 缓存操作，并防止多重代理
        this.RealXMLHttpRequest =
          this.RealXMLHttpRequest || W['XMLHttpRequest'];
        this.realXMLHttpRequest =
          this.realXMLHttpRequest || new W['XMLHttpRequest']();
        const that = this;
        // 代理 XMLHttpRequest 对象
        const proxy = new Proxy(this.RealXMLHttpRequest, {
          // 代理 new 操作符
          construct(Target) {
            const xhr = new Target();
            // 代理 XMLHttpRequest 对象实例
            const xhrProxy = new Proxy(xhr, {
              // 代理 读取属性 操作
              get(target, p, receiver) {
                let type = '';
                try {
                  type = typeof that.realXMLHttpRequest[p]; // 在某些浏览器可能会抛出错误
                }
                catch (error) {
                  console.error(error);
                  return target[p];
                }
                // 代理一些属性诸如 response, responseText...
                if (type !== 'function') {
                  // 通过缓存属性值进 _xxx，代理一些 只读属性
                  const v = that.hasOwnProperty(`_${p.toString()}`)
                    ? that[`_${p.toString()}`]
                    : target[p];
                  const attrGetterProxy = (proxyMap[p] || {})['getter'];
                  return ((typeof attrGetterProxy === 'function' &&
                    attrGetterProxy.call(target, v, receiver)) ||
                    v);
                }
                // 代理一些属性诸如 open, send...
                return (...args) => {
                  let newArgs = args;
                  if (proxyMap[p]) {
                    const result = proxyMap[p].call(target, args, receiver);
                    // 返回值为 true，终止方法
                    if (result === true) {
                      return;
                    }
                    // 返回其他 truthy 值，当做新参数传入
                    if (result) {
                      newArgs =
                        typeof result === 'function'
                          ? result.call(target, ...args)
                          : result;
                    }
                  }
                  return target[p].call(target, ...newArgs);
                };
              },
              // 代理 设置属性值 操作
              set(target, p, value, receiver) {
                let type = '';
                try {
                  type = typeof that.realXMLHttpRequest[p]; // 在某些浏览器可能会抛出错误
                }
                catch (error) {
                  console.error(error);
                }
                // 禁止修改一些原生方法如 open,send...
                if (type === 'function') {
                  throw new Error(`${p.toString()} in XMLHttpRequest can not be reseted`);
                }
                // 代理一些事件属性诸如 onreadystatechange,onload...
                if (typeof proxyMap[p] === 'function') {
                  target[p] = () => {
                    proxyMap[p].call(target, receiver) || value.call(receiver);
                  };
                }
                else {
                  // 代理一些属性如 response, responseText
                  const attrSetterProxy = (proxyMap[p] || {})['setter'];
                  try {
                    target[p] =
                      (typeof attrSetterProxy === 'function' &&
                        attrSetterProxy.call(target, value, receiver)) ||
                      (typeof value === 'function' ? value.bind(receiver) : value);
                  }
                  catch (error) {
                    // 代理只读属性是会抛出错误
                    if (attrSetterProxy === true) {
                      // 如果该 只读属性 的 代理setter 为 true
                      // 将 value 缓存进 _xxx
                      that[`_${p.toString()}`] = value;
                    }
                    else {
                      throw error;
                    }
                  }
                }
                return true;
              }
            });
            return xhrProxy;
          }
        });
        W['XMLHttpRequest'] = proxy;
        return this.RealXMLHttpRequest;
      };
      /**
       * @description 取消代理 Ajax 的方法，调用这个方法取消代理原生 XMLHttpRequest 对象
       * @author Lazy Duke
       * @date 2019-10-27
       * @returns
       */
      this.unProxyAjax = () => {
        if (this.RealXMLHttpRequest) {
          W['XMLHttpRequest'] = this.RealXMLHttpRequest;
        }
        this.RealXMLHttpRequest = undefined;
      };
    }
  }
  const ajaxProxy = new AjaxProxy();

  return ajaxProxy;

})(typeof unsafeWindow === 'undefined' ? window : unsafeWindow)