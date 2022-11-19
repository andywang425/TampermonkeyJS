// ==UserScript==
// @name        BlueStacksFullInstaller
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.1.0
// @author      lzghzr
// @description 下载BlueStacks离线安装包
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       https://www.bluestacks.com/download.html
// @connect     cloud.bluestacks.com
// @connect     cdn3.bluestacks.com
// @license     MIT
// @grant       GM_xmlhttpRequest
// @run-at      document-body
// ==/UserScript==
const bodyObserver = new MutationObserver(mutations => {
  mutations.forEach(async (mutation) => {
    if (mutation.target instanceof HTMLAnchorElement) {
      if (mutation.target.href.includes('nxt-bs5-n32_button_download')) {
        mutation.target.href = await installerReplace(mutation.target.href, 'FullInstaller/x86/BlueStacksFullInstaller', 'x86_native');
      }
      else if (mutation.target.href.includes('nxt-bs5-n64_button_download')) {
        mutation.target.href = await installerReplace(mutation.target.href, 'FullInstaller/x64/BlueStacksFullInstaller', 'amd64_native');
      }
    }
  });
});
bodyObserver.observe(document.body, { attributeFilter: ['href'], subtree: true });
function installerReplace(url, BlueStacksMicroInstaller, native) {
  return new Promise(resolve => {
    const get = GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: response => {
        get.abort();
        const href = response.finalUrl.split('?')[0];
        const fullInstaller = href.replace('BlueStacksMicroInstaller', BlueStacksMicroInstaller).replace('native', native);
        resolve(fullInstaller);
      }
    });
  });
}