/// <reference types="vite/client" />
import { beforeEach, describe, expect, it, vi } from 'vitest';
import html from './options.html?raw';
import { init } from './options.js';
import { DEFAULT_OPTIONS } from './lib/options.js';

/** @param {string} selector */
const q = (selector) =>
  /** @type {HTMLInputElement} */ (document.querySelector(selector));

describe('options page', () => {
  /** @type {import('vitest').Mock} */
  let save;

  beforeEach(() => {
    document.body.innerHTML = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    save = vi.fn(async () => {});
  });

  it('読み込んだ設定を画面に反映する', async () => {
    await init({
      load: async () => ({
        format: 'markdown',
        target: '_self',
        noopener: true,
        tidyTitle: true,
      }),
      save,
      root: document,
    });

    expect(q('input[value="markdown"]').checked).toBe(true);
    expect(q('#target').value).toBe('_self');
    expect(q('#noopener').checked).toBe(true);
    expect(q('#tidy-title').checked).toBe(true);
    expect(q('#preview').textContent).toBe(
      '[サンプル \\[ページ\\] のタイトル](https://example.com/page?a=1&b=2)',
    );
  });

  it('HTML 以外では target と rel の設定を無効にする', async () => {
    await init({ load: async () => DEFAULT_OPTIONS, save, root: document });
    expect(q('#html-options').disabled).toBe(false);

    q('input[value="url"]').click();

    expect(q('#html-options').disabled).toBe(true);
  });

  it('変更すると即保存し、プレビューを更新する', async () => {
    await init({ load: async () => DEFAULT_OPTIONS, save, root: document });

    q('#noopener').click();
    await vi.waitFor(() => expect(save).toHaveBeenCalled());

    expect(save).toHaveBeenCalledWith({ ...DEFAULT_OPTIONS, noopener: true });
    expect(q('#preview').textContent).toContain('rel="noopener noreferrer"');
    expect(q('#status').textContent).toBe('保存しました');
  });

  it('初期値に戻す', async () => {
    await init({
      load: async () => ({ ...DEFAULT_OPTIONS, format: 'title' }),
      save,
      root: document,
    });

    q('#reset').click();
    await vi.waitFor(() => expect(save).toHaveBeenCalled());

    expect(save).toHaveBeenCalledWith(DEFAULT_OPTIONS);
    expect(q('input[value="html"]').checked).toBe(true);
  });
});
