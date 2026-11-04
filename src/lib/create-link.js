import { escapeHtml } from './escape-html.js';

/**
 * 設定に従って、URLとタイトルからコピーする文字列を作る。
 * @param {string} url
 * @param {string} title
 * @param {import('./options.js').Options} options
 * @returns {string}
 */
export function createLink(url, title, options) {
  const text = options.tidyTitle ? title.trim().replace(/\s+/g, ' ') : title;

  switch (options.format) {
    case 'markdown': {
      const safeUrl = url
        .replace(/ /g, '%20')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
      return `[${text.replace(/[[\]]/g, '\\$&')}](${safeUrl})`;
    }
    case 'url':
      return url;
    case 'title':
      return text;
    default: {
      const target = options.target ? ` target="${options.target}"` : '';
      const rel = options.noopener ? ' rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(url)}"${target}${rel}>${escapeHtml(text)}</a>`;
    }
  }
}
