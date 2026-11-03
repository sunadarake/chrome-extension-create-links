/**
 * textarea と execCommand でクリップボードにコピーする。
 * ポップアップ内で確実にコピーするため、navigator.clipboard は使わない。
 * @param {string} text
 * @param {Document} [doc]
 * @returns {boolean} コピーに成功したか
 */
export function copyText(text, doc = document) {
  const textarea = doc.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.padding = '0';
  textarea.style.border = 'none';
  textarea.style.outline = 'none';
  textarea.style.boxShadow = 'none';
  textarea.style.background = 'transparent';

  doc.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const successful = doc.execCommand('copy');
  doc.body.removeChild(textarea);
  return successful;
}
