/**
 * textarea と execCommand でクリップボードにコピーする。
 * ポップアップ内で確実にコピーするため、navigator.clipboard は使わない。
 * @param {string} text
 * @returns {boolean} コピーに成功したか
 */
export function copyText(text) {
  const textarea = document.createElement('textarea');
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

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);
  return successful;
}
