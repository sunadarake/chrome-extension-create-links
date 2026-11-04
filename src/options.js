import { createLink } from './lib/create-link.js';
import { DEFAULT_OPTIONS, loadOptions, saveOptions } from './lib/options.js';

// プレビューに使うサンプル。空白の整形が見えるよう、タイトルには余分な空白を入れる
const SAMPLE_URL = 'https://example.com/page?a=1&b=2';
const SAMPLE_TITLE = '  サンプル   [ページ] のタイトル ';

/**
 * 設定を画面に反映し、変更を即保存する。
 * @param {object} deps
 * @param {() => Promise<import('./lib/options.js').Options>} deps.load
 * @param {(options: import('./lib/options.js').Options) => Promise<void>} deps.save
 * @param {ParentNode} deps.root
 */
export async function init({ load, save, root }) {
  /** @param {string} selector */
  const $ = (selector) =>
    /** @type {HTMLInputElement} */ (root.querySelector(selector));
  const target = /** @type {HTMLSelectElement} */ (
    root.querySelector('#target')
  );
  const noopener = $('#noopener');
  const tidyTitle = $('#tidy-title');
  const formats = /** @type {NodeListOf<HTMLInputElement>} */ (
    root.querySelectorAll('input[name="format"]')
  );
  const htmlOptions = /** @type {HTMLFieldSetElement} */ (
    root.querySelector('#html-options')
  );
  const preview = /** @type {HTMLElement} */ (root.querySelector('#preview'));
  const status = /** @type {HTMLElement} */ (root.querySelector('#status'));

  /** @returns {import('./lib/options.js').Options} */
  const read = () => ({
    format: /** @type {import('./lib/options.js').Options['format']} */ (
      [...formats].find((radio) => radio.checked)?.value
    ),
    target: /** @type {import('./lib/options.js').Options['target']} */ (
      target.value
    ),
    noopener: noopener.checked,
    tidyTitle: tidyTitle.checked,
  });

  /** @param {import('./lib/options.js').Options} options */
  const render = (options) => {
    formats.forEach((radio) => {
      radio.checked = radio.value === options.format;
    });
    target.value = options.target;
    noopener.checked = options.noopener;
    tidyTitle.checked = options.tidyTitle;
    htmlOptions.disabled = options.format !== 'html';
    preview.textContent = createLink(SAMPLE_URL, SAMPLE_TITLE, options);
  };

  render(await load());

  root.addEventListener('change', async () => {
    const options = read();
    render(options);
    await save(options);
    status.textContent = '保存しました';
  });

  root.querySelector('#reset')?.addEventListener('click', async () => {
    render(DEFAULT_OPTIONS);
    await save(DEFAULT_OPTIONS);
    status.textContent = '初期値に戻しました';
  });
}

document.addEventListener('DOMContentLoaded', () =>
  init({ load: loadOptions, save: saveOptions, root: document }),
);
