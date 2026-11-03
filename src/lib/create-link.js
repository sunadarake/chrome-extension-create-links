import { escapeHtml } from './escape-html.js';

/**
 * URLとタイトルから `<a>` タグの文字列を作る。
 * @param {string} url
 * @param {string} title
 * @returns {string}
 */
export function createLinkHtml(url, title) {
  return `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(title)}</a>`;
}
