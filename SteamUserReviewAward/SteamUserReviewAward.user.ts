// ==UserScript==
// @name        steam社区自荐
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.2
// @author      lzghzr
// @description steam社区为自己的评论推荐
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       *://steamcommunity.com/*/recommended*
// @license     MIT
// @grant       none
// @run-at      document-end
// ==/UserScript==
export { }


const reviewBox = document.body.querySelectorAll('.review_box')
if (reviewBox.length !== 0) {
  reviewBox.forEach(review => {
    const header = review.querySelector('.header')
    const recommendationID = review.innerHTML.match(/OnReviewVisibilityChange\( '(\d+)'/)
    if (header !== null && recommendationID !== null)
      header.innerHTML += `<span onclick="fnLoyalty_ShowAwardModal( '${recommendationID[1]}', OnUserReviewAward )" class="btn_grey_grey btn_small_thin ico_hover">
  <span><img src="https://steamcommunity-a.akamaihd.net/public/shared/images//award_icon.svg" class="reward_btn_icon">奖励</span>
  </span>`
  })
}
else {
  const templateContent = document.body.querySelector('.responsive_page_template_content')
  if (templateContent !== null) {
    const ratingBar = templateContent.querySelector('.ratingBar')
    const recommendationID = templateContent.innerHTML.match(/UserReview_Report\( '(\d+)'/)
    if (ratingBar !== null && recommendationID !== null)
      ratingBar.innerHTML += `<span onclick="fnLoyalty_ShowAwardModal( '${recommendationID[1]}', OnUserReviewAward )" class="btn_grey_grey btn_small_thin ico_hover">
    <span><img src="https://steamcommunity-a.akamaihd.net/public/shared/images//award_icon.svg" class="reward_btn_icon">奖励</span>
    </span>`
  }
}