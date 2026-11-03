/** @type {Record<string, string>} */
const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

/**
 * HTML特殊文字をエスケープする。
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}
