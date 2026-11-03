import { createLinkHtml } from './lib/create-link.js';
import { copyText } from './lib/copy-text.js';

// コピー成功のメッセージを見せてからポップアップを閉じるまでの時間
export const CLOSE_DELAY_MS = 500;

/**
 * 現在のタブのリンクをコピーし、結果を表示する。
 * @param {object} deps
 * @param {() => Promise<{url: string, title: string}[]>} deps.queryTabs
 * @param {(text: string) => boolean} deps.copy
 * @param {HTMLElement} deps.messageEl
 * @param {() => void} deps.close
 */
export async function run({ queryTabs, copy, messageEl, close }) {
  try {
    const [tab] = await queryTabs();

    if (!tab) {
      throw new Error('タブが見つかりません');
    }

    if (!copy(createLinkHtml(tab.url, tab.title))) {
      throw new Error('コピーに失敗しました');
    }

    messageEl.textContent = 'コピーしました';
    setTimeout(close, CLOSE_DELAY_MS);
  } catch (error) {
    messageEl.textContent = `エラー: ${/** @type {Error} */ (error).message}`;
  }
}

document.addEventListener('DOMContentLoaded', () =>
  run({
    // activeTab 権限でポップアップを開いたタブは url と title が必ず取れる
    queryTabs: () =>
      /** @type {Promise<{url: string, title: string}[]>} */ (
        chrome.tabs.query({ active: true, currentWindow: true })
      ),
    copy: copyText,
    messageEl: /** @type {HTMLElement} */ (document.getElementById('message')),
    close: () => window.close(),
  }),
);
