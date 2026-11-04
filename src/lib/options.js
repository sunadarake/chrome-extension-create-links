/**
 * @typedef {object} Options
 * @property {'html' | 'markdown' | 'url' | 'title'} format 出力形式
 * @property {'' | '_blank' | '_self'} target `<a>` の target。空なら属性を出さない
 * @property {boolean} noopener `rel="noopener noreferrer"` を付けるか
 * @property {boolean} tidyTitle タイトルの空白を整えるか
 */

// 設定を触らなければ従来の出力（target="_blank" 付きの <a>）になる値
/** @type {Options} */
export const DEFAULT_OPTIONS = {
  format: 'html',
  target: '_blank',
  noopener: false,
  tidyTitle: false,
};

/** @returns {Promise<Options>} */
export async function loadOptions() {
  return /** @type {Promise<Options>} */ (
    chrome.storage.local.get(DEFAULT_OPTIONS)
  );
}

/** @param {Options} options */
export async function saveOptions(options) {
  await chrome.storage.local.set(options);
}
